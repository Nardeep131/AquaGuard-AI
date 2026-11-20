from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import WaterSample, AnalysisResult, User
from backend.app.authentication.auth import get_current_user
from backend.app.services.pdf_generator import generate_water_quality_pdf

router = APIRouter(prefix="/api/water/reports", tags=["Reports"])

@router.get("/{sample_uid}/pdf")
def download_water_report_pdf(
    sample_uid: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sample = db.query(WaterSample).filter(WaterSample.sample_uid == sample_uid).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Water sample record not found")

    analysis = sample.analysis
    if not analysis:
        raise HTTPException(status_code=400, detail="Analysis results not yet compiled for this sample")

    pdf_bytes = generate_water_quality_pdf(sample, analysis, current_user)

    filename = f"AquaGuard_Report_{sample_uid}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
