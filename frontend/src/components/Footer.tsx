import React from 'react';
import { Droplet, ShieldCheck, FileText, Globe, Award, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-cyan-500/20 bg-[#040D1A] text-slate-400 pt-12 pb-8 px-4 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#0879D9] to-[#22D3EE] text-white">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <span className="font-bold text-lg text-white">AquaGuard <span className="text-cyan-400">AI</span></span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enterprise water intelligence platform combining physical chemical standards, Scikit-learn machine learning, and environmental engineering to safeguard human consumption and natural ecosystems.
          </p>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
            <Award className="w-4 h-4" />
            <span>BIS IS 10500:2012 & WHO Guidelines Compliant</span>
          </div>
        </div>

        {/* Sectors */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Target Sectors</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-cyan-300 transition-colors">Commercial Bottled Water Plants</li>
            <li className="hover:text-cyan-300 transition-colors">Hospital & Clinical Water Management</li>
            <li className="hover:text-cyan-300 transition-colors">Municipal Water Supply Corporations</li>
            <li className="hover:text-cyan-300 transition-colors">Sewage Treatment Plants (STP / ETP)</li>
            <li className="hover:text-cyan-300 transition-colors">Food Safety & Hospitality Audits</li>
          </ul>
        </div>

        {/* Technologies */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">AI & Scientific Stack</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-cyan-300 transition-colors">Scikit-learn Random Forest Inference</li>
            <li className="hover:text-cyan-300 transition-colors">Isolation Forest Anomaly Detection</li>
            <li className="hover:text-cyan-300 transition-colors">Explainable AI (XAI) Feature Importance</li>
            <li className="hover:text-cyan-300 transition-colors">CPCB Designated Best Use Classification</li>
            <li className="hover:text-cyan-300 transition-colors">ReportLab Automated PDF Certification</li>
          </ul>
        </div>

        {/* Disclaimers & Legal */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Regulatory Notice</h4>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] leading-relaxed text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Laboratory Screening Tool</p>
            AquaGuard AI provides mathematical risk assessment and engineering screening. Microbiological potability requires independent certified bacterial cultures.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          &copy; {new Date().getFullYear()} AquaGuard AI. Built for environmental resilience & clean water access.
        </div>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-300 cursor-pointer">Security Protocol</span>
          <span className="hover:text-slate-300 cursor-pointer">Standards Matrix</span>
          <span className="hover:text-slate-300 cursor-pointer">API Documentation</span>
        </div>
      </div>
    </footer>
  );
};
