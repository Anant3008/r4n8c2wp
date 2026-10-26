"""
Elexon BMRS Data Ingestion Script for January 2026.

Fetches:
1. FUELHH: Half-hourly actual wind generation (fuelType=WIND) for 2026-01-01 to 2026-01-31.
2. WINDFOR: Wind generation forecasts published for January 2026 delivery intervals.

Validates:
- Preserves all publication timestamps (publishTime) and delivery interval start times (startTime).
- Identifies and removes duplicate records.
- Identifies missing delivery intervals (expecting 1,488 half-hour settlement periods).
- Distinguishes missing values (None / NaN) from genuine zero generation.

Saves:
- backend/data/actuals_fuelhh.parquet
- backend/data/forecasts_windfor.parquet
"""

from datetime import date, datetime, timedelta, timezone
from pathlib import Path
import sys
import httpx
import numpy as np
import pandas as pd

BMRS_BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

JANUARY_2026_START = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
DELIVERY_WINDOW_END = datetime(2026, 2, 1, 23, 30, 0, tzinfo=timezone.utc)
TOTAL_EXPECTED_PERIODS = 32 * 48  # 1,536 settlement periods (Jan 1 - Feb 1 delivery)


def generate_expected_intervals() -> list[str]:
    """Generate all 1,536 half-hourly ISO UTC timestamps covering Jan 1 to Feb 1."""
    intervals = []
    curr = JANUARY_2026_START
    while curr <= DELIVERY_WINDOW_END:
        intervals.append(curr.strftime("%Y-%m-%dT%H:%M:%SZ"))
        curr += timedelta(minutes=30)
    return intervals


def fetch_fuelhh_actuals(client: httpx.Client) -> pd.DataFrame:
    """Fetch FUELHH actual wind generation from 2026-01-01 through 2026-02-01 in 7-day chunks."""
    print("-> Fetching FUELHH actual wind generation...")
    records = []
    curr_date = date(2026, 1, 1)
    end_date = date(2026, 2, 1)

    while curr_date <= end_date:
        chunk_end = min(curr_date + timedelta(days=6), end_date)
        params = {
            "settlementDateFrom": curr_date.isoformat(),
            "settlementDateTo": chunk_end.isoformat(),
            "fuelType": "WIND",
        }
        resp = client.get(f"{BMRS_BASE_URL}/FUELHH", params=params)
        resp.raise_for_status()
        chunk_data = resp.json().get("data", [])
        records.extend(chunk_data)
        print(f"   FUELHH {curr_date} to {chunk_end}: {len(chunk_data)} records")
        curr_date = chunk_end + timedelta(days=1)

    df = pd.DataFrame(records)
    print(f"   Total raw FUELHH records retrieved: {len(df)}")
    return df


