"""
AquaGuard AI Standards Evaluation Engine
Implements BIS IS 10500:2012 and WHO Drinking-Water Guidelines,
and CPCB Classification for Environmental Surface Waters.
"""
from typing import Dict, Any, List

# BIS IS 10500:2012 Table of Limits
BIS_DRINKING_LIMITS = {
    "ph": {"acceptable_min": 6.5, "acceptable_max": 8.5, "permissible_max": 8.5, "unit": ""},
    "turbidity": {"acceptable_max": 1.0, "permissible_max": 5.0, "unit": "NTU"},
    "tds": {"acceptable_max": 500.0, "permissible_max": 2000.0, "unit": "mg/L"},
    "electrical_conductivity": {"acceptable_max": 750.0, "permissible_max": 1500.0, "unit": "µS/cm"},
    "hardness": {"acceptable_max": 200.0, "permissible_max": 600.0, "unit": "mg/L"},
    "chloride": {"acceptable_max": 250.0, "permissible_max": 1000.0, "unit": "mg/L"},
    "fluoride": {"acceptable_max": 1.0, "permissible_max": 1.5, "unit": "mg/L"},
    "nitrate": {"acceptable_max": 45.0, "permissible_max": 45.0, "unit": "mg/L"},
    "iron": {"acceptable_max": 1.0, "permissible_max": 1.0, "unit": "mg/L"},
    "arsenic": {"acceptable_max": 0.01, "permissible_max": 0.05, "unit": "mg/L"},
    "lead": {"acceptable_max": 0.01, "permissible_max": 0.01, "unit": "mg/L"},
    "e_coli": {"acceptable_max": 0.0, "permissible_max": 0.0, "unit": "CFU/100ml"},
    "total_coliform": {"acceptable_max": 0.0, "permissible_max": 0.0, "unit": "CFU/100ml"},
}

def evaluate_drinking_water(params: Dict[str, Any]) -> Dict[str, Any]:
    violations: List[Dict[str, Any]] = []
    microbiological_fail = False
    chemical_fail = False
    score = 100.0

    for param, limits in BIS_DRINKING_LIMITS.items():
        val = params.get(param)
        if val is None:
            continue

        acc_max = limits.get("acceptable_max")
        acc_min = limits.get("acceptable_min")
        perm_max = limits.get("permissible_max")
        unit = limits.get("unit", "")

        # Check microbial parameters first (ZERO TOLERANCE)
        if param in ["e_coli", "total_coliform"]:
            if val > 0:
                microbiological_fail = True
                violations.append({
                    "parameter": param,
                    "issue": f"{param.replace('_', ' ').title()} present ({val} {unit})",
                    "measured_value": val,
                    "acceptable_limit": "0 CFU/100ml",
                    "permissible_limit": "0 CFU/100ml",
                    "severity": "critical"
                })
                score -= 40.0
            continue

        # Check lower bound (pH)
        if acc_min is not None and val < acc_min:
            chemical_fail = True
            violations.append({
                "parameter": param,
                "issue": f"{param.upper()} is acidic ({val} < {acc_min})",
                "measured_value": val,
                "acceptable_limit": f"{acc_min} - {acc_max}",
                "permissible_limit": f"{acc_min} - {perm_max}",
                "severity": "warning" if val >= 6.0 else "critical"
            })
            score -= 15.0

        # Check upper bounds
        if acc_max is not None and val > acc_max:
            if perm_max is not None and val > perm_max:
                chemical_fail = True
                violations.append({
                    "parameter": param,
                    "issue": f"{param.replace('_', ' ').title()} exceeds permissible limit ({val} > {perm_max} {unit})",
                    "measured_value": val,
                    "acceptable_limit": f"<= {acc_max} {unit}",
                    "permissible_limit": f"<= {perm_max} {unit}",
                    "severity": "critical"
                })
                score -= 20.0
            else:
                violations.append({
                    "parameter": param,
                    "issue": f"{param.replace('_', ' ').title()} exceeds acceptable limit ({val} > {acc_max} {unit})",
                    "measured_value": val,
                    "acceptable_limit": f"<= {acc_max} {unit}",
                    "permissible_limit": f"<= {perm_max} {unit}",
                    "severity": "warning"
                })
                score -= 10.0

    score = max(0.0, min(100.0, score))
    is_potable = (not microbiological_fail) and (not chemical_fail) and (score >= 80.0)

    if microbiological_fail:
        status = "Microbiological Contamination Detected"
    elif chemical_fail:
        status = "Chemical Contamination / Treatment Required"
    elif len(violations) > 0:
        status = "Acceptable with Minor Deviations"
    else:
        status = "Within configured limits"

    return {
        "potable": is_potable,
        "status": status,
        "quality_score": round(score, 1),
        "violations": violations,
        "microbiological_fail": microbiological_fail,
        "chemical_fail": chemical_fail
    }

