from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import WaterSample, AnalysisResult, User
from backend.app.authentication.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_samples = db.query(WaterSample).count()
    drinking_samples = db.query(WaterSample).filter(WaterSample.category == "drinking").count()
    environmental_samples = db.query(WaterSample).filter(WaterSample.category == "environmental").count()
    
    anomalies_count = db.query(AnalysisResult).filter(AnalysisResult.anomalies_detected == True).count()
    potable_count = db.query(AnalysisResult).filter(AnalysisResult.potable == True).count()
    treatment_needed = db.query(AnalysisResult).filter(AnalysisResult.potable == False).count()
    
    # Calculate average score
    scores = [r.overall_score for r in db.query(AnalysisResult.overall_score).all()]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 85.0

    return {
        "total_samples": total_samples,
        "drinking_samples": drinking_samples,
        "environmental_samples": environmental_samples,
        "samples_requiring_investigation": anomalies_count,
        "potable_compliant_samples": potable_count,
        "treatment_needed_samples": treatment_needed,
        "average_quality_score": avg_score,
        "compliance_rate_percent": round((potable_count / drinking_samples * 100), 1) if drinking_samples > 0 else 0.0
    }
