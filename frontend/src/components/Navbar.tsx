import React, { useState } from 'react';
import { Droplet, ShieldCheck, Activity, BarChart3, LogIn, LogOut, Menu, X, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'drinking' | 'environmental' | 'dashboard' | 'history';
  onNavigate: (view: 'landing' | 'drinking' | 'environmental' | 'dashboard' | 'history') => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="relative p-2 rounded-xl bg-gradient-to-tr from-[#0879D9] to-[#22D3EE] text-white shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            <Droplet className="w-6 h-6 fill-white stroke-cyan-200" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              AquaGuard <span className="text-[#22D3EE] font-black">AI</span>
            </div>
            <div className="text-[10px] tracking-widest text-slate-400 uppercase font-medium">Water Intelligence</div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'landing'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('drinking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'drinking'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Drinking Safety
          </button>
          <button
            onClick={() => onNavigate('environmental')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'environmental'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Environmental
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Analytics
          </button>
          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'history'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Reports
          </button>
        </div>

        {/* User Auth Info / Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-cyan-500/20 text-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="font-semibold text-white leading-tight">{user.full_name}</div>
                  <div className="text-[10px] text-cyan-400 capitalize">{user.role.replace(/_/g, ' ')}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0879D9] to-[#22D3EE] text-white font-semibold text-xs shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In / Roles
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('drinking'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg text-sm text-cyan-300 hover:bg-slate-800"
          >
            Drinking Water Safety
          </button>
          <button
            onClick={() => { onNavigate('environmental'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg text-sm text-emerald-300 hover:bg-slate-800"
          >
            Environmental Monitoring
          </button>
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg text-sm text-blue-300 hover:bg-slate-800"
          >
            Analytics Dashboard
          </button>
          <button
            onClick={() => { onNavigate('history'); setMobileMenuOpen(false); }}
            className="text-left px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            Reports History
          </button>
          <div className="pt-2 border-t border-slate-800/80">
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-slate-300">{user.full_name} ({user.role})</span>
                <button onClick={onLogout} className="text-rose-400 text-xs font-semibold">Logout</button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg text-xs font-bold text-white"
              >
                Sign In / Role Access
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