def fetch_windfor_forecasts(client: httpx.Client) -> pd.DataFrame:
    """
    Fetch WINDFOR forecast publications for January 2026 delivery intervals.
    Includes publications from 2025-12-28 through 2026-02-01 to capture all
    day-ahead and historical revisions.
    """
    print("-> Fetching WINDFOR forecast publications...")
    records = []
    pub_start = datetime(2025, 12, 28, 0, 0, 0, tzinfo=timezone.utc)
    pub_end = datetime(2026, 2, 2, 23, 59, 59, tzinfo=timezone.utc)

    curr_time = pub_start
    while curr_time < pub_end:
        chunk_end = min(curr_time + timedelta(days=6), pub_end)
        params = {
            "publishDateTimeFrom": curr_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "publishDateTimeTo": chunk_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        resp = client.get(f"{BMRS_BASE_URL}/WINDFOR", params=params)
        resp.raise_for_status()
        chunk_data = resp.json().get("data", [])
        records.extend(chunk_data)
        print(f"   WINDFOR {curr_time.strftime('%Y-%m-%d')} to {chunk_end.strftime('%Y-%m-%d')}: {len(chunk_data)} records")
        curr_time = chunk_end

    df = pd.DataFrame(records)
    print(f"   Total raw WINDFOR records retrieved: {len(df)}")
    return df


def validate_and_normalize_fuelhh(df: pd.DataFrame) -> pd.DataFrame:
    """Validate, deduplicate, and normalize FUELHH actual wind generation."""
    print("-> Validating and normalizing FUELHH data...")
    if df.empty:
        raise ValueError("FUELHH data is empty")

    # Standardize column names and types
    df = df[["startTime", "settlementDate", "settlementPeriod", "fuelType", "generation", "publishTime"]].copy()
    df["startTime"] = pd.to_datetime(df["startTime"], utc=True).dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    df["publishTime"] = pd.to_datetime(df["publishTime"], utc=True).dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    df["generation"] = pd.to_numeric(df["generation"], errors="coerce")

    # Check for duplicates on startTime
    raw_count = len(df)
    duplicates = df[df.duplicated(subset=["startTime"], keep="last")]
    if not duplicates.empty:
        print(f"   [NOTICE] Found {len(duplicates)} duplicate FUELHH records. Deduplicating (keeping latest)...")
        df = df.drop_duplicates(subset=["startTime"], keep="last")

    # Filter strictly to Jan 1 - Feb 1 delivery intervals
    df = df[(df["startTime"] >= "2026-01-01T00:00:00Z") & (df["startTime"] <= "2026-02-01T23:30:00Z")].copy()
    df = df.sort_values(by="startTime").reset_index(drop=True)

    # Check completeness against all 1,488 expected periods
    expected = set(generate_expected_intervals())
    actual_intervals = set(df["startTime"])
    missing_intervals = expected - actual_intervals

    print(f"   Expected settlement periods: {len(expected)}")
    print(f"   Unique settlement periods present: {len(actual_intervals)}")
    print(f"   Missing settlement periods: {len(missing_intervals)}")
    if missing_intervals:
        print(f"   [WARNING] Missing intervals: {sorted(list(missing_intervals))[:5]}...")

    zero_generation = (df["generation"] == 0).sum()
    null_generation = df["generation"].isna().sum()
    print(f"   Genuine zero generation periods: {zero_generation}")
    print(f"   Null / missing generation periods: {null_generation}")
    print(f"   Min generation: {df['generation'].min()} MW | Max generation: {df['generation'].max()} MW | Mean: {df['generation'].mean():.1f} MW")

    return df


def validate_and_normalize_windfor(df: pd.DataFrame) -> pd.DataFrame:
    """Validate, deduplicate, and normalize WINDFOR forecast publications."""
    print("-> Validating and normalizing WINDFOR data...")
    if df.empty:
        raise ValueError("WINDFOR data is empty")

    # Keep relevant fields: startTime, publishTime, generation
    df = df[["startTime", "publishTime", "generation"]].copy()
    df["startTime"] = pd.to_datetime(df["startTime"], utc=True).dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    df["publishTime"] = pd.to_datetime(df["publishTime"], utc=True).dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    df["generation"] = pd.to_numeric(df["generation"], errors="coerce")

    # Filter strictly to Jan 1 - Feb 1 delivery intervals
    df = df[(df["startTime"] >= "2026-01-01T00:00:00Z") & (df["startTime"] <= "2026-02-01T23:30:00Z")].copy()

    # Deduplicate exact (startTime, publishTime) pairs
    raw_count = len(df)
    duplicates = df[df.duplicated(subset=["startTime", "publishTime"], keep="last")]
    if not duplicates.empty:
        print(f"   [NOTICE] Found {len(duplicates)} duplicate WINDFOR publications. Deduplicating...")
        df = df.drop_duplicates(subset=["startTime", "publishTime"], keep="last")

    df = df.sort_values(by=["startTime", "publishTime"]).reset_index(drop=True)

    expected = set(generate_expected_intervals())
    forecast_intervals = set(df["startTime"])
    missing_delivery = expected - forecast_intervals

    print(f"   Total valid forecast publications: {len(df)}")
    print(f"   Unique delivery intervals with forecasts: {len(forecast_intervals)} / {len(expected)}")
    print(f"   Delivery intervals with zero forecasts: {len(missing_delivery)}")
    print(f"   Publications per interval: min {df.groupby('startTime').size().min()} | max {df.groupby('startTime').size().max()} | avg {df.groupby('startTime').size().mean():.1f}")
    print(f"   Min forecast: {df['generation'].min()} MW | Max forecast: {df['generation'].max()} MW")

    return df


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    actuals_path = DATA_DIR / "actuals_fuelhh.parquet"
    forecasts_path = DATA_DIR / "forecasts_windfor.parquet"

    print("==================================================")
    print(" WindSight BMRS Ingestion: January 2026 Data")
    print("==================================================")

    with httpx.Client(timeout=30.0, headers={"User-Agent": "WindSight/1.0"}) as client:
        # 1. Fetch & normalize FUELHH actuals
        raw_fuelhh = fetch_fuelhh_actuals(client)
        clean_fuelhh = validate_and_normalize_fuelhh(raw_fuelhh)

        # 2. Fetch & normalize WINDFOR forecasts
        raw_windfor = fetch_windfor_forecasts(client)
        clean_windfor = validate_and_normalize_windfor(raw_windfor)

    # 3. Save to Parquet
    print("-> Caching datasets to Parquet...")
    clean_fuelhh.to_parquet(actuals_path, index=False, engine="pyarrow")
    clean_windfor.to_parquet(forecasts_path, index=False, engine="pyarrow")

    print(f"   Saved {len(clean_fuelhh)} actuals to {actuals_path} ({actuals_path.stat().st_size / 1024:.1f} KB)")
    print(f"   Saved {len(clean_windfor)} forecasts to {forecasts_path} ({forecasts_path.stat().st_size / 1024:.1f} KB)")
    print("==================================================")
    print(" Ingestion & Caching Complete! ")
    print("==================================================")


if __name__ == "__main__":
    main()
