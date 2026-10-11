import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Zap, 
  ShieldCheck, 
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { YapePlinCheckoutModal } from './YapePlinCheckoutModal';

export const BillingSubscriptions: React.FC = () => {
  const { 
    currentUser, 
    plans, 
    invoices, 
    yapePlinConfig,
    changeSubscriptionPlan, 
    requestPushPermission, 
    pushEnabled, 
    t 
  } = useApp();

  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showYapePlinModal, setShowYapePlinModal] = useState(false);

  const quotaPercent = Math.min(
    100,
    Math.round((currentUser.quotaUsed / (currentUser.quotaLimit || 1)) * 100)
  );

  const handlePayInvoice = (invId: string) => {
    setSelectedInvoiceForPayment(invId);
    setShowPaymentModal(true);
  };

  const handleDownloadReceipt = (invNumber: string) => {
    const content = `COMPROBANTE OFICIAL DE PAGO - WHATSBROADCAST PRO\nFactura: ${invNumber}\nCliente: ${currentUser.companyName}\nFecha: ${new Date().toLocaleDateString()}\nEstado: PAGADO\nPasarela: Cifrado PCI DSS Directo`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Recibo_${invNumber}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {t('billing_title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('billing_subtitle')}
          </p>
        </div>
      </div>

      {/* Current Subscription Status Strip */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              {t('current_plan')}
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {currentUser.planId === '1_month' ? 'Plan 1 Mes' : currentUser.planId === '2_months' ? 'Plan 2 Meses' : currentUser.planId === '4_months' ? 'Plan 4 Meses' : currentUser.planId}
              </h2>
              {currentUser.status === 'active' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Activo y Al Día
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                  Pago Pendiente / Bloqueado
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Próxima fecha de renovación: <strong className="text-slate-300 font-mono-numbers">{currentUser.dueDate}</strong>
            </p>
          </div>

          {/* Quota Progress */}
          <div className="w-full md:w-72 space-y-1.5 font-mono-numbers text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans font-medium text-slate-400">Consumo de Mensajes</span>
              <span className="font-bold">{quotaPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${quotaPercent > 90 ? 'bg-red-500' : 'bg-emerald-400'}`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>{currentUser.quotaUsed.toLocaleString()} enviados</span>
              <span>Límite: {currentUser.quotaLimit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Push Billing Reminders Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">
              Recordatorios Push de Facturación y Vencimientos
            </h3>
            <p className="text-[11px] text-slate-400">
              Recibe notificaciones web inmediatas antes de que venza tu suscripción para evitar suspensión.
            </p>
          </div>
        </div>

        <button
          onClick={requestPushPermission}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
            pushEnabled
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
          }`}
        >
          {pushEnabled ? '✓ Notificaciones Push Activas' : 'Activar Recordatorios Push'}
        </button>
      </div>

      {/* Pricing Comparison Cards */}
      <div>
        <div className="mb-4 text-left">
          <h3 className="text-base font-bold text-white tracking-tight">
            Planes de Suscripción Oficiales
          </h3>
          <p className="text-xs text-slate-400">
            Escala tu capacidad de envío mensual con tarifas por conversación de Meta Cloud API
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrent = currentUser.planId === p.id;

            return (
              <div
                key={p.id}
                className={`p-6 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-bold text-white">{p.name}</h4>
                    {p.recommended && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-4 font-mono-numbers">
                    <span className="text-sm font-bold text-emerald-400 font-sans">S/</span>
                    <span className="text-3xl font-extrabold text-white">{p.pricePEN}</span>
                    <span className="text-xs text-slate-400 font-sans">PEN ({p.durationDays} días)</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6 font-sans">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default"
                    >
                      Plan Actualmente Seleccionado
                    </button>
                  ) : (
                    <button
                      onClick={() => changeSubscriptionPlan(p.id)}
                      className="w-full py-2.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                    >
                      Cambiar a este Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
        <h3 className="text-sm font-bold text-white mb-4 tracking-tight">
          {t('invoice_history')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-numbers">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px] font-sans">
                <th className="py-2.5 px-3">{t('invoice_num')}</th>
                <th className="py-2.5 px-3">{t('invoice_date')}</th>
                <th className="py-2.5 px-3">Plan / Detalle</th>
                <th className="py-2.5 px-3">Monto</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {inv.date}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-300">
                    {inv.planName}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-100">
                    S/ {inv.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    {inv.status === 'paid' ? (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Pagado
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    {inv.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPayment(inv.id);
                            setShowYapePlinModal(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
                        >
                          Yape / Plin
                        </button>
                        <button
                          onClick={() => handlePayInvoice(inv.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm"
                        >
                          {t('pay_now')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadReceipt(inv.invoiceNumber)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Recibo</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceId={selectedInvoiceForPayment || undefined}
      />

      {/* Yape & Plin Checkout Modal */}
      <YapePlinCheckoutModal
        isOpen={showYapePlinModal}
        onClose={() => setShowYapePlinModal(false)}
      />
    </div>
  );
};
