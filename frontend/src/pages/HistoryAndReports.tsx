import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  Activity, 
  ExternalLink 
} from 'lucide-react';
import { waterService } from '../services/api';

export const HistoryAndReports: React.FC = () => {
  const [samples, setSamples] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState<'all' | 'drinking' | 'environmental'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const data = await waterService.getHistory();
        setSamples(data);
      } catch (err) {
        console.error('Failed fetching sample history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filtered = samples.filter(s => {
    const matchesCat = filterCategory === 'all' || s.category === filterCategory;
    const matchesSearch = s.source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.sample_uid.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Inspection History & Certified PDF Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete laboratory assay records, treatment recommendations, and downloadable official certificates.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search UID, facility, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 w-56"
            />
          </div>

          <div className="flex rounded-xl bg-slate-900 border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg ${filterCategory === 'all' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCategory('drinking')}
              className={`px-3 py-1 rounded-lg ${filterCategory === 'drinking' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400'}`}
            >
              Drinking
            </button>
            <button
              onClick={() => setFilterCategory('environmental')}
              className={`px-3 py-1 rounded-lg ${filterCategory === 'environmental' ? 'bg-cyan-500 text-white font-bold' : 'text-slate-400'}`}
            >
              Environmental
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-3xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Certificate UID</th>
                <th className="px-6 py-4">Source / Location</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Compliance Verdict</th>
                <th className="px-6 py-4">Quality Score</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.length > 0 ? (
                filtered.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">{s.sample_uid}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{s.source_name}</div>
                      <div className="text-[11px] text-slate-400">{s.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.category === 'drinking' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {s.category === 'drinking' ? <Droplet className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                        {s.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        s.potable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {s.potable ? 'POTABLE COMPLIANT' : 'TREATMENT REQUIRED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {s.quality_score}/100
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px]">
                      {new Date(s.collected_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => waterService.downloadReportPdf(s.sample_uid)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    {loading ? 'Loading historical assay database...' : 'No inspection records match search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
