export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  organization?: string;
}

export interface DrinkingWaterParams {
  ph: number;
  turbidity: number;
  tds: number;
  electrical_conductivity?: number;
  dissolved_oxygen?: number;
  hardness?: number;
  chloride?: number;
  fluoride?: number;
  nitrate?: number;
  iron?: number;
  arsenic?: number;
  lead?: number;
  e_coli?: number;
  total_coliform?: number;
}

export interface EnvironmentalWaterParams {
  ph: number;
  turbidity?: number;
  dissolved_oxygen: number;
  bod: number;
  cod?: number;
  tds?: number;
  conductivity?: number;
  nitrates?: number;
  phosphates?: number;
  ammonia?: number;
  heavy_metals?: number;
  coliform?: number;
}

export interface ViolationDetail {
  parameter: string;
  issue: string;
  measured_value: number;
  acceptable_limit?: string;
  permissible_limit?: string;
  severity: 'warning' | 'critical';
}

export interface TreatmentRec {
  title: string;
  technology: string;
  description: string;
  target_parameters: string[];
  urgency: string;
}

export interface WaterAnalysisResponse {
  sample_uid: string;
  category: 'drinking' | 'environmental';
  source_name: string;
  source_type?: string;
  location: string;
  collected_at: string;
  potable: boolean;
  status: string;
  quality_score: number;
  cpcb_class?: string;
  violations: ViolationDetail[];
  recommendations: TreatmentRec[];
  ml_prediction?: any;
  disclaimer: string;
}

export interface DashboardStats {
  total_samples: number;
  drinking_samples: number;
  environmental_samples: number;
  samples_requiring_investigation: number;
  potable_compliant_samples: number;
  treatment_needed_samples: number;
  average_quality_score: number;
  compliance_rate_percent: number;
}
