from pathlib import Path
import pandas as pd
from app.data_service import data_store

MIN_ACTUAL_RECORDS = 1488  # At least 31 days * 48 half-hour settlement periods
JANUARY_2026_START = "2026-01-01T00:00:00Z"
DELIVERY_WINDOW_END = "2026-02-01T23:30:00Z"


def test_actuals_cache_exists_and_complete() -> None:
    df = data_store.actuals
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 1488
    assert len(data_store.all_actuals) == 1536  # Extends through Feb 1 for Jan 31 purchasing decisions

    required_columns = {"startTime", "settlementDate", "settlementPeriod", "fuelType", "generation", "publishTime"}
    assert required_columns.issubset(df.columns)

    # Check date range covers January 2026 delivery
    assert df["startTime"].min() == JANUARY_2026_START
    assert df["startTime"].max() == "2026-01-31T23:30:00Z"
    assert data_store.all_actuals["startTime"].max() == "2026-02-01T23:30:00Z"

    # Check fuelType is WIND
    assert (df["fuelType"] == "WIND").all()

    # Check generation is numeric and non-negative
    assert df["generation"].notna().all()
    assert (df["generation"] >= 0).all()


def test_forecasts_cache_exists_and_valid() -> None:
    df = data_store.forecasts
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 10000  # Expecting ~18,100+ publications

    required_columns = {"startTime", "publishTime", "generation"}
    assert required_columns.issubset(df.columns)

    # Ensure all startTime are in Jan-Feb 2026 window
    assert (df["startTime"] >= JANUARY_2026_START).all()
    assert (df["startTime"] <= DELIVERY_WINDOW_END).all()

    # Ensure publishTime exists and is ISO 8601 UTC
    assert (df["publishTime"].str.endswith("Z")).all()

    # Ensure no duplicates on (startTime, publishTime)
    duplicates = df.duplicated(subset=["startTime", "publishTime"]).sum()
    assert duplicates == 0

    # Ensure generation is numeric and non-negative
    assert df["generation"].notna().all()
    assert (df["generation"] >= 0).all()
