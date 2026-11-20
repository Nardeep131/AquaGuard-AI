"""
AquaGuard AI Machine Learning Inference Service
Provides model inference, anomaly detection, and Explainable AI (XAI)
feature contribution scores for water quality parameters.
"""
import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from backend.ml.datasets.dataset_builder import FEATURES

class WaterMLService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.models_dir = os.path.join(os.path.dirname(base_dir), "ml", "models")
        self.rf_model = None
        self.iso_model = None
        self._load_or_train()

    def _load_or_train(self):
        rf_path = os.path.join(self.models_dir, "drinking_water_rf.joblib")
        iso_path = os.path.join(self.models_dir, "anomaly_detector.joblib")

        if os.path.exists(rf_path) and os.path.exists(iso_path):
            try:
                self.rf_model = joblib.load(rf_path)
                self.iso_model = joblib.load(iso_path)
                return
            except Exception as e:
                print(f"Warning: Failed loading models, retraining: {e}")

        # Train on startup if missing
        from backend.ml.training.train_models import train_and_save_models
        train_and_save_models()
        self.rf_model = joblib.load(rf_path)
        self.iso_model = joblib.load(iso_path)

    def _extract_feature_vector(self, params: Dict[str, Any]) -> list[float]:
        # Fill defaults based on safe median values if optional parameter omitted
        defaults = {
            "ph": 7.0,
            "turbidity": 1.0,
            "tds": 300.0,
            "electrical_conductivity": 420.0,
            "hardness": 150.0,
            "chloride": 75.0,
            "nitrate": 15.0,
            "iron": 0.05,
            "arsenic": 0.001,
            "lead": 0.001
        }
        vector = []
        for feat in FEATURES:
            val = params.get(feat)
            if val is None:
                val = defaults.get(feat, 0.0)
            vector.append(float(val))
        return vector

    def predict_drinking_potability(self, params: Dict[str, Any]) -> Dict[str, Any]:
        vector = self._extract_feature_vector(params)
        X = pd.DataFrame([vector], columns=FEATURES)

        probs = self.rf_model.predict_proba(X)[0]
        potable_prob = float(probs[1])
        non_potable_prob = float(probs[0])

        is_potable = potable_prob >= 0.5
        confidence = float(max(potable_prob, non_potable_prob))

        # Explainable AI: Feature contributions based on model importances & distance from mean
        feature_importances = self.rf_model.feature_importances_
        feature_contributions = {}
        for feat, weight, val in zip(FEATURES, feature_importances, vector):
            # Compute standardized impact score
            feature_contributions[feat] = {
                "measured": val,
                "importance_weight": round(float(weight), 4),
                "influence": "Elevated / Risk Factor" if (feat == "ph" and (val < 6.5 or val > 8.5)) or (feat == "tds" and val > 500) or (feat == "turbidity" and val > 1.0) or (feat in ["arsenic", "lead"] and val > 0.01) else "Normal / Safe Range"
            }

        return {
            "predicted_class": 1 if is_potable else 0,
            "predicted_label": "Potable (Screening)" if is_potable else "Non-Potable / Treatment Needed",
            "confidence": round(confidence, 4),
            "potable_probability": round(potable_prob, 4),
            "non_potable_probability": round(non_potable_prob, 4),
            "feature_contributions": feature_contributions,
            "scientific_note": "ML prediction is an algorithmic screening tool and does not substitute for accredited microbiological laboratory testing."
        }

    def detect_anomalies(self, params: Dict[str, Any]) -> Dict[str, Any]:
        vector = self._extract_feature_vector(params)
        X = pd.DataFrame([vector], columns=FEATURES)

        score = self.iso_model.decision_function(X)[0]
        # In scikit-learn, negative score indicates outlier / anomaly
        is_anomaly = bool(score < -0.05 or self.iso_model.predict(X)[0] == -1)

        # Also flag extreme physics out-of-bounds as hard anomalies
        ph = params.get("ph", 7.0)
        tds = params.get("tds", 300.0)
        turbidity = params.get("turbidity", 1.0)
        if ph < 4.0 or ph > 10.5 or tds > 4000.0 or turbidity > 50.0:
            is_anomaly = True

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(float(score), 4),
            "status": "Potential Contamination / Extreme Anomaly Detected" if is_anomaly else "Normal Profile",
            "severity": "Critical" if is_anomaly else "Low"
        }

ml_service = WaterMLService()
