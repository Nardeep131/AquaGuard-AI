export interface FAQItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

export const SUGGESTED_QUESTIONS = [
  "What is AquaGuard AI?",
  "How does water-quality analysis work?",
  "What is TDS?",
  "What is pH in drinking water?",
  "How does water filtration work?",
  "What is sewage treatment?",
  "How can I generate a water report?"
];

export const KNOWLEDGE_BASE: FAQItem[] = [
  {
    id: "about",
    question: "What is AquaGuard AI?",
    keywords: ["what is", "about", "aquaguard", "platform", "purpose"],
    answer: "AquaGuard AI is an intelligent water quality analysis and environmental monitoring platform. It combines physical-chemical standards (BIS IS 10500:2012 & WHO), Scikit-learn machine learning classification, and treatment engineering to safeguard human drinking water and natural aquatic ecosystems."
  },
  {
    id: "how_works",
    question: "How does water-quality analysis work?",
    keywords: ["how does", "analysis work", "method", "process", "algorithm"],
    answer: "AquaGuard AI operates a dual analysis pipeline: (1) Deterministic rule evaluation against statutory thresholds (such as BIS IS 10500 and CPCB surface water classes) with zero tolerance for microbial indicators like E. coli, and (2) Scikit-learn Random Forest and Isolation Forest inference providing potability probabilities and anomaly detection."
  },
  {
    id: "drinking",
    question: "What is drinking water analysis?",
    keywords: ["drinking water", "potability", "potable", "bis", "is 10500", "who"],
    answer: "Drinking water analysis evaluates whether treated or bottled water is safe for human consumption. It measures 14 essential parameters including pH, Turbidity, Total Dissolved Solids (TDS), Hardness, Heavy Metals (Arsenic, Lead), and microbial bacteria (E. coli and Coliform) against BIS IS 10500:2012 standards."
  },
  {
    id: "environmental",
    question: "How does environmental water monitoring work?",
    keywords: ["environmental", "river", "lake", "pond", "cpcb", "basin", "ambient"],
    answer: "Environmental monitoring assesses natural water bodies (rivers, lakes, wetlands) and wastewater outlets against Central Pollution Control Board (CPCB) Designated Best Use criteria. It evaluates Dissolved Oxygen (DO), Biochemical Oxygen Demand (BOD), Chemical Oxygen Demand (COD), and nutrient enrichment (Phosphates/Ammonia)."
  },
  {
    id: "tds",
    question: "What is TDS?",
    keywords: ["tds", "total dissolved solids", "salts", "minerals", "taste"],
    answer: "Total Dissolved Solids (TDS) measures the cumulative dissolved minerals, salts, and metals in mg/L (ppm). Under BIS IS 10500, the acceptable limit is 500 mg/L and permissible limit is 2000 mg/L. High TDS causes mineral scaling and bitter taste, while excessively low TDS (<50 mg/L) may lack beneficial essential minerals."
  },
  {
    id: "ph",
    question: "What is pH in water?",
    keywords: ["ph", "acidity", "alkaline", "acidic", "corrosion"],
    answer: "pH measures the balance of hydrogen ions in water on a 0–14 scale. The acceptable drinking water range under BIS IS 10500 is 6.5 to 8.5. Water with pH < 6.5 is acidic and corrosive to plumbing pipes, while pH > 8.5 is alkaline and can cause taste issues and reduced chlorine disinfection efficacy."
  },
  {
    id: "turbidity",
    question: "What is turbidity?",
    keywords: ["turbidity", "cloudiness", "ntu", "clarity", "suspended"],
    answer: "Turbidity measures the optical cloudiness or haziness of water caused by suspended colloidal particles in Nephelometric Turbidity Units (NTU). Drinking water should ideally be below 1.0 NTU (acceptable) and never exceed 5.0 NTU (permissible), as particulate matter shields pathogenic bacteria from UV or chlorine disinfection."
  },
  {
    id: "filtration",
    question: "How does water filtration work?",
    keywords: ["filtration", "filter", "ro", "reverse osmosis", "softener", "purification"],
    answer: "Water purification utilizes a multi-barrier engineering approach: (1) Media/Sediment filters remove suspended particles and turbidity, (2) Activated Carbon adsorbs organic compounds and chlorine taste, (3) Ion-Exchange Softeners remove Ca/Mg hardness, (4) Reverse Osmosis (RO) rejects dissolved salts and heavy metals, and (5) UV-C irradiation destroys bacterial DNA."
  },
  {
    id: "sewage",
    question: "What is sewage treatment?",
    keywords: ["sewage", "wastewater", "stp", "etp", "effluent", "mbbr", "sludge"],
    answer: "Sewage Treatment Plants (STP) process municipal and domestic wastewater using physical screening, primary clarification, and biological secondary treatment (such as MBBR or Activated Sludge Process). Beneficial aerobic microbes consume organic pollutants (lowering BOD and COD) before final disinfection and discharge."
  },
  {
    id: "pdf_report",
    question: "How can I generate a water-quality report?",
    keywords: ["report", "pdf", "generate", "download", "certificate"],
    answer: "After analyzing any drinking or environmental water sample, AquaGuard AI instantly creates an official test report. Click 'Download PDF Certificate' on the results card or navigate to the 'Reports' tab to download a verified PDF complete with sample metadata, limit tables, and engineering recommendations."
  }
];

export function findBotResponse(userInput: string): string {
  const normalized = userInput.toLowerCase().trim();

  // Keyword score matcher
  let bestMatch: FAQItem | null = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length; // weight longer specific phrases higher
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 3) {
    return bestMatch.answer;
  }

  return "I can assist you with drinking water safety limits (BIS IS 10500), environmental monitoring (CPCB classes), water parameters (pH, TDS, Turbidity, BOD), filtration technologies (RO, UV, Softening), or PDF report generation. Click one of the suggested topics above or ask a specific question!";
}
