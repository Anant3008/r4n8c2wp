from typing import List, Optional
from pydantic import BaseModel, Field


class Publication(BaseModel):
    publishTime: str = Field(..., description="Timestamp in ISO 8601 UTC when forecast was published")
    value: float = Field(..., description="Forecasted wind generation in MW")


class IntervalRecord(BaseModel):
    timestamp: str = Field(..., description="Delivery interval start timestamp in ISO 8601 UTC")
    day: int = Field(..., ge=1, le=31, description="Day of January 2026")
    time: str = Field(..., description="Time string in HH:MM format")
    actual: Optional[float] = Field(None, description="Actual metered wind generation in MW, or null if missing")
    publications: List[Publication] = Field(default_factory=list, description="Historical forecast publications")


class EvaluatedInterval(BaseModel):
    timestamp: str
    day: int
    time: str
    actual: Optional[float]
    publications: List[Publication]
    forecast: Optional[float]
    publicationTime: Optional[str]
    error: Optional[float]
    label: str
    cutoff: str


class MetricsResponse(BaseModel):
    forecast: float
    actual: float
    mae: float
    relativeMae: float
    rmse: float
    bias: float
    coverage: float
    pairs: int


class HealthResponse(BaseModel):
    status: str
    service: str
