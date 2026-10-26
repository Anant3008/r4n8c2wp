from typing import List, Literal, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from app.analytics import (
    MatchMode,
    compute_daily_performance,
    compute_error_distribution,
    compute_forecast_direction,
    compute_metrics,
    get_evaluated_dataset,
    get_interval_publications,
)
from app.data_service import data_store
from app.schemas import (
    AnalysisSummaryResponse,
    DailyPerformanceResponse,
    EvaluatedInterval,
    HealthResponse,
    IntervalHistoryResponse,
    MetricsResponse,
)

app = FastAPI(
    title="WindSight API",
    description="UK Wind Power Generation & Forecast Analysis API for January 2026 (Elexon BMRS)",
    version="0.1.0",
)

# Enable CORS for frontend clients (Vite dev server, Docker, production host)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def filter_by_date(df, date_param: str):
    """Filter evaluated dataframe by date string ('all', '1'..'31', '2026-01-15', or '2026-02-01')."""
    if not date_param or date_param.lower() == "all":
        return df[df["timestamp"] <= "2026-01-31T23:30:00Z"]

    clean_date = date_param.strip()
    if clean_date.startswith("2026-01-"):
        day_num = int(clean_date.split("-")[-1])
        return df[(df["day"] == day_num) & (df["timestamp"] <= "2026-01-31T23:30:00Z")]
    elif clean_date == "2026-02-01":
        return df[df["timestamp"].str.startswith("2026-02-01")]
    else:
        try:
            day_num = int(clean_date)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid date parameter '{date_param}'. Use 'all', day 1-31, or '2026-02-01'.",
            )

    if day_num < 1 or day_num > 31:
        raise HTTPException(
            status_code=400,
            detail=f"Day {day_num} out of bounds for January 2026 (must be 1-31).",
        )

    return df[(df["day"] == day_num) & (df["timestamp"] <= "2026-01-31T23:30:00Z")]


def clean_dict(d: dict) -> dict:
    """Sanitize dict by converting NaN / infinite values to None for Pydantic."""
    cleaned = {}
    for k, v in d.items():
        if isinstance(v, (list, dict)):
            cleaned[k] = v
        elif pd.isna(v) or v is None:
            cleaned[k] = None
        else:
            cleaned[k] = v
    return cleaned



@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    loaded = False
    try:
        loaded = len(data_store.actuals) > 0 and len(data_store.forecasts) > 0
    except Exception:
        loaded = False

    return HealthResponse(
        status="ok", service="windsight-backend", records_loaded=loaded
    )


@app.get("/")
def root() -> dict:
    return {
        "service": "WindSight API",
        "scope": "January 2026 (Elexon BMRS)",
        "endpoints": {
            "health": "/health",
            "intervals": "/api/intervals",
            "metrics": "/api/metrics",
            "daily": "/api/daily",
            "history": "/api/history",
            "analysis": "/api/analysis",
            "docs": "/docs",
        },
    }


@app.get("/api/intervals", response_model=List[EvaluatedInterval])
def get_intervals(
    date: str = Query("all", description="Delivery date: 'all' or day number '1'..'31'"),
    cutoff: str = Query("10:00", description="D-1 procurement decision cutoff UTC time (e.g. '08:00', '10:00', '12:00')"),
    match_mode: MatchMode = Query("hourly_block", description="'hourly_block' (continuous evaluation) or 'exact'"),
) -> List[EvaluatedInterval]:
    """Retrieve evaluated half-hourly delivery intervals for January 2026."""
    df = get_evaluated_dataset(cutoff=cutoff, match_mode=match_mode)
    filtered = filter_by_date(df, date)
    return [EvaluatedInterval(**clean_dict(row)) for row in filtered.to_dict(orient="records")]


@app.get("/api/metrics", response_model=MetricsResponse)
def get_metrics(
    date: str = Query("all", description="Delivery date: 'all' or day number '1'..'31'"),
    cutoff: str = Query("10:00", description="D-1 procurement decision cutoff UTC time"),
    match_mode: MatchMode = Query("hourly_block", description="'hourly_block' or 'exact'"),
) -> MetricsResponse:
    """Retrieve summary forecast evaluation metrics (MAE, RMSE, bias, coverage)."""
    df = get_evaluated_dataset(cutoff=cutoff, match_mode=match_mode)
    filtered = filter_by_date(df, date)
    metrics_dict = compute_metrics(filtered)
    return MetricsResponse(**clean_dict(metrics_dict))


@app.get("/api/daily", response_model=List[DailyPerformanceResponse])
def get_daily_performance(
    cutoff: str = Query("10:00", description="D-1 procurement decision cutoff UTC time"),
    match_mode: MatchMode = Query("hourly_block", description="'hourly_block' or 'exact'"),
) -> List[DailyPerformanceResponse]:
    """Retrieve daily aggregated performance breakdown for January 2026."""
    df = get_evaluated_dataset(cutoff=cutoff, match_mode=match_mode)
    jan_df = df[df["timestamp"] <= "2026-01-31T23:30:00Z"]
    daily_list = compute_daily_performance(jan_df)
    return [DailyPerformanceResponse(**clean_dict(day)) for day in daily_list]


@app.get("/api/history", response_model=IntervalHistoryResponse)
def get_history(
    timestamp: str = Query(..., description="Interval timestamp in ISO 8601 UTC format, e.g. '2026-01-15T14:00:00Z'"),
    cutoff: str = Query("10:00", description="D-1 procurement decision cutoff UTC time"),
    match_mode: MatchMode = Query("hourly_block", description="'hourly_block' or 'exact'"),
) -> IntervalHistoryResponse:
    """Retrieve publication revision audit trail for a single delivery interval."""
    df = get_evaluated_dataset(cutoff=cutoff, match_mode=match_mode)
    matching = df[df["timestamp"] == timestamp]

    if matching.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Interval timestamp '{timestamp}' not found in January 2026 dataset.",
        )

    interval_data = clean_dict(matching.iloc[0].to_dict())
    publications = get_interval_publications(
        forecasts_df=data_store.forecasts,
        timestamp=timestamp,
        cutoff=cutoff,
        match_mode=match_mode,
    )

    return IntervalHistoryResponse(
        timestamp=interval_data["timestamp"],
        day=interval_data["day"],
        time=interval_data["time"],
        cutoff=interval_data["cutoff"],
        actual=interval_data["actual"],
        forecast=interval_data["forecast"],
        publicationTime=interval_data["publicationTime"],
        error=interval_data["error"],
        publications=publications,
    )


@app.get("/api/analysis", response_model=AnalysisSummaryResponse)
def get_analysis_summary(
    date: str = Query("all", description="Delivery date: 'all' or day number '1'..'31'"),
    cutoff: str = Query("10:00", description="D-1 procurement decision cutoff UTC time"),
    match_mode: MatchMode = Query("hourly_block", description="'hourly_block' or 'exact'"),
) -> AnalysisSummaryResponse:
    """Retrieve combined analysis summary including metrics, direction, and error distribution."""
    df = get_evaluated_dataset(cutoff=cutoff, match_mode=match_mode)
    filtered = filter_by_date(df, date)

    metrics_res = MetricsResponse(**clean_dict(compute_metrics(filtered)))
    direction_res = compute_forecast_direction(filtered)
    distribution_res = compute_error_distribution(filtered)

    return AnalysisSummaryResponse(
        date=date,
        cutoff=cutoff,
        metrics=metrics_res,
        direction=direction_res,
        distribution=distribution_res,
    )
