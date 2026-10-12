import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Building, 
  Mail, 
  Lock, 
  Phone, 
  Zap, 
  CheckCircle2, 
  DollarSign 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { PlanDuration } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createNewUser, plans } = useApp();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('user123');
  const [phone, setPhone] = useState('+51 9');
  const [role, setRole] = useState<'business_owner' | 'super_admin'>('business_owner');
  const [planId, setPlanId] = useState<PlanDuration>('1_month');
  const [status, setStatus] = useState<'active' | 'trial' | 'suspended_unpaid'>('active');

  if (!isOpen) return null;

  const selectedPlan = plans.find((p) => p.id === planId) || plans[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyName.trim()) return;

    const finalUsername = (username.trim() || name.trim().toLowerCase().replace(/\s+/g, '')).toLowerCase();
    const finalEmail = email.trim() ? email.trim().toLowerCase() : `${finalUsername}@cliente.local`;

    createNewUser({
      name: name.trim(),
      username: finalUsername,
      email: finalEmail,
      password: password.trim() || 'user123',
      companyName: companyName.trim(),
      phone: phone.trim(),
      role,
      planId,
      durationMonths: selectedPlan.durationMonths,
      quotaLimit: selectedPlan.quotaMessages,
      status,
      unpaidBalance: status === 'suspended_unpaid' ? selectedPlan.pricePEN : 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Crear y Dar de Alta Nuevo Cliente / Usuario
              </h3>
              <p className="text-[11px] text-slate-400">
                Asigna credenciales de acceso, plan comercial y cuota de WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nombre del Cliente / Contacto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Martín Vargas"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Empresa o Negocio *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej. Distribuidora Lima SAC"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Usuario de Acceso (Login) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. zapateria_norte"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Contraseña Asignada *
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Clave inicial..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Correo Electrónico (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@empresa.com (si no tiene, se autogenera)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Teléfono WhatsApp del Cliente
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+51 987 654 321"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Time-Based Plan Selection (1 mes, 2 meses, 4 meses) */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Plan por Tiempo de Vigencia (Duración) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {plans.map((p) => {
                const isSelected = planId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="block font-bold text-xs text-white">
                      {p.name}
                    </span>
                    <span className="block text-xs text-emerald-400 font-mono font-bold">
                      S/ {p.pricePEN}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {p.durationDays} días de acceso
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Al crear el usuario, su fecha de vencimiento se calculará automáticamente según el periodo contratado.
            </p>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Estado Inicial de Acceso
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  status === 'active'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Activo / Al Día
              </button>

              <button
                type="button"
                onClick={() => setStatus('trial')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  status === 'trial'
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Prueba Gratuita
              </button>

              <button
                type="button"
                onClick={() => setStatus('suspended_unpaid')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  status === 'suspended_unpaid'
                    ? 'bg-red-500/20 border-red-500/50 text-red-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Bloqueado (Mora)
              </button>
            </div>
          </div>

          {/* User Role Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Privilegios y Rol en el Sistema *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('business_owner')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === 'business_owner'
                    ? 'bg-blue-500/20 border-blue-500/60 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="block font-bold text-xs text-blue-300">
                  🏢 Dueño de Negocio (Cliente)
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Acceso a WhatsApp, campañas, plantillas y contactos.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('super_admin')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  role === 'super_admin'
                    ? 'bg-amber-500/20 border-amber-500/60 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="block font-bold text-xs text-amber-300">
                  👑 Super Administrador
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  Acceso total a la pestaña Super Usuario y control global.
                </span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
            >
              Dar de Alta Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
