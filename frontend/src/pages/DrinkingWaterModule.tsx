import React, { useState } from 'react';
import { 
  Droplet, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Cpu, 
  Sparkles, 
  Info,
  Wrench,
  BarChart2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { waterService } from '../services/api';
import { WaterAnalysisResponse, DrinkingWaterParams } from '../types';

const PRESETS = [
  {
    name: "Pure Bottled Spring (Bisleri/Aquafina)",
    params: {
      ph: 7.2,
      turbidity: 0.4,
      tds: 140.0,
      electrical_conductivity: 210.0,
      hardness: 70.0,
      chloride: 28.0,
      fluoride: 0.6,
      nitrate: 6.0,
      iron: 0.02,
      arsenic: 0.0,
      lead: 0.0,
      e_coli: 0.0,
      total_coliform: 0.0
    }
  },
  {
    name: "Standard Municipal Tap Water",
    params: {
      ph: 7.4,
      turbidity: 0.9,
      tds: 380.0,
      electrical_conductivity: 520.0,
      hardness: 190.0,
      chloride: 120.0,
      fluoride: 0.9,
      nitrate: 18.0,
      iron: 0.15,
      arsenic: 0.002,
      lead: 0.001,
      e_coli: 0.0,
      total_coliform: 0.0
    }
  },
  {
    name: "Borewell (High TDS & Hardness)",
    params: {
      ph: 8.6,
      turbidity: 4.8,
      tds: 1850.0,
      electrical_conductivity: 2600.0,
      hardness: 720.0,
      chloride: 680.0,
      fluoride: 1.8,
      nitrate: 42.0,
      iron: 1.4,
      arsenic: 0.008,
      lead: 0.005,
      e_coli: 0.0,
      total_coliform: 0.0
    }
  },
  {
    name: "Contaminated Well (Microbial Fail)",
    params: {
      ph: 6.9,
      turbidity: 6.5,
      tds: 620.0,
      electrical_conductivity: 920.0,
      hardness: 290.0,
      chloride: 210.0,
      fluoride: 0.8,
      nitrate: 58.0,
      iron: 0.4,
      arsenic: 0.015,
      lead: 0.02,
      e_coli: 8.0,
      total_coliform: 45.0
    }
  }
];

export const DrinkingWaterModule: React.FC = () => {
  const [sourceName, setSourceName] = useState('Central Water Plant Batch #24');
  const [sourceType, setSourceType] = useState('bottled');
  const [location, setLocation] = useState('New Delhi Facility');
  const [params, setParams] = useState<DrinkingWaterParams>(PRESETS[0].params);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (field: keyof DrinkingWaterParams, value: string) => {
    const num = parseFloat(value);
    setParams(prev => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num
    }));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setParams(preset.params);
    setSourceName(preset.name);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await waterService.analyzeDrinking({
        category: 'drinking',
        source_name: sourceName,
        source_type: sourceType,
        location,
        drinking_params: params
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis request failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Recharts data formatting
  const chartData = [
    { name: 'pH', value: params.ph, limit: 8.5, unit: '' },
    { name: 'Turbidity', value: params.turbidity, limit: 1.0, unit: 'NTU' },
    { name: 'TDS / 10', value: params.tds / 10, limit: 50, unit: 'x10 mg/L' },
    { name: 'Hardness / 10', value: (params.hardness || 0) / 10, limit: 20, unit: 'x10 mg/L' },
    { name: 'Chloride / 10', value: (params.chloride || 0) / 10, limit: 25, unit: 'x10 mg/L' },
    { name: 'Nitrate', value: params.nitrate || 0, limit: 45, unit: 'mg/L' },
    { name: 'Fluoride x10', value: (params.fluoride || 0) * 10, limit: 10, unit: 'x0.1 mg/L' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Category A: Human Water Safety</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Drinking Water Quality & Safety Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Standardized evaluation against BIS IS 10500:2012 acceptable & permissible limits with ML classification.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Load Presets:</span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all"
            >
              {p.name.split(' ')[0]} {p.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Parameter Inputs */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-cyan-400" />
            Sample Details & Assay Inputs
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Name</label>
                <input
                  type="text"
                  required
                  value={sourceName}
                  onChange={e => setSourceName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Category</label>
                <select
                  value={sourceType}
                  onChange={e => setSourceType(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="bottled">Bottled Plant (Bisleri/Aquafina)</option>
                  <option value="tap">Municipal Tap Supply</option>
                  <option value="well">Borewell / Ground Water</option>
                  <option value="hospital">Hospital ICU/Dialysis</option>
                  <option value="restaurant">Food & Beverage Facility</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Inspection Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Parameters Grid */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
                Physicochemical Parameters
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>pH Value (6.5-8.5)</span>
                    <span className="text-cyan-300 font-mono">{params.ph}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={params.ph}
                    onChange={e => handleParamChange('ph', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Turbidity (&lt;1 NTU)</span>
                    <span className="text-cyan-300 font-mono">{params.turbidity}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={params.turbidity}
                    onChange={e => handleParamChange('turbidity', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>TDS (&lt;500 mg/L)</span>
                    <span className="text-cyan-300 font-mono">{params.tds}</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={params.tds}
                    onChange={e => handleParamChange('tds', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Hardness (&lt;200 mg/L)</span>
                    <span className="text-cyan-300 font-mono">{params.hardness || 0}</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={params.hardness || 0}
                    onChange={e => handleParamChange('hardness', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Chloride (&lt;250 mg/L)</span>
                    <span className="text-cyan-300 font-mono">{params.chloride || 0}</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={params.chloride || 0}
                    onChange={e => handleParamChange('chloride', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Nitrate (&lt;45 mg/L)</span>
                    <span className="text-cyan-300 font-mono">{params.nitrate || 0}</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={params.nitrate || 0}
                    onChange={e => handleParamChange('nitrate', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Microbiological & Heavy Metals Section */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center justify-between">
                <span>Microbiological & Heavy Metals (Zero Tolerance)</span>
                <span className="text-[10px] text-slate-400 font-normal">IS 10500: 0 CFU</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-rose-950/20 border border-rose-900/40">
                <div>
                  <label className="block text-[11px] text-rose-300 mb-1 font-semibold">E. coli (CFU/100ml)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={params.e_coli || 0}
                    onChange={e => handleParamChange('e_coli', e.target.value)}
                    className="w-full bg-slate-900/90 border border-rose-800/60 rounded-xl px-3 py-1.5 text-xs text-rose-200 font-mono focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-rose-300 mb-1 font-semibold">Total Coliform (CFU/100ml)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={params.total_coliform || 0}
                    onChange={e => handleParamChange('total_coliform', e.target.value)}
                    className="w-full bg-slate-900/90 border border-rose-800/60 rounded-xl px-3 py-1.5 text-xs text-rose-200 font-mono focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Arsenic (mg/L, &lt;0.01)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={params.arsenic || 0}
                    onChange={e => handleParamChange('arsenic', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Lead (mg/L, &lt;0.01)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={params.lead || 0}
                    onChange={e => handleParamChange('lead', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0879D9] to-[#22D3EE] font-bold text-xs text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Evaluating BIS Standards & ML Inference...' : 'Run Full Potability & Safety Analysis'}
            </button>
          </form>
        </div>

        {/* Right Content: Analysis Results Display */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Verdict Header Card */}
              <div className={`rounded-3xl p-6 border ${
                result.potable 
                  ? 'bg-emerald-950/30 border-emerald-500/40 shadow-emerald-500/10' 
                  : 'bg-rose-950/30 border-rose-500/40 shadow-rose-500/10'
              } shadow-xl backdrop-blur-md`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      result.potable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {result.potable ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                        UID: {result.sample_uid}
                      </div>
                      <h3 className="text-xl font-extrabold text-white">
                        {result.potable ? 'POTABLE DRINKING WATER' : 'NON-POTABLE / TREATMENT MANDATED'}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">{result.status}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Quality Index</div>
                      <div className={`text-2xl font-black ${
                        result.quality_score >= 80 ? 'text-emerald-400' : result.quality_score >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {result.quality_score}<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => waterService.downloadReportPdf(result.sample_uid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-semibold mt-2 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF Certificate
                    </button>
                  </div>
                </div>

                {/* Scientific Disclaimer Alert */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{result.disclaimer}</span>
                </div>
              </div>

              {/* Parameter Limit Bar Chart */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    Measured Parameters vs BIS IS 10500 Guidelines
                  </h3>
                  <span className="text-[10px] text-slate-400">Green = Safe | Red = Exceeds Limit</span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} interval={0} angle={-25} textAnchor="end" />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0B1F35', borderColor: '#22D3EE', borderRadius: '12px', fontSize: '11px' }}
                        formatter={(val: any) => [val, 'Value']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => {
                          const isOver = entry.value > entry.limit;
                          return <Cell key={`cell-${index}`} fill={isOver ? '#EF4444' : '#0879D9'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Machine Learning Insights & XAI */}
              {result.ml_prediction && (
                <div className="glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      AI & Machine Learning Engine Verdict
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                      Confidence: {(result.ml_prediction.screening?.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                      <div className="text-slate-400 font-semibold mb-1">Random Forest Potability:</div>
                      <div className="text-white font-bold text-sm">
                        {result.ml_prediction.screening?.predicted_label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Screening probability: {(result.ml_prediction.screening?.potable_probability * 100).toFixed(1)}% Potable
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                      <div className="text-slate-400 font-semibold mb-1">Isolation Forest Anomaly Check:</div>
                      <div className={`font-bold text-sm ${result.ml_prediction.anomaly?.is_anomaly ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {result.ml_prediction.anomaly?.status}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Multivariate outlier score: {result.ml_prediction.anomaly?.anomaly_score}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Engineering Treatments */}
              <div className="glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  Recommended Treatment & Engineering Remediation
                </h3>

                <div className="space-y-3">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{rec.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.urgency === 'Immediate' ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {rec.urgency}
                        </span>
                      </div>
                      <div className="text-[11px] text-cyan-400 font-semibold">{rec.technology}</div>
                      <p className="text-xs text-slate-400">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                <Droplet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Analysis Executed Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Enter your measured laboratory parameters on the left or select one of the pre-configured field presets above to run the automated safety audit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
