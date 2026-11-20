import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_complete_aquaguard_e2e_flow():
    # 1. Register a Municipal Water Quality Engineer with unique email
    email = f"e2e_director_{uuid.uuid4().hex[:6]}@aquaguard.io"
    password = "E2EPassword2026!"
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Chief Water Officer Vikramaditya",
        "role": "municipal_engineer",
        "organization": "Delhi Jal Board"
    })
    assert reg_res.status_code == 201

    # 2. Login
    login_res = client.post("/api/auth/login", data={"username": email, "password": password})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Analyze Drinking Water (Category A)
    drinking_payload = {
        "category": "drinking",
        "source_name": "Sonia Vihar Water Treatment Plant Outflow",
        "source_type": "tap",
        "location": "North East Delhi Supply Zone 4",
        "drinking_params": {
            "ph": 7.3,
            "turbidity": 0.7,
            "tds": 280.0,
            "electrical_conductivity": 410.0,
            "hardness": 140.0,
            "chloride": 65.0,
            "nitrate": 12.0,
            "iron": 0.04,
            "arsenic": 0.0,
            "lead": 0.0,
            "e_coli": 0.0,
            "total_coliform": 0.0
        }
    }
    dw_res = client.post("/api/water/drinking/analyze", json=drinking_payload, headers=headers)
    assert dw_res.status_code == 200
    dw_data = dw_res.json()
    assert dw_data["potable"] is True
    assert dw_data["quality_score"] >= 85.0
    drinking_uid = dw_data["sample_uid"]

    # 4. Analyze Environmental Surface Water (Category B)
    env_payload = {
        "category": "environmental",
        "source_name": "Yamuna River Wazirabad Reach",
        "source_type": "river",
        "location": "Wazirabad Barrage Monitoring Node",
        "environmental_params": {
            "ph": 7.6,
            "dissolved_oxygen": 3.8,
            "bod": 18.0,
            "cod": 54.0,
            "ammonia": 1.8,
            "phosphates": 0.8
        }
    }
    env_res = client.post("/api/water/environmental/analyze", json=env_payload, headers=headers)
    assert env_res.status_code == 200
    env_data = env_res.json()
    assert env_data["potable"] is False
    assert "cpcb_class" in env_data
    assert len(env_data["recommendations"]) > 0
    env_uid = env_data["sample_uid"]

    # 5. Fetch Dashboard Telemetry Stats
    stats_res = client.get("/api/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_samples"] >= 2
    assert stats["drinking_samples"] >= 1
    assert stats["environmental_samples"] >= 1

    # 6. Fetch History
    hist_res = client.get("/api/water/history", headers=headers)
    assert hist_res.status_code == 200
    history_uids = [s["sample_uid"] for s in hist_res.json()]
    assert drinking_uid in history_uids
    assert env_uid in history_uids

    # 7. Generate & Download Official PDF Certificates
    pdf_dw = client.get(f"/api/water/reports/{drinking_uid}/pdf", headers=headers)
    assert pdf_dw.status_code == 200
    assert pdf_dw.headers["content-type"] == "application/pdf"
    assert pdf_dw.content.startswith(b"%PDF")

    pdf_env = client.get(f"/api/water/reports/{env_uid}/pdf", headers=headers)
    assert pdf_env.status_code == 200
    assert pdf_env.headers["content-type"] == "application/pdf"
    assert pdf_env.content.startswith(b"%PDF")
