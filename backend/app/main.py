from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import HealthResponse

app = FastAPI(
    title="WindSight API",
    description="UK Wind Power Generation & Forecast Analysis API for January 2026",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="windsight-backend")


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "WindSight API",
        "description": "UK Wind Generation Forecast vs Actual Analysis (January 2026)",
        "docs": "/docs",
        "health": "/health",
    }
