import React from 'react';
import { 
  X, 
  Bell, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenPayment,
}) => {
  const { 
    alerts, 
    dismissAlert, 
    requestPushPermission, 
    pushEnabled, 
    t 
  } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {t('notification_center')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Push notification banner */}
          <div className="p-4 bg-slate-950/60 border-b border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200">
                    Notificaciones Push Web
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Alertas instantáneas de facturación y cuota
                  </p>
                </div>
              </div>
              <button
                onClick={requestPushPermission}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pushEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {pushEnabled ? 'Activadas' : 'Activar Push'}
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                <p className="text-xs">No tienes avisos pendientes en este momento.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isWarning = alert.type === 'quota_warning';
                const isDue = alert.type === 'payment_due';
                const isSuccess = alert.type === 'payment_success';

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {isDue && <CreditCard className="w-4 h-4 text-amber-400" />}
                          {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                          {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">
                            {alert.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {alert.message}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-mono-numbers">
                              {alert.createdAt}
                            </span>
                            {isDue && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onOpenPayment();
                                }}
                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                              >
                                Pagar ahora
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-slate-400 hover:text-slate-300 p-1"
                        title="Descartar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
