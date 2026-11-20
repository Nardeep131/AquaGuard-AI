import pytest
from backend.app.services.ml_service import ml_service

def test_ml_service_prediction_and_explainability():
    sample = {
        "ph": 7.4,
        "turbidity": 1.2,
        "tds": 310.0,
        "electrical_conductivity": 420.0,
        "hardness": 160.0,
        "chloride": 85.0,
        "nitrate": 15.0,
        "iron": 0.1,
        "arsenic": 0.002,
        "lead": 0.001
    }
    pred = ml_service.predict_drinking_potability(sample)
    assert pred["predicted_label"] in ["Potable (Screening)", "Non-Potable / Treatment Needed"]
    assert 0.0 <= pred["confidence"] <= 1.0
    assert "feature_contributions" in pred
    assert len(pred["feature_contributions"]) > 0

def test_ml_anomaly_detection():
    # Normal sample
    normal_sample = {
        "ph": 7.3,
        "turbidity": 1.1,
        "tds": 280.0,
        "electrical_conductivity": 390.0,
        "hardness": 140.0,
        "chloride": 60.0,
        "nitrate": 12.0
    }
    normal_res = ml_service.detect_anomalies(normal_sample)
    assert "is_anomaly" in normal_res
    assert "anomaly_score" in normal_res

    # Extreme spike anomaly (e.g. industrial spill pH=13.8, TDS=9500)
    anomalous_sample = {
        "ph": 13.8,
        "turbidity": 85.0,
        "tds": 9500.0,
        "electrical_conductivity": 12000.0,
        "hardness": 2200.0,
        "chloride": 4500.0,
        "nitrate": 280.0
    }
    spike_res = ml_service.detect_anomalies(anomalous_sample)
    assert spike_res["is_anomaly"] is True
