import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

@pytest.fixture
def auth_headers():
    # Register/login test engineer
    email = "water_inspector@aquaguard.io"
    password = "InspectorPass123!"
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Senior Inspector Vikram",
        "role": "food_safety_inspector",
        "organization": "National Water Directorate"
    })
    login_res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_drinking_water_analysis_endpoint(auth_headers):
    payload = {
        "category": "drinking",
        "source_name": "Bisleri Bottling Plant Source A",
        "source_type": "bottled",
        "location": "Mumbai Suburbs",
        "latitude": 19.076,
        "longitude": 72.877,
        "drinking_params": {
            "ph": 7.3,
            "turbidity": 0.6,
            "tds": 140.0,
            "electrical_conductivity": 220.0,
            "hardness": 70.0,
            "chloride": 30.0,
            "nitrate": 5.0,
            "e_coli": 0.0,
            "total_coliform": 0.0
        }
    }
    res = client.post("/api/water/drinking/analyze", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "drinking"
    assert data["potable"] is True
    assert "sample_uid" in data
    assert "ml_prediction" in data
    assert "recommendations" in data

def test_environmental_water_analysis_endpoint(auth_headers):
    payload = {
        "category": "environmental",
        "source_name": "Yamuna River Inlet Point 3",
        "source_type": "river",
        "location": "Delhi NCR, Okhla Barrage",
        "environmental_params": {
            "ph": 7.8,
            "dissolved_oxygen": 2.5,
            "bod": 24.0,
            "cod": 78.0,
            "ammonia": 2.1
        }
    }
    res = client.post("/api/water/environmental/analyze", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["category"] == "environmental"
    assert data["potable"] is False
    assert "cpcb_class" in data
    assert len(data["violations"]) > 0

def test_history_and_dashboard_stats(auth_headers):
    hist_res = client.get("/api/water/history", headers=auth_headers)
    assert hist_res.status_code == 200
    samples = hist_res.json()
    assert len(samples) >= 2

    stats_res = client.get("/api/dashboard/stats", headers=auth_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_samples"] >= 2
    assert "drinking_samples" in stats
    assert "environmental_samples" in stats
