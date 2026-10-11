import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, t } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.message || 'Error al iniciar sesión');
      }
    }, 400);
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    login(demoEmail, demoPass);
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
            Plataforma Comercial de Mensajería Masiva Oficial Meta
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Correo Electrónico o Usuario
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@empresa.com"
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
              <span>Autenticando usuario...</span>
            ) : (
              <>
                <span>Ingresar a la Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Acceso Rápido para Demostración
          </p>

          <div className="grid grid-cols-1 gap-2">
            {/* Super Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin@whatsbroadcast.io', 'admin123')}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs block">👑 Perfil Super Administrador</span>
                <span className="text-[10px] text-amber-400/80">
                  Crear usuarios, gestionar bloqueos por mora y configurar Yape/Plin
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20">
                admin123
              </span>
            </button>

            {/* Active Client */}
            <button
              type="button"
              onClick={() => handleQuickLogin('carlos@modafashion.com', 'user123')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs block text-white">🛍️ Cliente Activo (Moda Latina)</span>
                <span className="text-[10px] text-slate-400">
                  Plan Growth Pro · Envíos masivos y plantillas activas
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900">
                user123
              </span>
            </button>

            {/* Blocked Client for Unpaid Balance */}
            <button
              type="button"
              onClick={() => handleQuickLogin('lucia@clinicaesperanza.com', 'user123')}
              className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/30 text-red-300 text-left transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs block text-red-200">⚠️ Cliente Bloqueado por Falta de Pago</span>
                <span className="text-[10px] text-red-300/80">
                  Prueba el pago inmediato por Yape/Plin para restaurar acceso
                </span>
              </div>
              <span className="text-[10px] font-mono text-red-400 px-2 py-0.5 rounded bg-red-900/30">
                user123
              </span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Acceso empresarial autenticado · Infraestructura Oficial Meta Cloud API</span>
        </div>
      </div>
    </div>
  );
};
