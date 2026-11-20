import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User, WaterSample, AnalysisResult
from backend.app.authentication.auth import get_current_user
from backend.app.schemas.water_schemas import (
    WaterAnalysisRequest,
    WaterAnalysisResponse,
    ViolationDetail,
    TreatmentRec
)
from backend.app.services.standards import (
    evaluate_drinking_water,
    evaluate_environmental_water,
    BIS_DRINKING_LIMITS
)
from backend.app.services.recommendations import get_treatment_recommendations
from backend.app.services.ml_service import ml_service

router = APIRouter(prefix="/api/water", tags=["Water Analysis"])

DISCLAIMER_TEXT = (
    "NOTICE: AquaGuard AI analysis results and machine-learning predictions are preliminary decision-support outputs. "
    "They do not replace accredited microbiological laboratory testing or certified regulatory compliance audits. "
    "Potability must always be confirmed through certified laboratory cultures."
)

@router.post("/drinking/analyze", response_model=WaterAnalysisResponse)
def analyze_drinking_water(
    payload: WaterAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload.drinking_params:
        raise HTTPException(status_code=400, detail="Drinking water parameters are required")

    params_dict = payload.drinking_params.model_dump()
    std_result = evaluate_drinking_water(params_dict)
    recs = get_treatment_recommendations(std_result["violations"], category="drinking")
    ml_pred = ml_service.predict_drinking_potability(params_dict)
    anomaly_pred = ml_service.detect_anomalies(params_dict)

    # If microbial fail, strictly override potability to false
    final_potable = std_result["potable"]
    if std_result.get("microbiological_fail"):
        final_potable = False
        status_msg = "Microbiological Contamination Detected - NOT Potable"
    elif not final_potable:
        status_msg = std_result["status"]
    else:
        status_msg = "Potable (Complies with IS 10500 Guidelines)"

    # Generate sample UID
    sample_uid = f"AG-DW-{uuid.uuid4().hex[:8].upper()}"

    # Persist in DB
    sample_record = WaterSample(
        sample_uid=sample_uid,
        category="drinking",
        source_name=payload.source_name,
        source_type=payload.source_type or "municipal_tap",
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        collected_at=datetime.utcnow(),
        parameters_json=json.dumps(params_dict),
        user_id=current_user.id
    )
    db.add(sample_record)
    db.flush()

    analysis_record = AnalysisResult(
        sample_id=sample_record.id,
        category="drinking",
        potable=final_potable,
        status=status_msg,
        overall_score=std_result["quality_score"],
        anomalies_detected=anomaly_pred["is_anomaly"],
        violations_json=json.dumps(std_result["violations"]),
        recommendations_json=json.dumps(recs),
        ml_prediction_json=json.dumps({
            "ml_potability": ml_pred,
            "anomaly_analysis": anomaly_pred
        }),
        lab_verified=False
    )
    db.add(analysis_record)
    db.commit()

    return WaterAnalysisResponse(
        sample_uid=sample_uid,
        category="drinking",
        source_name=payload.source_name,
        source_type=payload.source_type,
        location=payload.location,
        collected_at=sample_record.collected_at.isoformat(),
        potable=final_potable,
        status=status_msg,
        quality_score=std_result["quality_score"],
        violations=[ViolationDetail(**v) for v in std_result["violations"]],
        recommendations=[TreatmentRec(**r) for r in recs],
        ml_prediction={
            "screening": ml_pred,
            "anomaly": anomaly_pred
        },
        disclaimer=DISCLAIMER_TEXT
    )

@router.post("/environmental/analyze", response_model=WaterAnalysisResponse)
def analyze_environmental_water(
    payload: WaterAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload.environmental_params:
        raise HTTPException(status_code=400, detail="Environmental water parameters are required")

    params_dict = payload.environmental_params.model_dump()
    source_type = payload.source_type or "river"
    std_result = evaluate_environmental_water(params_dict, source_type=source_type)
    recs = get_treatment_recommendations(std_result["violations"], category="environmental")

    sample_uid = f"AG-ENV-{uuid.uuid4().hex[:8].upper()}"

    sample_record = WaterSample(
        sample_uid=sample_uid,
        category="environmental",
        source_name=payload.source_name,
        source_type=source_type,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        collected_at=datetime.utcnow(),
        parameters_json=json.dumps(params_dict),
        user_id=current_user.id
    )
    db.add(sample_record)
    db.flush()

    analysis_record = AnalysisResult(
        sample_id=sample_record.id,
        category="environmental",
        potable=False,  # Never label untreated environmental water as potable
        status=std_result["status"],
        overall_score=std_result["quality_score"],
        anomalies_detected=len(std_result["violations"]) > 0,
        violations_json=json.dumps(std_result["violations"]),
        recommendations_json=json.dumps(recs),
        ml_prediction_json=json.dumps({
            "cpcb_class": std_result["cpcb_class"],
            "pollution_risk": "Severe" if std_result["quality_score"] < 50 else "Moderate" if std_result["quality_score"] < 75 else "Low"
        }),
        lab_verified=False
    )
    db.add(analysis_record)
    db.commit()

    return WaterAnalysisResponse(
        sample_uid=sample_uid,
        category="environmental",
        source_name=payload.source_name,
        source_type=source_type,
        location=payload.location,
        collected_at=sample_record.collected_at.isoformat(),
        potable=False,
        status=std_result["status"],
        quality_score=std_result["quality_score"],
        cpcb_class=std_result["cpcb_class"],
        violations=[ViolationDetail(**v) for v in std_result["violations"]],
        recommendations=[TreatmentRec(**r) for r in recs],
        ml_prediction={
            "cpcb_class": std_result["cpcb_class"],
            "risk_assessment": "Treatment Required Before Release" if std_result["quality_score"] < 70 else "Acceptable Ambient Stream"
        },
        disclaimer=DISCLAIMER_TEXT
    )

@router.get("/history")
def get_sample_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    samples = db.query(WaterSample).order_by(WaterSample.created_at.desc()).limit(50).all()
    results = []
    for s in samples:
        analysis = s.analysis
        results.append({
            "id": s.id,
            "sample_uid": s.sample_uid,
            "category": s.category,
            "source_name": s.source_name,
            "source_type": s.source_type,
            "location": s.location,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "collected_at": s.collected_at.isoformat(),
            "potable": analysis.potable if analysis else False,
            "status": analysis.status if analysis else "Pending",
            "quality_score": analysis.overall_score if analysis else 0.0,
            "anomalies_detected": analysis.anomalies_detected if analysis else False,
            "parameters": json.loads(s.parameters_json) if s.parameters_json else {},
            "violations": json.loads(analysis.violations_json) if (analysis and analysis.violations_json) else [],
            "recommendations": json.loads(analysis.recommendations_json) if (analysis and analysis.recommendations_json) else [],
            "ml_prediction": json.loads(analysis.ml_prediction_json) if (analysis and analysis.ml_prediction_json) else {}
        })
    return results

@router.get("/standards")
def get_standards():
    return {
        "drinking": {
            "standard_name": "BIS IS 10500:2012 & WHO Guidelines",
            "parameters": BIS_DRINKING_LIMITS
        },
        "environmental": {
            "standard_name": "Central Pollution Control Board (CPCB) Water Criteria",
            "classes": [
                {"class": "Class A", "description": "Drinking water source without conventional treatment but after disinfection", "criteria": "DO >= 6 mg/L, BOD <= 2 mg/L, pH 6.5-8.5"},
                {"class": "Class B", "description": "Outdoor bathing", "criteria": "DO >= 5 mg/L, BOD <= 3 mg/L, pH 6.5-8.5"},
                {"class": "Class C", "description": "Drinking water source with conventional treatment", "criteria": "DO >= 4 mg/L, BOD <= 3 mg/L, pH 6.0-9.0"},
                {"class": "Class D", "description": "Fish culture and wildlife propagation", "criteria": "DO >= 4 mg/L, free ammonia <= 1.2 mg/L"},
                {"class": "Class E", "description": "Irrigation, industrial cooling, and controlled waste disposal", "criteria": "pH 6.0-8.5, Electrical Conductivity <= 2250 µS/cm"}
            ]
        }
    }
