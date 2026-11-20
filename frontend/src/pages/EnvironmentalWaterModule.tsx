import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  MapPin, 
  Waves, 
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
  Cell 
} from 'recharts';
import { waterService } from '../services/api';
import { WaterAnalysisResponse, EnvironmentalWaterParams } from '../types';

const ENV_PRESETS = [
  {
    name: "Pristine Mountain River (Ganges Upper Basin)",
    sourceType: "river",
    location: "Rishikesh Upstream",
    params: {
      ph: 7.5,
      turbidity: 1.8,
      dissolved_oxygen: 8.2,
      bod: 1.2,
      cod: 6.0,
      tds: 180.0,
      conductivity: 260.0,
      nitrates: 2.1,
      phosphates: 0.05,
      ammonia: 0.1
    }
  },
  {
    name: "Urban Lake with Eutrophication Risk",
    sourceType: "lake",
    location: "Bellandur Lake Outflow, Bengaluru",
    params: {
      ph: 8.4,
      turbidity: 18.0,
      dissolved_oxygen: 3.1,
      bod: 14.5,
      cod: 65.0,
      tds: 780.0,
      conductivity: 1150.0,
      nitrates: 12.0,
      phosphates: 1.8,
      ammonia: 2.8
    }
  },
  {
    name: "Municipal Sewage Treatment Inflow",
    sourceType: "sewage",
    location: "Okhla STP Inlet, New Delhi",
    params: {
      ph: 7.8,
      turbidity: 45.0,
      dissolved_oxygen: 0.8,
      bod: 160.0,
      cod: 380.0,
      tds: 1450.0,
      conductivity: 2200.0,
      nitrates: 28.0,
      phosphates: 12.0,
      ammonia: 24.0
    }
  },
  {
    name: "Industrial Effluent Discharge",
    sourceType: "industrial_effluent",
    location: "Textile & Chemical Cluster, Gujarat",
    params: {
      ph: 9.6,
      turbidity: 32.0,
      dissolved_oxygen: 1.5,
      bod: 85.0,
      cod: 420.0,
      tds: 3200.0,
      conductivity: 4800.0,
      nitrates: 45.0,
      phosphates: 6.5,
      ammonia: 16.0,
      heavy_metals: 1.8
    }
  }
];

export const EnvironmentalWaterModule: React.FC = () => {
  const [sourceName, setSourceName] = useState(ENV_PRESETS[0].name);
  const [sourceType, setSourceType] = useState('river');
  const [location, setLocation] = useState(ENV_PRESETS[0].location);
  const [params, setParams] = useState<EnvironmentalWaterParams>(ENV_PRESETS[0].params);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WaterAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (field: keyof EnvironmentalWaterParams, value: string) => {
    const num = parseFloat(value);
    setParams(prev => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num
    }));
  };

  const applyPreset = (preset: typeof ENV_PRESETS[0]) => {
    setParams(preset.params);
    setSourceName(preset.name);
    setSourceType(preset.sourceType);
    setLocation(preset.location);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await waterService.analyzeEnvironmental({
        category: 'environmental',
        source_name: sourceName,
        source_type: sourceType,
        location,
        environmental_params: params
      });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Environmental analysis failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'DO', value: params.dissolved_oxygen, target: 6.0, note: '>= 6 mg/L (Good)' },
    { name: 'BOD', value: params.bod, target: 3.0, note: '<= 3 mg/L' },
    { name: 'COD / 10', value: (params.cod || 0) / 10, target: 25.0, note: 'COD x0.1' },
    { name: 'Ammonia', value: params.ammonia || 0, target: 1.2, note: '<= 1.2 mg/L' },
    { name: 'Phosphates', value: params.phosphates || 0, target: 0.5, note: '<= 0.5 mg/L' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Category B: Environmental Monitoring</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Surface Water & Wastewater Ecological Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            CPCB Designated Best Use Classification for Rivers, Lakes, STPs, and Industrial Effluents.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Load Presets:</span>
          {ENV_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white transition-all"
            >
              {p.name.split(' ')[0]} {p.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Form */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-emerald-500/20 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Waves className="w-5 h-5 text-emerald-400" />
            Environmental Basin & Parameters
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Water Basin / Outflow Name</label>
              <input
                type="text"
                required
                value={sourceName}
                onChange={e => setSourceName(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ecosystem Category</label>
                <select
                  value={sourceType}
                  onChange={e => setSourceType(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="river">River Basin</option>
                  <option value="lake">Lake / Wetland</option>
                  <option value="pond">Rural Pond</option>
                  <option value="sewage">Sewage Inflow / STP</option>
                  <option value="industrial_effluent">Industrial Effluent (ETP)</option>
                  <option value="drainage">Municipal Storm Drain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sampling Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Ecological Parameters */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                Key Ecological Indicators
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Dissolved Oxygen (DO)</span>
                    <span className="text-emerald-300 font-mono">{params.dissolved_oxygen} mg/L</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={params.dissolved_oxygen}
                    onChange={e => handleParamChange('dissolved_oxygen', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>BOD (Organic Load)</span>
                    <span className="text-emerald-300 font-mono">{params.bod} mg/L</span>
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={params.bod}
                    onChange={e => handleParamChange('bod', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Chemical Oxygen (COD)</span>
                    <span className="text-emerald-300 font-mono">{params.cod || 0} mg/L</span>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={params.cod || 0}
                    onChange={e => handleParamChange('cod', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>pH Level</span>
                    <span className="text-emerald-300 font-mono">{params.ph}</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={params.ph}
                    onChange={e => handleParamChange('ph', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Free Ammonia (NH3)</span>
                    <span className="text-emerald-300 font-mono">{params.ammonia || 0} mg/L</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={params.ammonia || 0}
                    onChange={e => handleParamChange('ammonia', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Phosphates (PO4)</span>
                    <span className="text-emerald-300 font-mono">{params.phosphates || 0} mg/L</span>
                  </div>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={params.phosphates || 0}
                    onChange={e => handleParamChange('phosphates', e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-400"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-400 font-bold text-xs text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Evaluating CPCB Criteria...' : 'Evaluate Environmental Quality & CPCB Class'}
            </button>
          </form>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Verdict Header */}
              <div className="rounded-3xl p-6 bg-slate-900/80 border border-emerald-500/30 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                        UID: {result.sample_uid}
                      </div>
                      <h3 className="text-xl font-extrabold text-white">
                        {result.cpcb_class || 'Class Assessment Complete'}
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">{result.status}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Ecological Score</div>
                      <div className="text-2xl font-black text-emerald-400">
                        {result.quality_score}<span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>

                    <a
                      href={waterService.getReportPdfUrl(result.sample_uid)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-semibold mt-2 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Environmental Audit
                    </a>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Untreated or partially treated environmental water and sewage is strictly non-potable and must meet discharge criteria before release into ambient waterways.
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  Key Biological & Chemical Oxygen Demand Levels
                </h3>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0B1F35', borderColor: '#34D399', borderRadius: '12px', fontSize: '11px' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => {
                          const isWarning = entry.name === 'DO' ? entry.value < 4 : entry.value > entry.target;
                          return <Cell key={`cell-${index}`} fill={isWarning ? '#EF4444' : '#10B981'} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Wastewater Recommendations */}
              <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  Wastewater Remediation & Engineering Measures
                </h3>

                <div className="space-y-3">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{rec.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.urgency === 'Immediate' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {rec.urgency}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">{rec.technology}</div>
                      <p className="text-xs text-slate-400">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Waves className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Environmental Evaluation Selected</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Configure water basin parameters on the left or click a river/lake/sewage preset above to run CPCB classification.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
