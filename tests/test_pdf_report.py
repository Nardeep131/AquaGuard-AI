import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

@pytest.fixture
def sample_and_token():
    email = "pdf_tester@aquaguard.io"
    password = "PdfPassword123!"
    client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Quality Officer Rajesh",
        "role": "hospital_administrator",
        "organization": "AIIMS New Delhi"
    })
    login_res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit sample
    payload = {
        "category": "drinking",
        "source_name": "Hospital Central RO Supply",
        "source_type": "tap",
        "location": "Ward 4 ICU Unit",
        "drinking_params": {
            "ph": 7.1,
            "turbidity": 0.4,
            "tds": 120.0,
            "electrical_conductivity": 190.0,
            "hardness": 60.0,
            "chloride": 25.0,
            "nitrate": 4.0,
            "e_coli": 0.0,
            "total_coliform": 0.0
        }
    }
    sample_res = client.post("/api/water/drinking/analyze", json=payload, headers=headers)
    sample_uid = sample_res.json()["sample_uid"]
    return sample_uid, headers

def test_pdf_report_generation(sample_and_token):
    sample_uid, headers = sample_and_token
    res = client.get(f"/api/water/reports/{sample_uid}/pdf", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content.startswith(b"%PDF")
    assert len(res.content) > 1000

def test_pdf_report_not_found(sample_and_token):
    _, headers = sample_and_token
    res = client.get("/api/water/reports/NON-EXISTENT-UID/pdf", headers=headers)
    assert res.status_code == 404

def test_pdf_report_download_without_auth_header(sample_and_token):
    sample_uid, _ = sample_and_token
    # Directly request PDF without auth headers (like a browser clicking a download link)
    res = client.get(f"/api/water/reports/{sample_uid}/pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert res.content.startswith(b"%PDF")
