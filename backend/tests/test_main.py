from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

STATUS_OK = "ok"
SERVICE_NAME = "windsight-backend"
SAMPLE_INTERVAL = "2026-01-15T14:00:00Z"
INVALID_INTERVAL = "2026-03-01T00:00:00Z"


def test_health_check_returns_ok_status() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == STATUS_OK
    assert data["service"] == SERVICE_NAME
    assert data["records_loaded"] is True


def test_root_returns_service_info() -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "endpoints" in data


def test_get_intervals_all() -> None:
    response = client.get("/api/intervals?date=all&cutoff=10:00")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1488  # 31 days * 48 periods


def test_get_intervals_filtered_by_day() -> None:
    response = client.get("/api/intervals?date=15&cutoff=10:00")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 48
    assert all(row["day"] == 15 for row in data)


def test_get_intervals_invalid_day() -> None:
    response = client.get("/api/intervals?date=32&cutoff=10:00")
    assert response.status_code == 400


def test_get_metrics() -> None:
    response = client.get("/api/metrics?date=all&cutoff=10:00")
    assert response.status_code == 200
    data = response.json()
    assert "mae" in data
    assert "rmse" in data
    assert "bias" in data
    assert "coverage" in data
    assert data["pairs"] == 1488

    # Also verify exact mode
    resp_exact = client.get("/api/metrics?date=all&cutoff=10:00&match_mode=exact")
    assert resp_exact.status_code == 200
    assert resp_exact.json()["pairs"] == 744


def test_get_daily_performance() -> None:
    response = client.get("/api/daily?cutoff=10:00")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 31
    assert data[0]["day"] == 1
    assert data[-1]["day"] == 31


def test_get_history_existing_interval() -> None:
    response = client.get(f"/api/history?timestamp={SAMPLE_INTERVAL}&cutoff=10:00")
    assert response.status_code == 200
    data = response.json()
    assert data["timestamp"] == SAMPLE_INTERVAL
    assert len(data["publications"]) > 0

    statuses = [p["status"] for p in data["publications"]]
    assert "selected" in statuses
    assert statuses.count("selected") == 1


def test_get_history_not_found() -> None:
    response = client.get(f"/api/history?timestamp={INVALID_INTERVAL}&cutoff=10:00")
    assert response.status_code == 404


def test_get_analysis_summary() -> None:
    response = client.get("/api/analysis?date=all&cutoff=10:00")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "direction" in data
    assert "distribution" in data
    assert data["direction"]["overestimateCount"] > 0
    assert len(data["distribution"]) > 0
