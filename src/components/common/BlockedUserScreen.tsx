import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Smartphone, 
  CreditCard, 
  KeyRound, 
  Calendar, 
  AlertOctagon, 
  FileText,
  Clock,
  ArrowRight,
  LogOut,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BlockedUserScreenProps {
  onOpenPayment: () => void;
  onOpenYapePlin: () => void;
}

export const BlockedUserScreen: React.FC<BlockedUserScreenProps> = ({
  onOpenPayment,
  onOpenYapePlin,
}) => {
  const { currentUser, switchRole, logout, yapePlinConfig, plans, yapePlinReceipts } = useApp();

  const currentPlan = plans.find((p) => p.id === currentUser.planId) || plans[0];
  const pendingReceipt = yapePlinReceipts.find(
    (r) => r.userId === currentUser.id && r.status === 'pending_review'
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-red-500/40 rounded-3xl p-6 md:p-8 shadow-2xl shadow-red-950/50 backdrop-blur-md relative overflow-hidden text-left">
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header alert badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Acceso Restringido por Vencimiento
                </h2>
              </div>
              <p className="text-xs text-red-300 font-medium mt-0.5">
                Tu periodo contratado ha llegado a su fecha de cumplimiento
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider">
            Cuenta Suspendida
          </span>
        </div>

        {/* Status explanation */}
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200/95 leading-relaxed flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">
                El acceso a la plataforma está completamente bloqueado
              </p>
              <p>
                Según las políticas de servicio, al cumplirse el periodo de vigencia de tu plan (
                <strong>{currentUser.durationMonths === 1 ? '30 días' : currentUser.durationMonths === 2 ? '60 días' : '120 días'}</strong>
                ), todas las funciones de envío masivo, gestión de contactos, plantillas y API de WhatsApp quedan inhabilitadas hasta que realices la renovación y tu pago sea validado por el administrador.
              </p>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Plan Contratado
              </span>
              <span className="text-sm font-bold text-white mt-1 block">
                {currentPlan.name}
              </span>
              <span className="text-[10px] text-emerald-400">
                {currentUser.durationMonths === 1 ? '30 Días' : currentUser.durationMonths === 2 ? '60 Días' : '120 Días'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Fecha de Vencimiento
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span className="text-sm font-bold text-red-400 font-mono-numbers">
                  {currentUser.dueDate || 'Cumplida'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Periodo vencido</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                Monto de Renovación
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono-numbers mt-1 block">
                S/ {currentUser.unpaidBalance > 0 ? currentUser.unpaidBalance.toFixed(2) : currentPlan.pricePEN.toFixed(2)} PEN
              </span>
              <span className="text-[10px] text-slate-400">Pago único en Soles</span>
            </div>
          </div>

          {/* Pending receipt notification if user already submitted proof */}
          {pendingReceipt && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
              <div>
                <p className="font-bold text-white">Comprobante en Revisión por el Administrador</p>
                <p className="mt-0.5 text-amber-300/90">
                  Has enviado el código de operación <strong>{pendingReceipt.operationCode}</strong> por S/ {pendingReceipt.amount.toFixed(2)} vía {pendingReceipt.method}. El administrador del sistema está validando el pago para restablecer el acceso a tu cuenta de inmediato.
                </p>
              </div>
            </div>
          )}

          {/* Instructions to unlock */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400" />
              Proceso de Activación por el Administrador:
            </h4>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Realiza la transferencia en Soles por <strong>Yape</strong> o <strong>Plin</strong> escaneando el <strong>Código QR Personal del Administrador</strong> o al número registrado <strong>{yapePlinConfig.yapeNumber}</strong>.
              </li>
              <li>
                Ingresa el código de comprobante u operación en el modal para enviarlo a la cola de revisión.
              </li>
              <li>
                <strong>Activación de cuenta:</strong> La reactivación se dará <strong>si y solo si</strong> el Administrador valida el comprobante en su cuenta personal y activa tu cuenta desde el Panel de Control de Administrador.
              </li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>

            <button
              onClick={() => switchRole('super_admin')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
              title="Cambiar al Administrador para validar o desbloquear"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Entrar como Administrador</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={onOpenYapePlin}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pagar con Yape / Plin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenPayment}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pagar con Tarjeta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
