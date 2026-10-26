"""
Analytics and Cutoff Evaluation Engine.

Provides decision-time forecast evaluation for UK wind generation:
- Filters forecasts strictly by publication availability prior to D-1 cutoff (08:00, 10:00, 12:00 UTC).
- Calculates standard forecast accuracy metrics: MAE, RMSE, Forecast Bias, Relative MAE.
- Supports daily aggregations, error distributions, and publication revision histories.
"""

from datetime import datetime, timedelta, timezone
from functools import lru_cache
from typing import Any, Dict, List, Literal, Optional
import numpy as np
import pandas as pd
from app.data_service import data_store

MatchMode = Literal["exact", "hourly_block"]


def parse_cutoff(cutoff_str: str) -> tuple[int, int]:
    """Parse HH:MM cutoff string into (hour, minute). Defaults to 10:00 on error."""
    try:
        parts = cutoff_str.strip().split(":")
        return int(parts[0]), int(parts[1])
    except Exception:
        return 10, 0


def get_cutoff_deadline(interval_iso: str, cutoff_hour: int, cutoff_minute: int) -> str:
    """
    Calculate the procurement decision deadline for a delivery interval.
    For delivery interval on day D, cutoff is D-1 at cutoff_hour:cutoff_minute UTC.
    """
    dt = datetime.fromisoformat(interval_iso.replace("Z", "+00:00"))
    deadline = (dt - timedelta(days=1)).replace(
        hour=cutoff_hour, minute=cutoff_minute, second=0, microsecond=0
    )
    return deadline.strftime("%Y-%m-%dT%H:%M:%SZ")


