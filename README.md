# WindSight — UK Wind Power Generation & Forecast Analysis

A web application designed for UK electricity utility procurement analysts to evaluate national wind power generation forecasts against actual metered generation for **January 2026**, using official data from the **Elexon Balancing Mechanism Reporting Service (BMRS)**.

---

## 1. Executive Summary & Problem Context

In the UK electricity day-ahead market, energy utilities must purchase power 24 hours in advance of physical delivery to meet expected customer demand. Wind power is a primary, zero-marginal-cost renewable generation source in Great Britain, but its weather-dependent volatility introduces substantial procurement and imbalance risks.

If day-ahead wind forecasts **overestimate** actual generation, utilities face short positions in the Balancing Mechanism and must purchase expensive emergency replacement power. If forecasts **underestimate** generation, utilities may over-procure conventional generation, incurring unnecessary costs.

**WindSight** equips energy analysts with the decision-support tools to:
- Evaluate national wind forecasts against actual metered generation across all 1,488 half-hour settlement periods in January 2026.
- Enforce strict decision-time availability cutoffs (e.g. Day-Ahead at 08:00, 10:00, 12:00 UTC) to prevent lookahead bias.
- Measure quantitative accuracy with metrics including Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), Forecast Bias, and Relative MAE.
- Identify and inspect outlier days and delivery intervals with extreme forecasting errors.
- Trace the complete publication and revision audit trail of forecast updates leading up to gate closure.

---

## 2. Key Capabilities & Workflow Views

The application provides 5 purpose-built analytical workspaces:

1. **Overview Dashboard**:
   - Executive KPIs: Mean Forecast Generation, Mean Actual Generation, MAE, Relative MAE, RMSE, Forecast Bias, and Forecast Coverage %.
   - Comparative time-series chart with interactive dual-mode views (monthly daily averages vs. half-hourly daily zoom).
   - "Days to Review" ranking the worst-performing delivery days by MAE, RMSE, or Bias.
   - Expandable methodology and data quality diagnostics.

2. **Forecast Explorer**:
   - High-resolution half-hourly timeline comparing eligible forecast vs. actual metered wind output in megawatts (MW).
   - Interval-level interactive inspector displaying delivery timestamp, procurement cutoff deadline, selected forecast, actual generation, and signed error.

3. **Accuracy Analysis**:
   - Visual breakdown of forecast error timelines over time.
   - Error distribution histogram categorizing forecasting errors across 250 MW buckets.
   - Forecast direction breakdown: frequency and average magnitude of over-forecasting vs. under-forecasting intervals.
   - Aggregated 31-day performance table.

4. **Forecast History**:
   - Comprehensive audit trail for any settlement period.
   - Lists every WINDFOR publication timestamp and its predicted generation.
   - Explicitly tags each revision's decision-time status:
     - `Selected for evaluation`: The latest publication released prior to the decision cutoff.
     - `Available · superseded`: A pre-cutoff forecast that was subsequently replaced by a newer revision.
     - `After cutoff · excluded`: Forecast revisions published after the procurement decision time (excluded to prevent lookahead bias).

5. **Data Explorer**:
   - Complete, sortable tabular view of all 1,488 settlement periods in January 2026.
   - Filters for data quality: All, Complete Pairs, Missing Actuals, and Missing Forecasts.
   - Searchable by timestamp or generation values with pagination.
   - One-click CSV export of the evaluated dataset.

---

## 3. Data Sourcing & Integrity (Elexon BMRS)

The application uses 100% verified real data from the Elexon BMRS API (`https://data.elexon.co.uk/bmrs/api/v1`). No synthetic or fabricated data is used.

### Data Streams:
1. **Actual Wind Generation (`FUELHH`)**:
   - Dataset: `FUELHH` filtered by `fuelType=WIND`.
   - Fields: `startTime`, `settlementDate`, `settlementPeriod`, `generation`, `publishTime`.
   - Resolution: 30-minute settlement periods (48 periods per day × 31 days = 1,488 records).
2. **Wind Generation Forecasts (`WINDFOR`)**:
   - Dataset: `WINDFOR`.
   - Fields: `startTime`, `publishTime`, `generation`.
   - Coverage: Ingested all publications from December 28, 2025 through February 1, 2026 (18,104 publications) to ensure every historical revision and day-ahead forecast for January 2026 delivery is available.

