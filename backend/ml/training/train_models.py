"""
AquaGuard AI Model Training Pipeline
Trains:
1. Random Forest Potability Classifier
2. Isolation Forest Anomaly Detector
Saves artifacts to backend/ml/models/
"""
import os
import joblib
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from backend.ml.datasets.dataset_builder import generate_water_dataset, FEATURES

def train_and_save_models():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("Generating training dataset...")
    df = generate_water_dataset(n_samples=3000)

    X = df[FEATURES]
    y = df["potable"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training Random Forest Classifier...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    print(f"Model Performance -> Accuracy: {acc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}")

    # Train Isolation Forest on normal/clean water data for baseline anomaly detection
    print("Training Isolation Forest Anomaly Detector...")
    clean_water = X_train[y_train == 1]
    iso_forest = IsolationForest(contamination=0.05, random_state=42, n_jobs=-1)
    iso_forest.fit(clean_water)

    # Save models
    rf_path = os.path.join(models_dir, "drinking_water_rf.joblib")
    iso_path = os.path.join(models_dir, "anomaly_detector.joblib")

    joblib.dump(rf, rf_path)
    joblib.dump(iso_forest, iso_path)
    print(f"Saved models to {models_dir}")

    return {
        "accuracy": acc,
        "f1_score": f1,
        "features": FEATURES,
        "rf_path": rf_path,
        "iso_path": iso_path
    }

if __name__ == "__main__":
    train_and_save_models()
