import React from 'react';
import { ShieldAlert, AlertTriangle, CreditCard, RefreshCw, KeyRound, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BlockedUserBannerProps {
  onOpenPayment: () => void;
  onOpenYapePlin: () => void;
}

export const BlockedUserBanner: React.FC<BlockedUserBannerProps> = ({ 
  onOpenPayment, 
  onOpenYapePlin 
}) => {
  const { currentUser, t, switchRole, yapePlinConfig } = useApp();

  if (currentUser.status !== 'suspended_unpaid') {
    return null;
  }

  return (
    <div className="mb-6 p-4 md:p-5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                {t('blocked_title')}
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                Cuenta Bloqueada por Administrador
              </span>
            </div>
            <p className="mt-1 text-xs md:text-sm text-red-200/90 leading-relaxed max-w-2xl">
              {t('blocked_message')}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs font-mono-numbers text-red-300 flex-wrap">
              <span>Saldo vencido: <strong>S/ {currentUser.unpaidBalance.toFixed(2)} PEN</strong></span>
              <span aria-hidden="true">·</span>
              <span>Fecha límite vencida: {currentUser.dueDate}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Yape / Plin Button */}
          <button
            onClick={onOpenYapePlin}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Pagar con Yape o Plin</span>
          </button>

          {/* Card / Stripe Button */}
          <button
            onClick={onOpenPayment}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-600/80 hover:bg-red-500 text-white transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Tarjeta / Stripe</span>
          </button>

          <button
            onClick={() => switchRole('super_admin')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
            title="Cambiar a Super Administrador para desbloquear manualmente"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Modo Super Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
