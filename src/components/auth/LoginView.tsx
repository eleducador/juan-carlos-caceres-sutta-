import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  User,
  Building,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';

export const LoginView: React.FC = () => {
  const { login } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setErrorMsg(result.message || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      {/* Background radial gradient accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-lg shadow-emerald-500/10">
            W
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            WhatsBroadcast Pro
          </h1>
          <p className="text-xs text-slate-400">
            Plataforma Multi-Tenant Oficial Meta Cloud WhatsApp
          </p>
          
          {/* Supabase status badge */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              isSupabaseConfigured 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <Database className="w-3 h-3" />
              {isSupabaseConfigured ? 'Supabase DB Conectado' : 'Modo Demo Local (Configura .env)'}
            </span>
          </div>
        </div>

        {/* Header descriptivo */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
          <p className="text-xs font-semibold text-slate-300">
            Ingreso al Sistema WhatsBroadcast Pro
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Las cuentas son provistas exclusivamente por el Administrador
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulario de Login Directo */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Usuario de Acceso o Correo Electrónico
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. zapateria_norte o correo@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">
                Contraseña de Acceso
              </label>
              <span className="text-[11px] text-slate-500">
                Protegido por SSL
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>Ingresar a la Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Aislamiento de datos con Row Level Security (RLS) en Supabase</span>
        </div>
      </div>
    </div>
  );
};
