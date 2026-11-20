import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Droplet, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { waterService } from '../services/api';
import { DashboardStats } from '../types';

interface DashboardOverviewProps {
  onNavigate: (view: 'drinking' | 'environmental' | 'history') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, histData] = await Promise.all([
          waterService.getStats(),
          waterService.getHistory()
        ]);
        setStats(statsData);
        setHistory(histData);
      } catch (e) {
        console.error('Failed loading dashboard telemetry:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pieData = stats ? [
    { name: 'Potable Drinking Compliant', value: stats.potable_compliant_samples, color: '#10B981' },
    { name: 'Treatment Required', value: stats.treatment_needed_samples, color: '#EF4444' },
    { name: 'Anomalies Flagged', value: stats.samples_requiring_investigation, color: '#F59E0B' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Water Intelligence Analytics Telemetry
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregated diagnostics, machine learning classifications, and historical compliance rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('drinking')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0879D9] to-[#22D3EE] text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            + Analyze Drinking
          </button>
          <button
            onClick={() => onNavigate('environmental')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-400 text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            + Monitor Environmental
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-panel-glow rounded-3xl p-6 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Audits</span>
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.total_samples ?? 0}</div>
          <div className="text-[11px] text-cyan-300 mt-1">Drinking + Environmental</div>
        </div>

        <div className="glass-panel-glow rounded-3xl p-6 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compliance Rate</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {stats?.compliance_rate_percent ?? 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">IS 10500 Potable pass rate</div>
        </div>

        <div className="glass-panel-glow rounded-3xl p-6 border border-amber-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anomalies Detected</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {stats?.samples_requiring_investigation ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Isolation Forest outliers</div>
        </div>

        <div className="glass-panel-glow rounded-3xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Quality Index</span>
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400">
            {stats?.average_quality_score ?? 0}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Overall basin index</div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            Safety & Compliance Breakdown
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B1F35', borderColor: '#22D3EE', borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-cyan-500/20 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Recent Water Sample Audits</span>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              View Full History <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </h3>

          <div className="space-y-2.5">
            {history.slice(0, 5).map((s, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-white">{s.source_name}</div>
                  <div className="text-[10px] text-slate-400">{s.location} &bull; {s.sample_uid}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    s.potable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {s.potable ? 'POTABLE' : 'TREATMENT REQUIRED'}
                  </span>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Score: {s.quality_score}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
