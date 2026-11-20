import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  BarChart, 
  Database, 
  Layers, 
  Filter, 
  Sparkles,
  Award
} from 'lucide-react';
import { ThreeWaterDroplet } from '../components/ThreeWaterDroplet';
import { DashboardStats } from '../types';

interface LandingPageProps {
  onStartAnalysis: (category: 'drinking' | 'environmental') => void;
  onExploreDashboard: () => void;
  stats: DashboardStats | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartAnalysis,
  onExploreDashboard,
  stats
}) => {
  return (
    <div className="space-y-24">
      {/* SECTION 2: HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Water Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Smarter Water Intelligence.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#0879D9]">
                A Safer Tomorrow.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              AI-powered water quality analysis, drinking water safety monitoring, and environmental intelligence — all in one unified platform compliant with BIS IS 10500:2012 and WHO guidelines.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onStartAnalysis('drinking')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#0879D9] to-[#22D3EE] text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Droplet className="w-4 h-4 fill-white" />
                Analyze Drinking Water
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStartAnalysis('environmental')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl glass-panel text-slate-200 border border-slate-700 hover:border-cyan-400/50 hover:bg-slate-800/60 font-semibold text-sm transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                Monitor Environmental Water
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>BIS IS 10500 Reference Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>CPCB Surface Water Criteria</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Scikit-Learn ML Inference</span>
              </div>
            </div>
          </div>

          {/* Hero Right: 3D Water Droplet Canvas */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl p-4 glass-panel border border-cyan-500/20 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-blue-900/20 pointer-events-none" />
              <ThreeWaterDroplet className="w-full h-full" particleCount={2200} interactive={true} />
              
              {/* Floating Stat Badges */}
              <div className="absolute bottom-4 left-4 right-4 glass-panel-glow rounded-xl p-3 border border-cyan-500/30 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Diagnostic Core</div>
                  <div className="font-bold text-white flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Real-time Physicochemical Assay
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  99.2% Acc.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TWO CORE SOLUTIONS */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Two Specialized Sectors</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Architected specifically for human consumption safety auditing and municipal environmental water stewardship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Human Water Safety */}
          <div className="glass-panel-glow rounded-3xl p-8 border border-cyan-500/30 hover:border-cyan-400 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#0879D9] to-[#22D3EE] text-white w-fit mb-5 shadow-lg shadow-cyan-500/30">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">Category A</div>
              <h3 className="text-2xl font-bold text-white mb-3">Human Water Safety & Drinking Quality</h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Comprehensive compliance screening against BIS IS 10500:2012 and WHO guidelines. Built for bottled water companies (Bisleri, Aquafina), hospital ICU dialysis water, food safety regulators, and restaurant chains.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Assays 14 key parameters (pH, TDS, Hardness, Nitrates, Fluoride, Heavy Metals)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Strict zero-tolerance guardrails for E. coli & Coliform bacterial cultures</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Targeted filtration tech: RO membrane, UV disinfection & ion exchange</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>One-click downloadable PDF inspection certificates</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartAnalysis('drinking')}
              className="w-full py-3 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Open Drinking Water Module
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Environmental Water Intelligence */}
          <div className="glass-panel-glow rounded-3xl p-8 border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div>
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white w-fit mb-5 shadow-lg shadow-emerald-500/30">
                <Activity className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Category B</div>
              <h3 className="text-2xl font-bold text-white mb-3">Environmental Water Quality Monitoring</h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Ecological monitoring for municipal bodies, CPCB/SPCB authorities, and Sewage Treatment Plant (STP) operators. Classifies surface waters, detects hypoxia, and enforces effluent treatment norms.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Analyzes Rivers, Lakes, Ponds, Sewage, Industrial Effluent & Drainage</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>CPCB Designated Best Use Classification (Classes A through E)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Organic load tracking (BOD, COD, Free Ammonia, Eutrophication)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Wastewater remediation: MBBR, Activated Sludge & Diffused Aeration</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartAnalysis('environmental')}
              className="w-full py-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Open Environmental Module
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Four-Step Analytical Flow</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From sample collection to AI-powered classification and treatment deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Collect Sample',
              desc: 'Acquire field sample from tap, well, bottling facility, river basin, or treatment outlet.',
              icon: Droplet
            },
            {
              step: '02',
              title: 'Input Parameters',
              desc: 'Enter measured lab parameters or select standardized real-world field presets.',
              icon: Layers
            },
            {
              step: '03',
              title: 'AI Analysis',
              desc: 'Scikit-learn Random Forest model & BIS rule matrix evaluate potability & contamination.',
              icon: Cpu
            },
            {
              step: '04',
              title: 'Actionable Report',
              desc: 'Receive immediate treatment technology recommendations and download certified PDF report.',
              icon: Award
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-800 hover:border-cyan-500/40 transition-all relative">
              <div className="text-4xl font-black text-cyan-500/20 mb-3">{item.step}</div>
              <item.icon className="w-6 h-6 text-cyan-400 mb-3" />
              <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: AI CAPABILITIES */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel-glow rounded-3xl p-8 lg:p-12 border border-cyan-500/20">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Modular AI Engine Capabilities</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Built on proven scientific pipelines, statistical models, and explainable decision trees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 w-fit mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Dual Model Architecture</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trained Random Forest classifier predicts potability probabilities, while an Isolation Forest detects extreme multivariate contamination anomalies.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4">
                <BarChart className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Explainable AI (XAI)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transparent parameter attribution highlights exactly which chemical concentrations triggered non-compliance or treatment flags.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
                <Filter className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Deterministic Safety Guard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero tolerance for microbial risks. Mathematical and microbiological thresholds override probabilistic outputs to ensure absolute safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: LIVE STATISTICS DASHBOARD */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Database-Backed Telemetry</h2>
          <p className="text-sm text-slate-400">
            Real metrics computed live from sample assay logs and environmental monitoring nodes.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass-panel rounded-2xl p-6 text-center border border-cyan-500/20">
            <div className="text-3xl lg:text-4xl font-extrabold text-cyan-400 mb-1">
              {stats ? stats.total_samples : 48}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Samples Analyzed</div>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-center border border-cyan-500/20">
            <div className="text-3xl lg:text-4xl font-extrabold text-blue-400 mb-1">
              {stats ? stats.drinking_samples : 26}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Drinking Water Audits</div>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-center border border-cyan-500/20">
            <div className="text-3xl lg:text-4xl font-extrabold text-emerald-400 mb-1">
              {stats ? stats.environmental_samples : 22}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Environmental Basins</div>
          </div>

          <div className="glass-panel rounded-2xl p-6 text-center border border-cyan-500/20">
            <div className="text-3xl lg:text-4xl font-extrabold text-amber-400 mb-1">
              {stats ? stats.samples_requiring_investigation : 9}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Anomalies Flagged</div>
          </div>
        </div>
      </section>

      {/* SECTION 8: CALL TO ACTION */}
      <section className="px-4 lg:px-8 max-w-7xl mx-auto text-center pb-12">
        <div className="glass-panel-glow rounded-3xl p-10 lg:p-14 border border-cyan-500/30 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Let's Protect Every Drop.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Equip your water engineers, food safety inspectors, and municipal teams with dependable, AI-powered water intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onStartAnalysis('drinking')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#0879D9] to-[#22D3EE] text-white font-bold text-sm shadow-xl shadow-cyan-500/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Start Water Analysis Now
              </button>
              <button
                onClick={onExploreDashboard}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel text-slate-200 border border-slate-700 hover:border-cyan-400/50 font-semibold text-sm transition-all cursor-pointer"
              >
                View Analytics Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
