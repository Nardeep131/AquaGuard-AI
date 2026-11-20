import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(64), nullable=False, default="water_quality_engineer")
    organization = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    samples = relationship("WaterSample", back_populates="creator")

class WaterSample(Base):
    __tablename__ = "water_samples"

    id = Column(Integer, primary_key=True, index=True)
    sample_uid = Column(String(64), unique=True, index=True, nullable=False)
    category = Column(String(32), nullable=False)  # "drinking" or "environmental"
    source_name = Column(String(255), nullable=False)
    source_type = Column(String(64), nullable=True)  # "tap", "well", "river", "lake", "sewage", "effluent", etc.
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    collected_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    parameters_json = Column(Text, nullable=False)  # Store JSON representation of parameter dict
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    creator = relationship("User", back_populates="samples")
    analysis = relationship("AnalysisResult", back_populates="sample", uselist=False, cascade="all, delete-orphan")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    sample_id = Column(Integer, ForeignKey("water_samples.id"), nullable=False, unique=True)
    category = Column(String(32), nullable=False)
    potable = Column(Boolean, default=False)
    status = Column(String(128), nullable=False)
    overall_score = Column(Float, default=0.0)  # Quality index 0-100
    anomalies_detected = Column(Boolean, default=False)
    violations_json = Column(Text, nullable=True)  # List of threshold violations
    recommendations_json = Column(Text, nullable=True)  # List of treatment recommendations
    ml_prediction_json = Column(Text, nullable=True)  # ML model confidence, class, explainability
    lab_verified = Column(Boolean, default=False)
    verified_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sample = relationship("WaterSample", back_populates="analysis")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(128), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
