import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal, init_db
from backend.app.models import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    init_db()

def test_register_and_login():
    unique_email = f"engineer_{uuid.uuid4().hex[:6]}@aquaguard.io"
    # Register Water Quality Engineer
    res = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Dr. Ananya Sharma",
        "role": "water_quality_engineer",
        "organization": "Delhi Jal Board"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == unique_email
    assert data["role"] == "water_quality_engineer"
    assert "id" in data

    # Login
    login_res = client.post("/api/auth/login", data={
        "username": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Access current user info
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email
    assert me_res.json()["role"] == "water_quality_engineer"

def test_duplicate_registration_fails():
    unique_email = f"dup_{uuid.uuid4().hex[:6]}@aquaguard.io"
    res1 = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "User One",
        "role": "water_quality_engineer",
        "organization": "Delhi Jal Board"
    })
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Duplicate User",
        "role": "water_quality_engineer",
        "organization": "Delhi Jal Board"
    })
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"].lower()

def test_invalid_credentials():
    login_res = client.post("/api/auth/login", data={
        "username": "non_existent@aquaguard.io",
        "password": "WrongPassword!"
    })
    assert login_res.status_code == 401
