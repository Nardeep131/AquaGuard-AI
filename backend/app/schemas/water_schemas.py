from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class DrinkingWaterParams(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0, description="pH level (0-14)")
    turbidity: float = Field(..., ge=0.0, description="Turbidity in NTU")
    tds: float = Field(..., ge=0.0, description="Total Dissolved Solids in mg/L")
    electrical_conductivity: Optional[float] = Field(None, ge=0.0, description="EC in µS/cm")
    dissolved_oxygen: Optional[float] = Field(None, ge=0.0, description="DO in mg/L")
    hardness: Optional[float] = Field(None, ge=0.0, description="Total Hardness as CaCO3 in mg/L")
    chloride: Optional[float] = Field(None, ge=0.0, description="Chloride in mg/L")
    fluoride: Optional[float] = Field(None, ge=0.0, description="Fluoride in mg/L")
    nitrate: Optional[float] = Field(None, ge=0.0, description="Nitrate in mg/L")
    iron: Optional[float] = Field(None, ge=0.0, description="Iron in mg/L")
    arsenic: Optional[float] = Field(None, ge=0.0, description="Arsenic in mg/L")
    lead: Optional[float] = Field(None, ge=0.0, description="Lead in mg/L")
    e_coli: Optional[float] = Field(0.0, ge=0.0, description="E. coli CFU/100ml")
    total_coliform: Optional[float] = Field(0.0, ge=0.0, description="Total Coliform CFU/100ml")

class EnvironmentalWaterParams(BaseModel):
    ph: float = Field(..., ge=0.0, le=14.0, description="pH level (0-14)")
    turbidity: Optional[float] = Field(None, ge=0.0, description="Turbidity in NTU")
    dissolved_oxygen: float = Field(..., ge=0.0, description="Dissolved Oxygen in mg/L")
    bod: float = Field(..., ge=0.0, description="Biological Oxygen Demand in mg/L")
    cod: Optional[float] = Field(None, ge=0.0, description="Chemical Oxygen Demand in mg/L")
    tds: Optional[float] = Field(None, ge=0.0, description="TDS in mg/L")
    conductivity: Optional[float] = Field(None, ge=0.0, description="Conductivity in µS/cm")
    nitrates: Optional[float] = Field(None, ge=0.0, description="Nitrates in mg/L")
    phosphates: Optional[float] = Field(None, ge=0.0, description="Phosphates in mg/L")
    ammonia: Optional[float] = Field(None, ge=0.0, description="Free Ammonia in mg/L")
    heavy_metals: Optional[float] = Field(None, ge=0.0, description="Cumulative heavy metals in mg/L")
    coliform: Optional[float] = Field(None, ge=0.0, description="Fecal Coliform MPN/100ml")

class WaterAnalysisRequest(BaseModel):
    category: str = Field(..., pattern="^(drinking|environmental)$")
    source_name: str
    source_type: Optional[str] = "municipal_tap"  # tap, well, bottled, river, lake, pond, sewage, effluent
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    drinking_params: Optional[DrinkingWaterParams] = None
    environmental_params: Optional[EnvironmentalWaterParams] = None

class ViolationDetail(BaseModel):
    parameter: str
    issue: str
    measured_value: float
    acceptable_limit: Optional[str]
    permissible_limit: Optional[str]
    severity: str  # "warning", "critical"

class TreatmentRec(BaseModel):
    title: str
    technology: str
    description: str
    target_parameters: List[str]
    urgency: str  # "Immediate", "Recommended", "Optional"

class WaterAnalysisResponse(BaseModel):
    sample_uid: str
    category: str
    source_name: str
    source_type: Optional[str]
    location: str
    collected_at: str
    potable: bool
    status: str
    quality_score: float
    cpcb_class: Optional[str] = None
    violations: List[ViolationDetail]
    recommendations: List[TreatmentRec]
    ml_prediction: Optional[Dict[str, Any]] = None
    disclaimer: str
