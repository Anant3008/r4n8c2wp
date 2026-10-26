from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

STATUS_OK = "ok"
SERVICE_NAME = "windsight-backend"


def test_health_check_returns_ok_status() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == STATUS_OK
    assert data["service"] == SERVICE_NAME


def test_root_returns_service_info() -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "docs" in data
