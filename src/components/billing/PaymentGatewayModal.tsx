import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  Loader2,
  QrCode,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: string;
  defaultAmount?: number;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  defaultAmount = 99.00,
}) => {
  const { payInvoice, currentUser, invoices, t } = useApp();

  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'mercadopago' | 'paypal'>('stripe');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form mock state
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(currentUser.name || 'Carlos Mendoza');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('889');

  if (!isOpen) return null;

  const targetInvoice = invoices.find((inv) => inv.id === invoiceId) || invoices.find((inv) => inv.status === 'pending') || invoices[0];
  const payableAmount = targetInvoice ? targetInvoice.amount : (currentUser.unpaidBalance || defaultAmount);

  const handleProcessPayment = async () => {
    setProcessing(true);
    try {
      const invId = targetInvoice ? targetInvoice.id : 'inv_adhoc';
      await payInvoice(invId, selectedGateway);
      setSuccess(true);
      setTimeout(() => {
        setProcessing(false);
      }, 500);
    } catch (err) {
      setProcessing(false);
    }
  };

  const handleFinish = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pasarela de Pago Segura
              </h3>
              <p className="text-[11px] text-slate-400">
                Integración oficial con cifrado PCI-DSS Nivel 1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">¡Pago Procesado Exitosamente!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              {t('payment_success_msg')}
            </p>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-mono-numbers">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Transacción ID:</span>
                <span className="text-emerald-400">TXN_META_{Math.random().toString(36).substring(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Monto Acreditado:</span>
                <span>S/ {payableAmount.toFixed(2)} PEN</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Estado de Cuenta:</span>
                <span className="text-emerald-400 font-bold">100% ACTIVA</span>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg"
            >
              Volver al Panel de WhatsBroadcast
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Amount Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Total a Regularizar
                </span>
                <div className="text-2xl font-bold text-white font-mono-numbers mt-0.5">
                  S/ {payableAmount.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">PEN</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {targetInvoice ? targetInvoice.planName : 'Renovación de Cuota'}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Factura N° {targetInvoice?.invoiceNumber || 'INV-2026'}</p>
              </div>
            </div>

            {/* Gateway Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t('select_gateway')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Stripe */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('stripe')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedGateway === 'stripe'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs">Stripe</div>
                  <span className="text-[10px] text-slate-400 mt-1">Tarjetas & Apple Pay</span>
                </button>

                {/* Mercado Pago */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('mercadopago')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedGateway === 'mercadopago'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-sky-400">Mercado Pago</div>
                  <span className="text-[10px] text-slate-400 mt-1">Pix, Tarjeta, Oxxo</span>
                </button>

                {/* PayPal */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('paypal')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    selectedGateway === 'paypal'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-400">PayPal</div>
                  <span className="text-[10px] text-slate-400 mt-1">Express Checkout</span>
                </button>
              </div>
            </div>

            {/* Dynamic Gateway Form */}
            {selectedGateway === 'stripe' && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Número de Tarjeta (Débito / Crédito)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono-numbers text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Fecha Expiración
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/AA"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono-numbers text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Código CVC / CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono-numbers text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Titular de la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {selectedGateway === 'mercadopago' && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Método Mercado Pago:</span>
                  <span className="font-semibold text-sky-400">Checkout Pro / Pix / Tarjeta</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Al confirmar, se procesará el pago automáticamente a través del token seguro de Mercado Pago LATAM. Se aplicará acreditación instantánea a la cuota de WhatsBroadcast.
                </p>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Disponible para México, Argentina, Colombia, Chile, Perú y Brasil (Pix).</span>
                </div>
              </div>
            )}

            {selectedGateway === 'paypal' && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Cuenta PayPal Conectada:</span>
                  <span className="font-semibold text-amber-400 font-mono text-[11px]">{currentUser.email}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El débito se autorizará de forma segura en tus fondos PayPal o tarjeta asociada con garantía al comprador.
                </p>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Transacción cifrada 256-bit SSL · Desbloqueo de cuenta instantáneo</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={processing}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirmando con {selectedGateway}...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Pago de S/ {payableAmount.toFixed(2)} PEN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
