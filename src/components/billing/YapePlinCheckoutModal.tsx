import React, { useState, useRef } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  Upload,
  Clock,
  Lock,
  FileCheck2,
  Trash2,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface YapePlinCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmountPEN?: number;
}

export const YapePlinCheckoutModal: React.FC<YapePlinCheckoutModalProps> = ({
  isOpen,
  onClose,
  defaultAmountPEN = 99.00,
}) => {
  const { 
    currentUser, 
    yapePlinConfig, 
    submitYapePlinPayment, 
    invoices 
  } = useApp();

  const [selectedMethod, setSelectedMethod] = useState<'YAPE' | 'PLIN'>('YAPE');
  const [operationCode, setOperationCode] = useState('');
  const [voucherImage, setVoucherImage] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showQrZoom, setShowQrZoom] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetInvoice = invoices.find((inv) => inv.status === 'pending') || invoices[0];
  const payablePEN = (currentUser.unpaidBalance > 0 ? currentUser.unpaidBalance : defaultAmountPEN).toFixed(2);

  const activePhone = selectedMethod === 'YAPE' ? yapePlinConfig.yapeNumber : yapePlinConfig.plinNumber;
  const activeHolder = selectedMethod === 'YAPE' ? yapePlinConfig.yapeHolder : yapePlinConfig.plinHolder;
  const activeQr = selectedMethod === 'YAPE' ? yapePlinConfig.yapeQrUrl : yapePlinConfig.plinQrUrl;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(activePhone.replace(/\s+/g, ''));
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setVoucherImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = () => {
    if (!operationCode.trim()) return;

    submitYapePlinPayment({
      userId: currentUser.id,
      userName: currentUser.name,
      companyName: currentUser.companyName,
      method: selectedMethod,
      operationCode: operationCode.trim(),
      amount: Number(payablePEN),
      currency: 'PEN',
      planId: currentUser.planId,
      receiptImageUrl: voucherImage || undefined,
    });

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white font-bold text-xs ${
              selectedMethod === 'YAPE' ? 'bg-purple-600' : 'bg-cyan-600'
            }`}>
              {selectedMethod}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Pago por {selectedMethod} a Cuenta Personal
              </h3>
              <p className="text-[11px] text-slate-400">
                Abona tu suscripción en Soles (PEN) y registra tu comprobante
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

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                ¡Comprobante Enviado para Validación!
              </h4>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold inline-block">
                Pendiente de Validación por el Administrador
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>N° de Operación:</span>
                <span className="font-mono font-bold text-white">{operationCode}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monto a Validar:</span>
                <span className="font-bold text-emerald-400">S/ {payablePEN} PEN</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Medio de Pago:</span>
                <span className="font-bold text-purple-300">{selectedMethod}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 text-left flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Importante:</strong> La activación de tu cuenta bloqueada se realizará <strong>si y solo si</strong> el Administrador valida el comprobante en su cuenta personal y lo activa directamente desde el Panel de Control.
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              Cerrar y Esperar Activación
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('YAPE')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedMethod === 'YAPE'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>Yape Personal (BCP)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('PLIN')}
                className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedMethod === 'PLIN'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>Plin Personal (Interbank / BBVA)</span>
              </button>
            </div>

            {/* Total Amount to Pay in Soles */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono-numbers">
              <div>
                <span className="text-[11px] text-slate-400 font-sans uppercase font-semibold">
                  Monto a Transferir en Soles (PEN)
                </span>
                <div className="text-2xl font-bold text-white mt-0.5">
                  S/ {payablePEN}
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-sans px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-semibold">
                Moneda Nacional (PEN)
              </span>
            </div>

            {/* QR Code and Account Info Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              {/* QR Code with Click-to-Zoom */}
              <div 
                onClick={() => setShowQrZoom(true)}
                className="p-2 bg-white rounded-xl shadow-md shrink-0 cursor-pointer group relative"
                title="Click para ver QR en grande"
              >
                <img
                  src={activeQr}
                  alt={`QR ${selectedMethod}`}
                  className="w-28 h-28 object-contain"
                />
                <div className="absolute inset-0 bg-slate-950/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Account Data */}
              <div className="space-y-2 flex-1 text-left w-full">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Cuenta Personal del Administrador</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Número {selectedMethod}</span>
                  <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-700 mt-0.5">
                    <span className="font-mono text-sm font-bold text-white tracking-wide">
                      {activePhone}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedPhone ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Titular de la Cuenta Personal</span>
                  <p className="font-semibold text-slate-200 text-xs">
                    {activeHolder}
                  </p>
                </div>

                {selectedMethod === 'PLIN' && yapePlinConfig.plinBank && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Bancos Aceptados</span>
                    <p className="text-[11px] text-slate-300">
                      {yapePlinConfig.plinBank}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Operation Code Input */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                Número o Código de Operación *
              </label>
              <input
                type="text"
                required
                value={operationCode}
                onChange={(e) => setOperationCode(e.target.value)}
                placeholder="Ej. OP-489210 o 8829103"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">
                Aparece en la constancia de tu aplicativo tras realizar la transferencia.
              </p>
            </div>

            {/* Optional Voucher Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-slate-300 font-semibold">
                Adjuntar Captura del Comprobante (Opcional)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleVoucherUpload}
                className="hidden"
              />

              {voucherImage ? (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-emerald-500/40">
                  <div className="flex items-center gap-2">
                    <img src={voucherImage} alt="Voucher" className="w-10 h-10 object-cover rounded-lg" />
                    <span className="text-[11px] text-emerald-300 font-semibold">Captura adjunta con éxito</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoucherImage(null)}
                    className="p-1 rounded text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-600 text-slate-300 flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Captura de Pantalla del Pago</span>
                </button>
              )}
            </div>

            {/* Explanatory Policy: Activation ONLY by Admin */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Al enviar este comprobante, entrará a la cola de revisión del Administrador. La cuenta será reactivada únicamente cuando el Administrador verifique el depósito en su cuenta personal y la active desde su panel.
              </p>
            </div>

            {/* Submission Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitProof}
                disabled={!operationCode.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Enviar Comprobante al Administrador para Activación</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Zoom Modal */}
      {showQrZoom && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-xs">Escanear Código QR Personal ({selectedMethod})</span>
              <button
                onClick={() => setShowQrZoom(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-3 rounded-2xl mx-auto shadow-2xl inline-block">
              <img
                src={activeQr}
                alt={`QR ${selectedMethod}`}
                className="w-64 h-64 object-contain"
              />
            </div>

            <div className="text-xs space-y-1">
              <p className="font-mono text-base font-bold text-white">{activePhone}</p>
              <p className="text-slate-300 font-semibold">{activeHolder}</p>
            </div>

            <button
              onClick={() => setShowQrZoom(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs"
            >
              Cerrar Vista Ampliada
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
