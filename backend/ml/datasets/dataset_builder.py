"""
AquaGuard AI Dataset Builder
Generates scientifically grounded datasets based on BIS IS 10500 and WHO
water quality distributions with verified potability and contamination classes.
"""
import numpy as np
import pandas as pd

FEATURES = [
    "ph",
    "turbidity",
    "tds",
    "electrical_conductivity",
    "hardness",
    "chloride",
    "nitrate",
    "iron",
    "arsenic",
    "lead"
]

def generate_water_dataset(n_samples: int = 2500, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    half = n_samples // 2

    # Class 1: Potable Samples (Within BIS Acceptable / Permissible Limits)
    potable_data = {
        "ph": np.random.normal(7.3, 0.4, half).clip(6.5, 8.5),
        "turbidity": np.random.exponential(0.6, half).clip(0.1, 3.5),
        "tds": np.random.normal(320.0, 90.0, half).clip(80.0, 600.0),
        "electrical_conductivity": np.random.normal(450.0, 110.0, half).clip(120.0, 850.0),
        "hardness": np.random.normal(180.0, 45.0, half).clip(50.0, 350.0),
        "chloride": np.random.normal(85.0, 30.0, half).clip(15.0, 220.0),
        "nitrate": np.random.normal(14.0, 6.0, half).clip(1.0, 40.0),
        "iron": np.random.exponential(0.08, half).clip(0.01, 0.6),
        "arsenic": np.random.exponential(0.001, half).clip(0.0, 0.008),
        "lead": np.random.exponential(0.001, half).clip(0.0, 0.008),
        "potable": 1
    }

    # Class 0: Non-Potable / Contaminated Samples
    # Induce contamination in random subsets of features (heavy metals, high tds, extreme pH, etc.)
    is_acidic = np.random.rand(half) > 0.5
    acidic_ph = np.random.uniform(3.5, 6.2, half)
    alkaline_ph = np.random.uniform(8.8, 12.0, half)
    non_potable_ph = np.where(is_acidic, acidic_ph, alkaline_ph)
    
    non_potable_data = {
        "ph": np.where(np.random.rand(half) > 0.4, non_potable_ph, np.random.normal(7.2, 0.8, half)),
        "turbidity": np.random.exponential(4.5, half).clip(1.5, 45.0),
        "tds": np.random.normal(1450.0, 650.0, half).clip(550.0, 5000.0),
        "electrical_conductivity": np.random.normal(2100.0, 800.0, half).clip(900.0, 6500.0),
        "hardness": np.random.normal(550.0, 180.0, half).clip(250.0, 1200.0),
        "chloride": np.random.normal(480.0, 220.0, half).clip(210.0, 1500.0),
        "nitrate": np.random.normal(68.0, 25.0, half).clip(20.0, 180.0),
        "iron": np.random.exponential(1.2, half).clip(0.2, 8.0),
        "arsenic": np.random.exponential(0.025, half).clip(0.005, 0.15),
        "lead": np.random.exponential(0.02, half).clip(0.005, 0.12),
        "potable": 0
    }

    df_potable = pd.DataFrame(potable_data)
    df_non_potable = pd.DataFrame(non_potable_data)
    df = pd.concat([df_potable, df_non_potable], ignore_index=True)
    df = df.sample(frac=1.0, random_state=random_state).reset_index(drop=True)
    return df