def evaluate_environmental_water(params: Dict[str, Any], source_type: str = "river") -> Dict[str, Any]:
    """
    CPCB Designated Best Use Water Quality Criteria:
    Class A: Drinking water source without conventional treatment but after disinfection (DO >= 6, BOD <= 2, pH 6.5-8.5)
    Class B: Outdoor bathing (DO >= 5, BOD <= 3, pH 6.5-8.5)
    Class C: Drinking water source after conventional treatment and disinfection (DO >= 4, BOD <= 3, pH 6-9)
    Class D: Propagation of Wildlife and Fisheries (DO >= 4, pH 6.5-8.5, free ammonia <= 1.2 mg/L)
    Class E: Irrigation, Industrial Cooling, Controlled Waste disposal
    Below Class E: Heavily Polluted
    """
    violations: List[Dict[str, Any]] = []
    ph = params.get("ph", 7.0)
    do = params.get("dissolved_oxygen", 5.0)
    bod = params.get("bod", 2.0)
    cod = params.get("cod")
    tds = params.get("tds")
    ammonia = params.get("ammonia")
    phosphates = params.get("phosphates")

    # High organic pollution check
    if bod >= 30.0 or (cod is not None and cod >= 250.0):
        violations.append({
            "parameter": "bod_cod",
            "issue": "High Organic Load (BOD/COD)",
            "measured_value": bod,
            "acceptable_limit": "BOD <= 3.0 mg/L",
            "permissible_limit": "BOD <= 30.0 mg/L (Treated Effluent)",
            "severity": "critical"
        })

    # Hypoxia check
    if do < 4.0:
        violations.append({
            "parameter": "dissolved_oxygen",
            "issue": f"Severe Hypoxia / Low Oxygen ({do} < 4.0 mg/L)",
            "measured_value": do,
            "acceptable_limit": "DO >= 6.0 mg/L",
            "permissible_limit": "DO >= 4.0 mg/L",
            "severity": "critical" if do < 2.0 else "warning"
        })

    # Nutrient enrichment / Eutrophication
    if phosphates is not None and phosphates > 0.5:
        violations.append({
            "parameter": "phosphates",
            "issue": f"Nutrient Pollution / Eutrophication Risk ({phosphates} mg/L)",
            "measured_value": phosphates,
            "acceptable_limit": "<= 0.1 mg/L",
            "permissible_limit": "<= 0.5 mg/L",
            "severity": "warning"
        })

    if ammonia is not None and ammonia > 1.2:
        violations.append({
            "parameter": "ammonia",
            "issue": f"Toxic Free Ammonia ({ammonia} mg/L)",
            "measured_value": ammonia,
            "acceptable_limit": "<= 0.5 mg/L",
            "permissible_limit": "<= 1.2 mg/L",
            "severity": "critical"
        })

    # Determine CPCB Class
    if bod > 15.0 or do < 2.0 or source_type in ["sewage", "industrial_effluent", "drainage"]:
        cpcb_class = "Below Class E (Heavily Polluted)"
        quality_score = max(5.0, 40.0 - (bod * 0.15))
        status = "Severe Pollution / Treatment Mandated"
    elif do >= 6.0 and bod <= 2.0 and 6.5 <= ph <= 8.5:
        cpcb_class = "Class A (Pristine / Drinking after Disinfection)"
        quality_score = 92.0
        status = "Healthy Aquatic Ecosystem"
    elif do >= 5.0 and bod <= 3.0 and 6.5 <= ph <= 8.5:
        cpcb_class = "Class B (Outdoor Bathing / Recreation)"
        quality_score = 80.0
        status = "Good Ecological Condition"
    elif do >= 4.0 and bod <= 3.0 and 6.0 <= ph <= 9.0:
        cpcb_class = "Class C (Conventional Treatment Required)"
        quality_score = 70.0
        status = "Moderate Impact / Treatment Required"
    elif do >= 4.0:
        cpcb_class = "Class D (Wildlife & Fisheries Only)"
        quality_score = 60.0
        status = "Stressed Ecosystem"
    else:
        cpcb_class = "Class E (Irrigation / Industrial Cooling Only)"
        quality_score = 50.0
        status = "Degraded Water Quality"

    return {
        "potable": False,  # Environmental water is NEVER directly certified potable
        "cpcb_class": cpcb_class,
        "status": status,
        "quality_score": round(quality_score, 1),
        "violations": violations
    }
