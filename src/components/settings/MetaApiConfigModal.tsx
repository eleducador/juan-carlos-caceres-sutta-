import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Key, 
  Radio, 
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MetaApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetaApiConfigModal: React.FC<MetaApiConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { metaConfig, updateMetaConfig, testMetaConnection, t } = useApp();

  const [phoneNumberId, setPhoneNumberId] = useState(metaConfig.phoneNumberId);
  const [wabaId, setWabaId] = useState(metaConfig.wabaId);
  const [accessToken, setAccessToken] = useState(metaConfig.accessToken);
  const [apiVersion, setApiVersion] = useState(metaConfig.apiVersion);
  const [webhookUrl, setWebhookUrl] = useState(metaConfig.webhookUrl);
  const [verifyToken, setVerifyToken] = useState(metaConfig.verifyToken);
  const [isSandboxMode, setIsSandboxMode] = useState(metaConfig.isSandboxMode);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateMetaConfig({
      phoneNumberId,
      wabaId,
      accessToken,
      apiVersion,
      webhookUrl,
      verifyToken,
      isSandboxMode,
    });
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testMetaConnection();
    setTesting(false);
    setTestResult(result);
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t('settings_title')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {t('settings_subtitle')}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Mode Switcher */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-xs">
                Modo Sandbox / Entorno de Pruebas Seguro
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Permite enviar y simular transmisiones masivas completas con confirmación de lectura sin costo de Meta.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isSandboxMode}
              onChange={(e) => setIsSandboxMode(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('phone_id')} *
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="Ej. 109823749281723"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('waba_id')} *
              </label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="Ej. 982134981723491"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('access_token')} (System User Token) *
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAG9..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t('api_version')}
                </label>
                <select
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="v21.0">v21.0 (Oficial Recomendada)</option>
                  <option value="v22.0">v22.0 (Latest Graph API)</option>
                  <option value="v20.0">v20.0</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {t('verify_token')}
                </label>
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Webhook Endpoint for Meta Developers portal */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t('webhook_url')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-300 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={copyWebhook}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Comprobando con Meta Graph API...' : t('test_connection')}</span>
            </button>

            {testResult && (
              <div
                className={`mt-2 p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Data Security & GDPR Compliance Badge */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-slate-400 text-[11px]">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seguridad de Datos y Estándares Meta Verificados</span>
            </div>
            <p className="leading-relaxed">
              {t('security_standards')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10 transition-colors"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};
