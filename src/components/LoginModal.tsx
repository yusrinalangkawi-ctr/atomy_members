import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Building2 } from 'lucide-react';
import { AdminUser } from '../types';

interface LoginModalProps {
  onLogin: (password: string, username: string) => Promise<void>;
  isLoading: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, isLoading }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onLogin(password, username);
    } catch (err: any) {
      setError(err.message || 'Log masuk gagal. Sila semak kata laluan.');
    }
  };

  return (
    <div
      id="admin-login-screen"
      className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Background soft ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/30">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            PORTAL ADMIN
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Member Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Log masuk untuk mengurus keahlian, pendaftaran & laporan.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nama Pengguna
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Kata Laluan Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-0.5">
            <div className="flex items-center justify-between text-slate-700 font-semibold">
              <span>Akses Lalai Pentadbir:</span>
              <span className="text-emerald-700">Aktif</span>
            </div>
            <div>Pengguna: <code className="font-mono font-bold text-slate-800">admin</code></div>
            <div>Kata Laluan: <code className="font-mono font-bold text-slate-800">admin123</code></div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl shadow-md transition-all min-h-[48px]"
          >
            <span>{isLoading ? 'Mengesahkan...' : 'Log Masuk Pentadbir'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 mt-5">
          Data NRIC dan maklumat peribadi dilindungi di bawah akta privasi data.
        </p>
      </div>
    </div>
  );
};
