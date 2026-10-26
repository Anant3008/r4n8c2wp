# WindSight — UK Wind Power Generation & Forecast Analysis

A web application for UK energy utility analysts to evaluate national wind power generation forecasts against actual generation for January 2026, using data from the Elexon Balancing Mechanism Reporting Service (BMRS).

## Overview

The application supports day-ahead electricity procurement decisions by:
- Comparing half-hourly wind generation forecasts against actual metered generation.
- Evaluating forecast accuracy using decision-time availability cutoffs (e.g., D−1 at 08:00, 10:00, 12:00 UTC) to prevent lookahead bias.
- Calculating key forecast accuracy metrics (MAE, RMSE, Forecast Bias, Relative MAE).
- Providing interval-level audit trails of forecast publications and revisions.

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Figma Astra UI.
- **Backend**: FastAPI, Python 3.12, Pandas, NumPy, Pydantic, Uvicorn.
- **Data Source**: Elexon BMRS API (`FUELHH` for actual wind generation, `WINDFOR` for wind forecasts).

## Project Structure

```
├── frontend/          # React + Vite application
│   ├── src/           # Components, pages, hooks, data models
│   ├── public/        # Static assets
│   ├── Dockerfile     # Frontend multi-stage container
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI backend
│   ├── app/           # API routes, schemas, and services
│   ├── tests/         # Unit and integration tests
│   ├── Dockerfile     # Backend Python container
│   └── requirements.txt
├── docker-compose.yml # Full-stack container orchestration
└── README.md
```

## Running with Docker Compose (Recommended)

To run the complete stack (FastAPI backend + React frontend) in containers:

```bash
docker compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Interactive API Docs (Swagger)**: http://localhost:8000/docs

## Local Development

### 1. Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Run backend tests:
```bash
pytest
```

### 2. Frontend (React)
```bash
cd frontend
pnpm install
pnpm dev
```
Run frontend checks:
```bash
cd frontend
pnpm exec tsc --noEmit
node scripts/check-analysis.cjs
```
