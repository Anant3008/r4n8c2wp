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
- **Backend**: FastAPI, Python, Pandas, NumPy (in progress).
- **Data Source**: Elexon BMRS API (`FUELHH` for actual wind generation, `WINDFOR` for wind forecasts).

## Project Structure

```
├── frontend/          # React + Vite application
│   ├── src/           # Components, pages, hooks, data models
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # FastAPI backend (in progress)
└── README.md
```

## Getting Started (Frontend)

### Prerequisites
- Node.js (v20+)
- pnpm (or npm / yarn)

### Local Development
```bash
cd frontend
pnpm install
pnpm dev
```
The application will be available at `http://localhost:8443` (or the port specified by Vite).

### Testing & Validation
```bash
cd frontend
pnpm exec tsc --noEmit
node scripts/check-analysis.cjs
```
