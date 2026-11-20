"""
AquaGuard AI Water Treatment Recommendation Engine
Maps water quality violations and environmental characteristics to
validated engineering treatment and remediation technologies.
"""
from typing import List, Dict, Any

def get_treatment_recommendations(violations: List[Dict[str, Any]], category: str = "drinking") -> List[Dict[str, Any]]:
    recommendations = []
    seen_techs = set()

    for v in violations:
        param = v.get("parameter", "").lower()
        issue = v.get("issue", "").lower()

        # Microbiological
        if param in ["e_coli", "total_coliform"] or "microbiolog" in issue:
            if "uv_disinfection" not in seen_techs:
                recommendations.append({
                    "title": "Ultraviolet (UV) Disinfection & Chlorination",
                    "technology": "UV-C Irradiation / Secondary Chlorination (0.2 - 0.5 ppm)",
                    "description": "Destroys bacterial DNA/RNA including E. coli and coliform bacteria. Follow with residual free chlorination to prevent post-treatment regrowth.",
                    "target_parameters": ["E. coli", "Total Coliform", "Pathogens"],
                    "urgency": "Immediate"
                })
                seen_techs.add("uv_disinfection")

        # High Turbidity
        if param == "turbidity" or "turbidity" in issue:
            if "filtration" not in seen_techs:
                recommendations.append({
                    "title": "Coagulation, Flocculation & Dual-Media Filtration",
                    "technology": "Alum/Poly-Aluminum Chloride (PAC) + Sand/Anthracite Bed",
                    "description": "Removes suspended colloidal particles causing turbidity, improving clarity and protecting downstream membrane/UV disinfection systems.",
                    "target_parameters": ["Turbidity", "Suspended Solids"],
                    "urgency": "Recommended"
                })
                seen_techs.add("filtration")

        # High TDS / Conductivity
        if param in ["tds", "electrical_conductivity"] or "tds" in issue:
            if "ro_membrane" not in seen_techs:
                recommendations.append({
                    "title": "Reverse Osmosis (RO) Membrane Separation",
                    "technology": "Thin-Film Composite (TFC) Polyamide RO Elements",
                    "description": "High-pressure membrane filtration rejecting 95-99% of dissolved inorganic salts, heavy metals, and toxic chemical compounds.",
                    "target_parameters": ["TDS", "Conductivity", "Dissolved Salts", "Chlorides"],
                    "urgency": "Recommended"
                })
                seen_techs.add("ro_membrane")

        # High Hardness
        if param == "hardness" or "hardness" in issue:
            if "softener" not in seen_techs:
                recommendations.append({
                    "title": "Ion-Exchange Water Softening",
                    "technology": "Strong Acid Cation (SAC) Resin in Sodium (Na+) Form",
                    "description": "Replaces scale-forming Calcium (Ca2+) and Magnesium (Mg2+) ions with Sodium ions, eliminating hardness and mineral scale buildup.",
                    "target_parameters": ["Total Hardness", "Calcium", "Magnesium"],
                    "urgency": "Recommended"
                })
                seen_techs.add("softener")

        # Heavy Metals (Arsenic, Lead, Iron)
        if param in ["arsenic", "lead", "iron"] or "arsenic" in issue or "lead" in issue:
            if "heavy_metals" not in seen_techs:
                recommendations.append({
                    "title": "Specialized Heavy Metal Adsorption & Catalytic Oxidation",
                    "technology": "Activated Alumina / Granular Ferric Hydroxide / Birm Filtration",
                    "description": "Catalytic oxidation and fixed-bed media adsorption specifically targeting toxic heavy metals like Arsenic, Lead, and excess Iron.",
                    "target_parameters": ["Arsenic", "Lead", "Iron"],
                    "urgency": "Immediate"
                })
                seen_techs.add("heavy_metals")

        # Environmental Sewage / BOD / COD
        if "bod" in param or "organic load" in issue:
            if "biological_treatment" not in seen_techs:
                recommendations.append({
                    "title": "Biological Secondary Treatment & Aeration",
                    "technology": "Moving Bed Biofilm Reactor (MBBR) / Activated Sludge Process (ASP)",
                    "description": "Aerobic biological digestion consuming organic carbon (BOD/COD), converting harmful ammonia to nitrate via nitrifying bacterial colonies.",
                    "target_parameters": ["BOD", "COD", "Ammonia", "Organic Load"],
                    "urgency": "Immediate"
                })
                seen_techs.add("biological_treatment")

        # Hypoxia / Low DO
        if param == "dissolved_oxygen" or "hypoxia" in issue:
            if "diffused_aeration" not in seen_techs:
                recommendations.append({
                    "title": "Fine-Bubble Diffused Aeration & Mechanical Oxygenation",
                    "technology": "Submersible Aeration Grid / Venturi Oxygenators",
                    "description": "Elevates dissolved oxygen levels rapidly to restore aquatic ecosystem balance, eliminate anoxic odors, and support beneficial aerobic bacteria.",
                    "target_parameters": ["Dissolved Oxygen", "Odor Prevention"],
                    "urgency": "Immediate"
                })
                seen_techs.add("diffused_aeration")

    # If no specific violations, provide preventive maintenance guidelines
    if not recommendations:
        recommendations.append({
            "title": "Routine Micron Filtration & Disinfection Monitoring",
            "technology": "5-Micron Sediment Filter + Periodic Online Quality Telemetry",
            "description": "Water quality currently complies with target standards. Maintain periodic testing and inspect distribution piping for integrity.",
            "target_parameters": ["Preventive Baseline"],
            "urgency": "Optional"
        })

    return recommendations
