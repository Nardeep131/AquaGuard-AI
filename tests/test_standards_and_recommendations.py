import pytest
from backend.app.services.standards import evaluate_drinking_water, evaluate_environmental_water
from backend.app.services.recommendations import get_treatment_recommendations

def test_potable_drinking_water():
    # Ideal drinking water
    params = {
        "ph": 7.2,
        "turbidity": 0.8,
        "tds": 250.0,
        "electrical_conductivity": 380.0,
        "hardness": 120.0,
        "chloride": 45.0,
        "fluoride": 0.7,
        "nitrate": 10.0,
        "iron": 0.05,
        "arsenic": 0.0,
        "lead": 0.0,
        "e_coli": 0.0,
        "total_coliform": 0.0
    }
    result = evaluate_drinking_water(params)
    assert result["potable"] is True
    assert result["status"] == "Within configured limits"
    assert len(result["violations"]) == 0
    assert result["quality_score"] >= 90.0

def test_drinking_water_microbial_violation_overrides_potability():
    # Physically pristine but microbiological contamination present
    params = {
        "ph": 7.2,
        "turbidity": 0.5,
        "tds": 180.0,
        "e_coli": 4.0,  # CRITICAL VIOLATION
        "total_coliform": 12.0
    }
    result = evaluate_drinking_water(params)
    assert result["potable"] is False
    assert result["status"] == "Microbiological Contamination Detected"
    violation_names = [v["parameter"] for v in result["violations"]]
    assert "e_coli" in violation_names
    
    # Check recommendations generated
    recs = get_treatment_recommendations(result["violations"], category="drinking")
    assert any("disinfection" in r["title"].lower() or "uv" in r["title"].lower() for r in recs)

def test_drinking_water_high_tds_and_hardness():
    params = {
        "ph": 8.8,  # Above permissible 8.5
        "turbidity": 8.0,  # Above permissible 5 NTU
        "tds": 2400.0,  # Above permissible 2000 mg/L
        "hardness": 750.0  # Above permissible 600 mg/L
    }
    result = evaluate_drinking_water(params)
    assert result["potable"] is False
    recs = get_treatment_recommendations(result["violations"], category="drinking")
    rec_titles = [r["title"].lower() for r in recs]
    assert any("membrane" in t or "reverse osmosis" in t for t in rec_titles)
    assert any("softening" in t for t in rec_titles)

def test_environmental_water_sewage_evaluation():
    # Raw sewage / industrial wastewater sample
    params = {
        "ph": 8.2,
        "bod": 180.0,  # Extreme organic load
        "cod": 450.0,
        "dissolved_oxygen": 1.2,  # Hypoxic
        "tds": 1500.0,
        "ammonia": 28.0,
        "phosphates": 14.0
    }
    result = evaluate_environmental_water(params, source_type="sewage")
    assert result["potable"] is False
    assert result["cpcb_class"] == "Below Class E (Heavily Polluted)"
    assert "High Organic Load (BOD/COD)" in [v["issue"] for v in result["violations"]]
    
    recs = get_treatment_recommendations(result["violations"], category="environmental")
    assert any("biological" in r["title"].lower() or "aeration" in r["title"].lower() for r in recs)