def evaluate_intervals(
    actuals_df: pd.DataFrame,
    forecasts_df: pd.DataFrame,
    cutoff: str = "10:00",
    match_mode: MatchMode = "exact",
) -> pd.DataFrame:
    """
    Evaluate actual generation against forecasts available at decision-time cutoff.

    Parameters:
    - actuals_df: DataFrame with ['startTime', 'generation', ...]
    - forecasts_df: DataFrame with ['startTime', 'publishTime', 'generation']
    - cutoff: Cutoff time string on D-1, e.g. "08:00", "10:00", "12:00"
    - match_mode: "exact" (matches exact startTime; :30 has no forecast honestly)
                  or "hourly_block" (maps hourly forecast to both :00 and :30)
    """
    cutoff_hour, cutoff_minute = parse_cutoff(cutoff)

    # Ensure forecasts are sorted by publishTime
    sorted_forecasts = forecasts_df.sort_values(by=["startTime", "publishTime"]).copy()

    # Pre-group forecasts by startTime for fast lookup
    forecast_groups = {
        st: group for st, group in sorted_forecasts.groupby("startTime")
    }

    evaluated_records = []

    for _, row in actuals_df.iterrows():
        ts = row["startTime"]
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        day = dt.day
        time_str = dt.strftime("%H:%M")
        label = f"{day:02d} Jan {time_str}"
        deadline_str = get_cutoff_deadline(ts, cutoff_hour, cutoff_minute)

        # Lookup forecasts for this delivery interval
        query_st = ts
        if match_mode == "hourly_block" and dt.minute != 0:
            query_st = dt.replace(minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ")

        fc_group = forecast_groups.get(query_st)

        publications = []
        forecast_val: Optional[float] = None
        pub_time_str: Optional[str] = None

        if fc_group is not None and not fc_group.empty:
            # Build list of all publications for this interval
            for _, pub_row in fc_group.iterrows():
                publications.append(
                    {
                        "publishTime": pub_row["publishTime"],
                        "value": float(pub_row["generation"]),
                    }
                )

            # Eligible: published on or before cutoff deadline
            eligible = fc_group[fc_group["publishTime"] <= deadline_str]
            if not eligible.empty:
                chosen = eligible.iloc[-1]
                forecast_val = float(chosen["generation"])
                pub_time_str = chosen["publishTime"]

        act_val = float(row["generation"]) if pd.notna(row["generation"]) else None
        err_val = (
            (forecast_val - act_val)
            if (forecast_val is not None and act_val is not None)
            else None
        )

        evaluated_records.append(
            {
                "timestamp": ts,
                "day": day,
                "time": time_str,
                "label": label,
                "actual": act_val,
                "forecast": forecast_val,
                "publicationTime": pub_time_str,
                "error": err_val,
                "cutoff": deadline_str,
                "publications": publications,
            }
        )

    return pd.DataFrame(evaluated_records)


def compute_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """Compute standard summary metrics matching the frontend schema."""
    if df.empty:
        return {
            "forecast": float("nan"),
            "actual": float("nan"),
            "mae": float("nan"),
            "relativeMae": float("nan"),
            "rmse": float("nan"),
            "bias": float("nan"),
            "coverage": 0.0,
            "pairs": 0,
        }

    pairs = df.dropna(subset=["error"]).copy()
    pairs_count = len(pairs)

    act_series = df["actual"].dropna()
    fc_series = df["forecast"].dropna()

    mean_act = float(act_series.mean()) if not act_series.empty else float("nan")
    mean_fc = float(fc_series.mean()) if not fc_series.empty else float("nan")

    if pairs_count > 0:
        errors = pairs["error"].to_numpy()
        matched_actuals = pairs["actual"].to_numpy()
        mae = float(np.mean(np.abs(errors)))
        matched_act_mean = float(np.mean(matched_actuals))
        rel_mae = (
            float((mae / matched_act_mean) * 100.0)
            if matched_act_mean > 0
            else float("nan")
        )
        rmse = float(np.sqrt(np.mean(errors**2)))
        bias = float(np.mean(errors))
    else:
        mae = float("nan")
        rel_mae = float("nan")
        rmse = float("nan")
        bias = float("nan")

    coverage = (len(fc_series) / len(df) * 100.0) if len(df) > 0 else 0.0

    return {
        "forecast": mean_fc,
        "actual": mean_act,
        "mae": mae,
        "relativeMae": rel_mae,
        "rmse": rmse,
        "bias": bias,
        "coverage": coverage,
        "pairs": pairs_count,
    }


def compute_daily_performance(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Aggregate evaluated intervals into daily performance summaries."""
    daily_list = []
    days = sorted(df["day"].unique())

    for day in days:
        day_df = df[df["day"] == day]
        m = compute_metrics(day_df)
        total_count = len(day_df)
        missing_act = int(day_df["actual"].isna().sum())
        missing_fc = int(day_df["forecast"].isna().sum())

        daily_list.append(
            {
                "day": int(day),
                "label": f"{day:02d} Jan",
                "count": total_count,
                "missing": missing_act,
                "missingForecast": missing_fc,
                "pairs": m["pairs"],
                "forecast": m["forecast"],
                "actual": m["actual"],
                "error": m["bias"],  # Daily signed bias
                "mae": m["mae"],
                "relativeMae": m["relativeMae"],
                "rmse": m["rmse"],
                "bias": m["bias"],
                "coverage": m["coverage"],
            }
        )

    return daily_list


def compute_error_distribution(
    df: pd.DataFrame, num_bins: int = 10
) -> List[Dict[str, Any]]:
    """Compute error histogram distribution."""
    pairs = df.dropna(subset=["error"])
    if pairs.empty:
        return []

    errors = pairs["error"].to_numpy()
    counts, bin_edges = np.histogram(errors, bins=num_bins)

    distribution = []
    for i in range(len(counts)):
        distribution.append(
            {
                "binStart": float(bin_edges[i]),
                "binEnd": float(bin_edges[i + 1]),
                "label": f"{int(round(bin_edges[i]))} to {int(round(bin_edges[i+1]))} MW",
                "count": int(counts[i]),
            }
        )
    return distribution


def compute_forecast_direction(df: pd.DataFrame) -> Dict[str, Any]:
    """Breakdown of over-forecasting vs under-forecasting periods."""
    pairs = df.dropna(subset=["error"])
    if pairs.empty:
        return {
            "overestimateCount": 0,
            "overestimateMean": 0.0,
            "underestimateCount": 0,
            "underestimateMean": 0.0,
            "exactCount": 0,
        }

    errors = pairs["error"].to_numpy()
    over = errors[errors > 0]
    under = errors[errors < 0]
    exact = errors[errors == 0]

    return {
        "overestimateCount": int(len(over)),
        "overestimateMean": float(np.mean(over)) if len(over) > 0 else 0.0,
        "underestimateCount": int(len(under)),
        "underestimateMean": float(np.mean(np.abs(under))) if len(under) > 0 else 0.0,
        "exactCount": int(len(exact)),
    }


def get_interval_publications(
    forecasts_df: pd.DataFrame,
    timestamp: str,
    cutoff: str = "10:00",
    match_mode: MatchMode = "exact",
) -> List[Dict[str, Any]]:
    """
    Get full publication revision history for a specific delivery interval,
    annotating each revision with its decision-time status.
    """
    cutoff_hour, cutoff_minute = parse_cutoff(cutoff)
    deadline_str = get_cutoff_deadline(timestamp, cutoff_hour, cutoff_minute)

    query_st = timestamp
    dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    if match_mode == "hourly_block" and dt.minute != 0:
        query_st = dt.replace(minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ")

    matching = forecasts_df[forecasts_df["startTime"] == query_st].sort_values(
        by="publishTime"
    )

    if matching.empty:
        return []

    pubs_list = []
    prev_val: Optional[float] = None

    # Find the latest eligible publication before deadline
    eligible = matching[matching["publishTime"] <= deadline_str]
    selected_publish_time = eligible.iloc[-1]["publishTime"] if not eligible.empty else None

    for _, row in matching.iterrows():
        pub_time = row["publishTime"]
        val = float(row["generation"])
        rev = (val - prev_val) if prev_val is not None else None
        prev_val = val

        if pub_time > deadline_str:
            status = "excluded"
            status_label = "After cutoff · excluded"
        elif pub_time == selected_publish_time:
            status = "selected"
            status_label = "Selected for evaluation"
        else:
            status = "superseded"
            status_label = "Available · superseded"

        pubs_list.append(
            {
                "publishTime": pub_time,
                "value": val,
                "revision": rev,
                "status": status,
                "statusLabel": status_label,
            }
        )

    return pubs_list


@lru_cache(maxsize=16)
def get_evaluated_dataset(
    cutoff: str = "10:00",
    match_mode: MatchMode = "exact",
) -> pd.DataFrame:
    """Cached evaluation of the January 2026 dataset for given cutoff and match mode."""
    return evaluate_intervals(
        actuals_df=data_store.actuals,
        forecasts_df=data_store.forecasts,
        cutoff=cutoff,
        match_mode=match_mode,
    )

