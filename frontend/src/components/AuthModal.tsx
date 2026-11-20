import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building2, Shield, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const ROLES = [
  { id: 'water_quality_engineer', label: 'Water Quality Engineer', desc: 'Laboratory analysis & standards verification' },
  { id: 'hospital_administrator', label: 'Hospital Administrator', desc: 'Clinical dialysis & facility sanitation monitoring' },
  { id: 'food_safety_inspector', label: 'Food Safety Inspector', desc: 'Commercial restaurant & beverage audits' },
  { id: 'municipal_engineer', label: 'Municipal Corporation Engineer', desc: 'City water supply & distribution ward monitoring' },
  { id: 'environmental_researcher', label: 'Environmental Researcher', desc: 'Surface lakes, rivers & ecosystem health' },
  { id: 'admin', label: 'System Administrator', desc: 'Full platform & user access governance' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('water_quality_engineer');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await apiClient.post('/auth/register', {
          email,
          password,
          full_name: fullName,
          role,
          organization: organization || 'Water Testing Agency'
        });
      }

      // Login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginRes = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = loginRes.data.access_token;
      localStorage.setItem('aquaguard_token', token);

      const user: User = {
        id: loginRes.data.user_id,
        email: loginRes.data.email,
        full_name: loginRes.data.full_name,
        role: loginRes.data.role,
        organization: loginRes.data.organization
      };

      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (demoRole: string) => {
    setRole(demoRole);
    setEmail(`${demoRole}@aquaguard.io`);
    setPassword('DemoPass123!');
    setFullName(`Lead ${demoRole.replace(/_/g, ' ').toUpperCase()}`);
    setOrganization('National Water Commission');
    setIsRegister(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-[#0879D9] to-[#22D3EE] mb-2 shadow-lg shadow-cyan-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isRegister ? 'Create AquaGuard Account' : 'Welcome to AquaGuard AI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? 'Role-based access for water authorities & inspectors' : 'Sign in to access analysis tools & reports'}
          </p>
        </div>

        {/* Quick Demo Pre-fill Pill Bar */}
        <div className="mb-4 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Quick Demo Role Select</span>
            <span className="text-slate-500 font-normal">Click to prefill</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDemoRole('water_quality_engineer')}
              className="px-2 py-1 rounded-md text-[10px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 hover:bg-cyan-800/40"
            >
              Water Engineer
            </button>
            <button
              type="button"
              onClick={() => setDemoRole('hospital_administrator')}
              className="px-2 py-1 rounded-md text-[10px] font-medium bg-blue-950/80 text-blue-300 border border-blue-700/50 hover:bg-blue-800/40"
            >
              Hospital Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoRole('food_safety_inspector')}
              className="px-2 py-1 rounded-md text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-700/50 hover:bg-amber-800/40"
            >
              Food Inspector
            </button>
            <button
              type="button"
              onClick={() => setDemoRole('municipal_engineer')}
              className="px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-800/40"
            >
              Municipal
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Ananya Sharma"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Organization / Facility</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Delhi Jal Board / Bisleri"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professional Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@aquaguard.io"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#0879D9] to-[#22D3EE] font-bold text-xs text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register & Enter Platform' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new professional account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
