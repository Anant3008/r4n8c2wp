from datetime import datetime
import numpy as np
import pandas as pd
import pytest
from app.analytics import (
    compute_daily_performance,
    compute_error_distribution,
    compute_forecast_direction,
    compute_metrics,
    evaluate_intervals,
    get_cutoff_deadline,
    get_interval_publications,
    parse_cutoff,
)
from app.data_service import data_store

SAMPLE_INTERVAL = "2026-01-15T14:00:00Z"
EXPECTED_DEADLINE_10 = "2026-01-14T10:00:00Z"
EXPECTED_DEADLINE_08 = "2026-01-14T08:00:00Z"
CUTOFF_10 = "10:00"
CUTOFF_08 = "08:00"
TOTAL_JANUARY_PERIODS = 1488


def test_parse_cutoff_valid_and_fallback() -> None:
    assert parse_cutoff("10:00") == (10, 0)
    assert parse_cutoff("08:30") == (8, 30)
    assert parse_cutoff("invalid") == (10, 0)


def test_get_cutoff_deadline() -> None:
    assert get_cutoff_deadline(SAMPLE_INTERVAL, 10, 0) == EXPECTED_DEADLINE_10
    assert get_cutoff_deadline(SAMPLE_INTERVAL, 8, 0) == EXPECTED_DEADLINE_08


def test_evaluate_intervals_count_and_fields() -> None:
    actuals = data_store.actuals
    forecasts = data_store.forecasts

    evaluated = evaluate_intervals(actuals, forecasts, cutoff=CUTOFF_10, match_mode="exact")
    assert len(evaluated) == TOTAL_JANUARY_PERIODS

    expected_cols = {
        "timestamp",
        "day",
        "time",
        "label",
        "actual",
        "forecast",
        "publicationTime",
        "error",
        "cutoff",
        "publications",
    }
    assert expected_cols.issubset(evaluated.columns)

    # All publication times selected must be on or before the cutoff deadline
    with_forecasts = evaluated.dropna(subset=["forecast", "publicationTime"])
    assert len(with_forecasts) == 744  # In exact mode, all 744 hourly intervals have forecasts

    for _, row in with_forecasts.iterrows():
        assert row["publicationTime"] <= row["cutoff"]

    # When both actual and forecast exist, error must strictly equal forecast - actual
    for _, row in with_forecasts.iterrows():
        if row["actual"] is not None:
            assert np.isclose(row["error"], row["forecast"] - row["actual"])


def test_evaluate_intervals_hourly_block_mode() -> None:
    actuals = data_store.actuals
    forecasts = data_store.forecasts

    evaluated = evaluate_intervals(actuals, forecasts, cutoff=CUTOFF_10, match_mode="hourly_block")
    assert len(evaluated) == TOTAL_JANUARY_PERIODS

    with_forecasts = evaluated.dropna(subset=["forecast"])
    assert len(with_forecasts) == TOTAL_JANUARY_PERIODS  # Full 100% coverage


def test_compute_metrics_correctness() -> None:
    sample_df = pd.DataFrame(
        [
            {"actual": 1000.0, "forecast": 1200.0, "error": 200.0},
            {"actual": 2000.0, "forecast": 1900.0, "error": -100.0},
            {"actual": 1500.0, "forecast": None, "error": None},
        ]
    )
    m = compute_metrics(sample_df)
    assert m["pairs"] == 2
    assert np.isclose(m["mae"], 150.0)  # (|200| + |-100|) / 2 = 150
    assert np.isclose(m["bias"], 50.0)  # (200 + -100) / 2 = 50
    assert np.isclose(m["rmse"], np.sqrt((40000 + 10000) / 2))  # sqrt(25000)
    assert np.isclose(m["coverage"], 2 / 3 * 100.0)


def test_compute_daily_performance() -> None:
    actuals = data_store.actuals
    forecasts = data_store.forecasts
    evaluated = evaluate_intervals(actuals, forecasts, cutoff=CUTOFF_10, match_mode="exact")

    daily = compute_daily_performance(evaluated)
    assert len(daily) == 31
    for day_summary in daily:
        assert 1 <= day_summary["day"] <= 31
        assert day_summary["count"] == 48


def test_get_interval_publications_status_tagging() -> None:
    forecasts = data_store.forecasts
    pubs = get_interval_publications(forecasts, SAMPLE_INTERVAL, cutoff=CUTOFF_10)
    assert len(pubs) > 0

    statuses = [p["status"] for p in pubs]
    assert "selected" in statuses
    # There should only be exactly ONE "selected" publication
    assert statuses.count("selected") == 1

    # Verify that excluded publications have publishTime > deadline
    deadline = get_cutoff_deadline(SAMPLE_INTERVAL, 10, 0)
    for p in pubs:
        if p["status"] == "excluded":
            assert p["publishTime"] > deadline
        elif p["status"] in ("selected", "superseded"):
            assert p["publishTime"] <= deadline
