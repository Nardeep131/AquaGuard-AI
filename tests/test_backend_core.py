import pytest
from fastapi.testclient import TestClient

def test_healthcheck():
    from backend.app.main import app
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_database_initialization():
    from backend.app.database import init_db, SessionLocal, engine
    from backend.app.models import User, WaterSample, AnalysisResult
    init_db()
    db = SessionLocal()
    try:
        # Check that tables exist and can query
        users_count = db.query(User).count()
        assert users_count >= 0
        samples_count = db.query(WaterSample).count()
        assert samples_count >= 0
    finally:
        db.close()
