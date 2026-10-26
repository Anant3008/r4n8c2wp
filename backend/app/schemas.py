from typing import List, Optional
from pydantic import BaseModel, Field


class Publication(BaseModel):
    publishTime: str = Field(..., description="Timestamp in ISO 8601 UTC when forecast was published")
    value: float = Field(..., description="Forecasted wind generation in MW")


class EvaluatedInterval(BaseModel):
    timestamp: str = Field(..., description="Delivery interval ISO 8601 UTC timestamp")
    day: int = Field(..., ge=1, le=31, description="Day of January 2026")
    time: str = Field(..., description="Time string in HH:MM format")
    label: str = Field(..., description="Display label, e.g. '15 Jan 12:00'")
    actual: Optional[float] = Field(None, description="Actual wind generation in MW, or null if missing")
    forecast: Optional[float] = Field(None, description="Selected forecast in MW available at cutoff, or null")
    publicationTime: Optional[str] = Field(None, description="Timestamp when selected forecast was published")
    error: Optional[float] = Field(None, description="Signed error (forecast - actual) in MW, or null")
    cutoff: str = Field(..., description="Procurement decision cutoff deadline in ISO 8601 UTC")
    publications: List[Publication] = Field(default_factory=list, description="All raw publications for this interval")


class MetricsResponse(BaseModel):
    forecast: Optional[float] = None
    actual: Optional[float] = None
    mae: Optional[float] = None
    relativeMae: Optional[float] = None
    rmse: Optional[float] = None
    bias: Optional[float] = None
    coverage: float
    pairs: int



class DailyPerformanceResponse(BaseModel):
    day: int
    date: Optional[str] = None
    label: str
    count: int
    missing: int
    missingForecast: int
    pairs: int
    forecast: Optional[float] = None
    actual: Optional[float] = None
    error: Optional[float] = None
    mae: Optional[float] = None
    relativeMae: Optional[float] = None
    rmse: Optional[float] = None
    bias: Optional[float] = None
    coverage: float


class PublicationHistoryItem(BaseModel):
    publishTime: str
    value: float
    revision: Optional[float]
    status: str = Field(..., description="'selected', 'superseded', or 'excluded'")
    statusLabel: str = Field(..., description="Human-readable status label")


class IntervalHistoryResponse(BaseModel):
    timestamp: str
    day: int
    time: str
    cutoff: str
    actual: Optional[float]
    forecast: Optional[float]
    publicationTime: Optional[str]
    error: Optional[float]
    publications: List[PublicationHistoryItem]


class ErrorBin(BaseModel):
    binStart: float
    binEnd: float
    label: str
    count: int


class ForecastDirectionResponse(BaseModel):
    overestimateCount: int
    overestimateMean: float
    underestimateCount: int
    underestimateMean: float
    exactCount: int


class AnalysisSummaryResponse(BaseModel):
    date: str
    cutoff: str
    metrics: MetricsResponse
    direction: ForecastDirectionResponse
    distribution: List[ErrorBin]


class HealthResponse(BaseModel):
    status: str
    service: str
    records_loaded: bool