### Data Integrity Standards:
- **Zero Fabrication**: All records are validated against Elexon schemas.
- **Missing vs. Zero Distinction**: Genuinely zero generation (`0 MW`) is strictly differentiated from missing data (`null`), ensuring zero values are not falsely treated as missing.
- **Offline Reliability & Caching**: The validated historical datasets are bundled directly with the application in high-performance **Parquet** format (`backend/data/`). The FastAPI backend loads this cache into memory with zero runtime dependency on external third-party API availability.

---

## 4. Methodology & Evaluation Logic

### 1. Decision-Time Availability Cutoff
Forecast accuracy must only be scored using data that was knowable at the actual decision time. For any delivery interval on Day $D$, procurement decisions occur on Day $D-1$ at an assumed cutoff time (e.g. `08:00`, `10:00`, or `12:00` UTC).
$$\text{Cutoff Deadline} = \text{Date}(D-1) \text{ at } \text{HH:MM UTC}$$
- Any forecast published with $\text{publishTime} > \text{Cutoff Deadline}$ is strictly excluded.
- The forecast selected for evaluation is:
  $$\text{Forecast} = \arg\max_{\text{publishTime} \le \text{Cutoff Deadline}} (\text{publishTime})$$

### 2. Market Resolution Mapping
Elexon publishes WINDFOR forecasts on an hourly basis, whereas UK settlement periods and actual generation (FUELHH) occur in half-hour intervals. In the UK market, an hourly forecast represents the anticipated average generation for that entire 1-hour delivery block. The engine maps the hourly forecast across both half-hour settlement periods in that block (`hourly_block` mode), providing continuous 48-period evaluation while also supporting strict point-in-time matching (`exact` mode).

### 3. Quantitative Accuracy Metrics
- **Mean Absolute Error (MAE)**:
  $$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |\text{Forecast}_i - \text{Actual}_i|$$
- **Root Mean Squared Error (RMSE)**:
  $$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (\text{Forecast}_i - \text{Actual}_i)^2}$$
- **Forecast Bias (Mean Error)**:
  $$\text{Bias} = \frac{1}{N} \sum_{i=1}^{N} (\text{Forecast}_i - \text{Actual}_i)$$
  *(Positive values indicate net overforecasting; negative values indicate net underforecasting).*
- **Relative MAE**:
  $$\text{Relative MAE} = \frac{\text{MAE}}{\overline{\text{Actual}}_{\text{matched}}} \times 100\%$$
- **Forecast Coverage**:
  $$\text{Coverage} = \frac{\text{Delivery Intervals with Available Forecasts}}{\text{Total Expected Intervals (1,488)}} \times 100\%$$

---

## 5. Technology Stack

- **Frontend**:
  - React 19 & TypeScript
  - Vite 8
  - Tailwind CSS v4
  - Recharts for time-series charts and distributions
  - Lucide Icons & Figma Astra UI design system
- **Backend**:
  - Python 3.12
  - FastAPI
  - Pandas & NumPy for statistical data processing
  - PyArrow for Parquet caching and querying
  - Pydantic v2 for data validation and response schemas
  - Uvicorn ASGI server
  - Pytest for automated testing
- **DevOps & Containerization**:
  - Docker & Docker Compose
  - Nginx (reverse proxy and static SPA server)

---

## 6. Use of Artificial Intelligence (AI)

In accordance with academic and engineering integrity standards, the use of AI tools in developing this project was deliberate, modular, and tracked:

### 1. Frontend Scaffolding — Figma Make
- **Role**: Initial frontend workstation scaffolding and component styling.
- **How it was used**:
  - Generated the initial workstation layout, responsive grid, color tokens, and UI component hierarchy.
  - Provided baseline styling and accessibility scaffolding for tables, filters, and metric tiles.

### 2. Backend Development & Full-Stack Integration — Claude Code
- **Role**: Software architecture, data engineering, backend development, container orchestration, and bug fixing.
- **How it was used**:
  - **API Ingestion & Verification**: Probed and verified Elexon BMRS API endpoints, query constraints, and rate limits. Authored `ingest_bmrs.py` to ingest, deduplicate, and validate all 1,488 actual records and 18,104 forecast publications for January 2026.
  - **Data Caching & Storage**: Designed the local Parquet storage pipeline and in-memory `DataStore` service.
  - **Analytics Engine**: Implemented the decision-time cutoff evaluation logic, mathematical metric calculations (MAE, RMSE, Bias, Relative MAE), and `@lru_cache` optimization in Python/Pandas.
  - **FastAPI Backend**: Built all REST endpoints (`/api/intervals`, `/api/metrics`, `/api/daily`, `/api/history`, `/api/analysis`) with strict Pydantic schemas, error handling, and CORS configuration.
  - **Frontend-Backend Integration**: Replaced synthetic mock generators in the frontend with the live asynchronous API client, wired live status indicators in the Topbar/Sidebar, and resolved Recharts rendering for continuous multi-period forecast lines (`connectNulls`).
  - **Containerization & Testing**: Authored production multi-stage Dockerfiles, root `docker-compose.yml`, Nginx reverse proxy configuration, and full test suites (19 backend pytest tests + frontend verification scripts).

