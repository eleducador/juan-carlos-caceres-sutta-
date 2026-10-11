import React, { useState, useRef } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  Save, 
  QrCode, 
  Upload,
  Trash2,
  Eye,
  X,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { YapePlinReceipt } from '../../types';

export const PaymentMethodsSettings: React.FC = () => {
  const { 
    yapePlinConfig, 
    updateYapePlinConfig, 
    yapePlinReceipts, 
    approveReceiptAndUnlockUser, 
    rejectReceipt, 
    plans, 
    updatePlanPrices 
  } = useApp();

  // Yape / Plin Form
  const [yapeNumber, setYapeNumber] = useState(yapePlinConfig.yapeNumber);
  const [yapeHolder, setYapeHolder] = useState(yapePlinConfig.yapeHolder);
  const [plinNumber, setPlinNumber] = useState(yapePlinConfig.plinNumber);
  const [plinHolder, setPlinHolder] = useState(yapePlinConfig.plinHolder);
  const [plinBank, setPlinBank] = useState(yapePlinConfig.plinBank);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // QR Code Image states (Supports custom uploaded Base64 images)
  const [yapeQrUrl, setYapeQrUrl] = useState<string>(yapePlinConfig.yapeQrUrl || '');
  const [plinQrUrl, setPlinQrUrl] = useState<string>(yapePlinConfig.plinQrUrl || '');

  const yapeFileInputRef = useRef<HTMLInputElement>(null);
  const plinFileInputRef = useRef<HTMLInputElement>(null);

  // Selected receipt to view details/voucher
  const [inspectReceipt, setInspectReceipt] = useState<YapePlinReceipt | null>(null);

  // Plan Pricing Form (Time-Based: 1 mes, 2 meses, 4 meses - Exclusivamente en Soles PEN)
  const plan1 = plans.find((p) => p.id === '1_month') || plans[0];
  const plan2 = plans.find((p) => p.id === '2_months') || plans[1];
  const plan4 = plans.find((p) => p.id === '4_months') || plans[2];

  const [plan1PEN, setPlan1PEN] = useState(plan1?.pricePEN || 99);
  const [plan2PEN, setPlan2PEN] = useState(plan2?.pricePEN || 179);
  const [plan4PEN, setPlan4PEN] = useState(plan4?.pricePEN || 299);

  // File Upload Handlers (Converts image to persistent Base64 Data URL)
  const handleYapeQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setYapeQrUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePlinQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPlinQrUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetYapeQr = () => {
    const autoQr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=YAPE_${yapeNumber.replace(/\s+/g, '')}_${encodeURIComponent(yapeHolder)}`;
    setYapeQrUrl(autoQr);
  };

  const handleResetPlinQr = () => {
    const autoQr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=PLIN_${plinNumber.replace(/\s+/g, '')}_${encodeURIComponent(plinHolder)}`;
    setPlinQrUrl(autoQr);
  };

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();

    const finalYapeQr = yapeQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=YAPE_${yapeNumber.replace(/\s+/g, '')}_${encodeURIComponent(yapeHolder)}`;
    const finalPlinQr = plinQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=PLIN_${plinNumber.replace(/\s+/g, '')}_${encodeURIComponent(plinHolder)}`;

    updateYapePlinConfig({
      yapeNumber,
      yapeHolder,
      plinNumber,
      plinHolder,
      plinBank,
      currency: 'PEN',
      yapeQrUrl: finalYapeQr,
      plinQrUrl: finalPlinQr,
    });

    // Save time-based plan costs in Soles only
    updatePlanPrices('1_month', Number(plan1PEN));
    updatePlanPrices('2_months', Number(plan2PEN));
    updatePlanPrices('4_months', Number(plan4PEN));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const pendingReceipts = yapePlinReceipts.filter((r) => r.status === 'pending_review');

  const isCustomYape = yapeQrUrl && !yapeQrUrl.includes('api.qrserver.com');
  const isCustomPlin = plinQrUrl && !plinQrUrl.includes('api.qrserver.com');

  return (
    <div className="space-y-8">
      {/* Notice Banner: Personal Account Payments & Manual Admin Validation */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-900 border border-purple-500/30 text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Cuentas Personales de Yape y Plin para Recibir Pagos Directos
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Sube tus códigos QR personales para que el dinero vaya directamente a tu cuenta bancaria. La activación de cualquier usuario suspendido o bloqueado se producirá <strong>única y exclusivamente</strong> cuando tú, como administrador, valides el comprobante y presiones <strong>"Aprobar y Dar de Alta"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Receipts Approval Queue (Cola de comprobantes por verificar) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Cola de Validación de Pagos Yape / Plin
              </h3>
              {pendingReceipts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  {pendingReceipts.length} pendientes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Valida el pago que ingresó a tu cuenta personal para dar de alta y reactivar al cliente en el sistema.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-numbers">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                <th className="py-2 px-3">Cliente / Empresa</th>
                <th className="py-2 px-3">Medio</th>
                <th className="py-2 px-3">N° de Operación</th>
                <th className="py-2 px-3">Monto</th>
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Estado</th>
                <th className="py-2 px-3 text-right">Validación del Administrador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {yapePlinReceipts.map((rcp) => (
                <tr key={rcp.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3 font-sans">
                    <span className="font-bold text-white block">{rcp.companyName}</span>
                    <span className="text-[10px] text-slate-400">{rcp.userName}</span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rcp.method === 'YAPE' ? 'bg-purple-600/20 text-purple-300' : 'bg-cyan-600/20 text-cyan-300'
                    }`}>
                      {rcp.method}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span>{rcp.operationCode}</span>
                      {rcp.receiptImageUrl && (
                        <button
                          type="button"
                          onClick={() => setInspectReceipt(rcp)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Ver captura de comprobante"
                        >
                          <Eye className="w-3 h-3 text-emerald-400" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-400">
                    S/ {rcp.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {rcp.date}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    {rcp.status === 'pending_review' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Por Verificar
                      </span>
                    )}
                    {rcp.status === 'approved' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Aprobado (Dado de Alta)
                      </span>
                    )}
                    {rcp.status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        Rechazado
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    {rcp.status === 'pending_review' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => approveReceiptAndUnlockUser(rcp.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shadow-sm transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Validar y Dar de Alta</span>
                        </button>
                        <button
                          onClick={() => rejectReceipt(rcp.id)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 font-medium text-[11px] transition-colors"
                        >
                          ✕ Rechazar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Procesado por Admin</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Form: Subir QR Personal y Cuentas Oficiales */}
      <form onSubmit={handleSavePaymentConfig} className="space-y-6 text-left">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Subir Códigos QR y Datos de Cuentas Personales (Yape & Plin)
              </h3>
              <p className="text-xs text-slate-400">
                Sube la imagen o captura de tu código QR de Yape / Plin. Estos datos se mostrarán directamente al usuario al realizar el pago.
              </p>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                ¡Configuración guardada y publicada!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Yape Settings & QR Upload */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-4 text-xs">
              <div className="flex items-center justify-between text-purple-400 font-bold border-b border-purple-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">Configuración de Yape Personal</span>
                </div>
                {isCustomYape ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    QR Personal Subido
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    QR Predeterminado
                  </span>
                )}
              </div>

              {/* QR Upload Section */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-24 h-24 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={yapeQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=YAPE_${yapeNumber.replace(/\s+/g, '')}_${encodeURIComponent(yapeHolder)}`}
                    alt="QR Yape Personal"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-[11px] font-bold text-slate-200 block">
                    Imagen del Código QR Yape
                  </span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Sube la captura de tu app Yape (PNG, JPG o WebP) para que el pago vaya directo a tu cuenta personal.
                  </p>

                  <input
                    ref={yapeFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleYapeQrFileUpload}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => yapeFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] shadow transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isCustomYape ? 'Reemplazar QR' : 'Subir Código QR'}</span>
                    </button>

                    {isCustomYape && (
                      <button
                        type="button"
                        onClick={handleResetYapeQr}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
                        title="Restablecer a QR automático"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Número Telefónico Yape Personal *
                </label>
                <input
                  type="text"
                  required
                  value={yapeNumber}
                  onChange={(e) => setYapeNumber(e.target.value)}
                  placeholder="Ej. 984 512 890"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nombre Completo del Titular Personal *
                </label>
                <input
                  type="text"
                  required
                  value={yapeHolder}
                  onChange={(e) => setYapeHolder(e.target.value)}
                  placeholder="Ej. Juan Carlos Sutta"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Plin Settings & QR Upload */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4 text-xs">
              <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-cyan-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">Configuración de Plin Personal</span>
                </div>
                {isCustomPlin ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    QR Personal Subido
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    QR Predeterminado
                  </span>
                )}
              </div>

              {/* QR Upload Section */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
                <div className="w-24 h-24 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={plinQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=PLIN_${plinNumber.replace(/\s+/g, '')}_${encodeURIComponent(plinHolder)}`}
                    alt="QR Plin Personal"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-[11px] font-bold text-slate-200 block">
                    Imagen del Código QR Plin
                  </span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Sube la captura de tu app Plin (Interbank, BBVA o Scotiabank) para transferencias directas a tu cuenta.
                  </p>

                  <input
                    ref={plinFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePlinQrFileUpload}
                    className="hidden"
                  />

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => plinFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isCustomPlin ? 'Reemplazar QR' : 'Subir Código QR'}</span>
                    </button>

                    {isCustomPlin && (
                      <button
                        type="button"
                        onClick={handleResetPlinQr}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
                        title="Restablecer a QR automático"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Número Telefónico Plin Personal *
                </label>
                <input
                  type="text"
                  required
                  value={plinNumber}
                  onChange={(e) => setPlinNumber(e.target.value)}
                  placeholder="Ej. 984 512 890"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nombre Completo del Titular Personal *
                </label>
                <input
                  type="text"
                  required
                  value={plinHolder}
                  onChange={(e) => setPlinHolder(e.target.value)}
                  placeholder="Ej. Juan Carlos Sutta"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Banco Asociado
                </label>
                <input
                  type="text"
                  value={plinBank}
                  onChange={(e) => setPlinBank(e.target.value)}
                  placeholder="Interbank / BBVA / Scotiabank / BanBif"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan Pricing Management strictly in Soles (PEN) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Gestión de Costos de Suscripción en Soles (S/ · PEN)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase border border-emerald-500/20">
                Moneda Nacional Única
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Todos los cobros y planes se configuran exclusivamente en Soles peruanos. Los accesos caducan automáticamente al terminar la vigencia contratada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-numbers">
            {/* Plan 1 Mes */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-slate-200 block text-sm">Plan 1 Mes</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans font-medium">30 Días</span>
              </div>
              <span className="text-[11px] text-slate-400 block font-sans">Vigencia estándar para nuevos clientes</span>
              
              <div className="pt-1">
                <label className="block text-[10px] text-slate-400 font-sans uppercase mb-1">Precio Total en Soles (S/)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-400 font-sans">S/</span>
                  <input
                    type="number"
                    value={plan1PEN}
                    onChange={(e) => setPlan1PEN(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-base text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Plan 2 Meses */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg font-sans">
                POPULAR
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-emerald-300 block text-sm">Plan 2 Meses</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-sans font-medium mr-12">60 Días</span>
              </div>
              <span className="text-[11px] text-slate-400 block font-sans">Bimestral con descuento de incentivo</span>
              
              <div className="pt-1">
                <label className="block text-[10px] text-slate-400 font-sans uppercase mb-1">Precio Total en Soles (S/)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-400 font-sans">S/</span>
                  <input
                    type="number"
                    value={plan2PEN}
                    onChange={(e) => setPlan2PEN(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-base text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Plan 4 Meses */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg font-sans">
                MAX BENEFICIO
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-purple-300 block text-sm">Plan 4 Meses</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-sans font-medium mr-16">120 Días</span>
              </div>
              <span className="text-[11px] text-slate-400 block font-sans">Cuatrimestral con mayor fidelización</span>
              
              <div className="pt-1">
                <label className="block text-[10px] text-slate-400 font-sans uppercase mb-1">Precio Total en Soles (S/)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-400 font-sans">S/</span>
                  <input
                    type="number"
                    value={plan4PEN}
                    onChange={(e) => setPlan4PEN(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-base text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar y Publicar Códigos QR y Datos Personales</span>
          </button>
        </div>
      </form>

      {/* Inspect Voucher / Receipt Modal */}
      {inspectReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Detalle de Comprobante {inspectReceipt.method}</span>
              </h4>
              <button
                onClick={() => setInspectReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cliente:</span>
                  <span className="font-bold text-white">{inspectReceipt.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medio:</span>
                  <span className="font-bold text-purple-300">{inspectReceipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">N° de Operación:</span>
                  <span className="font-mono font-bold text-white">{inspectReceipt.operationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto:</span>
                  <span className="font-bold text-emerald-400">S/ {inspectReceipt.amount.toFixed(2)} PEN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha:</span>
                  <span className="text-slate-300">{inspectReceipt.date}</span>
                </div>
              </div>

              {inspectReceipt.receiptImageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold">Captura de Comprobante:</span>
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2">
                    <img
                      src={inspectReceipt.receiptImageUrl}
                      alt="Comprobante"
                      className="w-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {inspectReceipt.status === 'pending_review' && (
                <button
                  type="button"
                  onClick={() => {
                    approveReceiptAndUnlockUser(inspectReceipt.id);
                    setInspectReceipt(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  ✓ Validar y Dar de Alta
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectReceipt(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