---

## 7. Project Structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── analytics.py        # Pandas/NumPy cutoff evaluation & metrics engine
│   │   ├── data_service.py     # In-memory Parquet DataStore loader
│   │   ├── main.py             # FastAPI entrypoint, routes, and middleware
│   │   └── schemas.py          # Pydantic request/response models
│   ├── data/
│   │   ├── actuals_fuelhh.parquet      # 1,488 validated January 2026 actuals
│   │   └── forecasts_windfor.parquet   # 18,104 validated forecast publications
│   ├── scripts/
│   │   └── ingest_bmrs.py      # Elexon BMRS ingestion and validation script
│   ├── tests/
│   │   ├── test_analytics.py   # Tests for cutoff logic and metric formulas
│   │   ├── test_data_service.py# Tests for Parquet cache completeness
│   │   └── test_main.py        # End-to-end FastAPI endpoint integration tests
│   ├── Dockerfile              # Python 3.12-slim backend container
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                # Workstation shell & page router
│   │   ├── components/         # Charts, overview, analysis, layout, records
│   │   ├── hooks/              # useWorkstation, useRecords
│   │   ├── lib/                # Daily performance calculations, chart styles
│   │   ├── pages/              # Overview, Forecast Explorer, Accuracy, History, Data
│   │   ├── data.ts             # API client & data contracts
│   │   ├── realIntervals.json  # Bundled January 2026 Elexon dataset fallback
│   │   └── index.css           # Global tokens & responsive styling
│   ├── nginx.conf              # SPA routing & API reverse proxy configuration
│   ├── Dockerfile              # Multi-stage Node.js build + Nginx container
│   └── package.json
├── docker-compose.yml          # Container orchestration (Frontend + Backend)
└── README.md
```

---

## 8. Running the Application

### Method 1: Docker Compose (Recommended)

To run the entire full-stack application in containers with a single command:

```bash
docker compose up --build -d
```

Once running:
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

To view container logs or stop services:
```bash
docker compose logs -f
docker compose down
```

---

### Method 2: Local Manual Setup

#### 1. Backend Setup
Prerequisites: Python 3.10+ (Python 3.12 recommended).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --port 8000 --reload
```

Run backend tests:
```bash
pytest -v
```

*(Optional) Re-run the Elexon BMRS ingestion script:*
```bash
python scripts/ingest_bmrs.py
```

#### 2. Frontend Setup
Prerequisites: Node.js 20+ and `pnpm` (or `npm`).

```bash
cd frontend
pnpm install
pnpm dev
```
The frontend development server will start at `http://localhost:8443` (or the port indicated by Vite).

Run frontend checks:
```bash
pnpm exec tsc --noEmit
node scripts/check-analysis.cjs
pnpm build
```

---

## 9. API Reference Summary

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/health` | None | Service health check and cache status |
| `GET` | `/api/intervals` | `date` (`all` or `1`..`31`), `cutoff` (`08:00`, `10:00`, `12:00`), `match_mode` | Evaluated half-hourly intervals with selected forecasts and errors |
| `GET` | `/api/metrics` | `date`, `cutoff`, `match_mode` | Quantitative summary metrics (MAE, RMSE, Bias, Coverage %, Pairs) |
| `GET` | `/api/daily` | `cutoff`, `match_mode` | 31-day aggregated daily performance breakdown and rankings |
| `GET` | `/api/history` | `timestamp` (ISO UTC), `cutoff`, `match_mode` | Full revision audit trail for an interval with decision-time status tags |
| `GET` | `/api/analysis` | `date`, `cutoff`, `match_mode` | Combined analysis (metrics, over/under directions, error histogram) |

---

## 10. Verification & Test Summary

All components are covered by automated test suites:
- **Backend Test Suite (`pytest backend/tests/`)**: 19 tests covering data caching, schema validation, cutoff deadline calculations, post-cutoff exclusion, error distributions, and REST endpoints.
- **Frontend Test Suite (`node scripts/check-analysis.cjs`)**: Verifies URL state synchronization, history back/forward adapter, UTC formatting, zero vs. missing observation rendering, and DOM contracts.
- **Static Analysis**: TypeScript compiles with zero errors (`tsc --noEmit`).
