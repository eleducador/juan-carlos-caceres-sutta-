import React from 'react';
import { 
  X, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Eye, 
  MessageSquare, 
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LiveCampaignRunnerModalProps {
  campaignId: string | null;
  onClose: () => void;
}

export const LiveCampaignRunnerModal: React.FC<LiveCampaignRunnerModalProps> = ({
  campaignId,
  onClose,
}) => {
  const { 
    campaigns, 
    startBroadcastExecution, 
    pauseBroadcastExecution,
    activeRunningCampaignId,
    metaConfig,
    t 
  } = useApp();

  if (!campaignId) return null;

  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return null;

  const isRunning = campaign.status === 'running';
  const isCompleted = campaign.status === 'completed';

  const progressPercent = campaign.stats.total > 0
    ? Math.min(100, Math.round((campaign.stats.sent / campaign.stats.total) * 100))
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isRunning 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <Radio className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {campaign.title}
                </h3>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                  isRunning
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {isRunning ? 'Transmitiendo en Vivo' : isCompleted ? 'Transmisión Finalizada' : 'Pausado'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Plantilla: <span className="font-mono text-slate-300">{campaign.templateName}</span> · {campaign.targetAudience.filterLabel}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {metaConfig.isSandboxMode && (
          <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-bold">Modo Simulación (Sandbox) Activo:</span> Los envíos se muestran en pantalla como demostración y no se cobran ni llegan a números reales. Para enviar mensajes reales a celulares por Meta Cloud API, desactiva el Sandbox e ingresa tu Token en Configuración.
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Progreso General de Envíos
            </span>
            <span className="font-bold text-emerald-400 font-mono-numbers text-sm">
              {progressPercent}% ({campaign.stats.sent} / {campaign.stats.total})
            </span>
          </div>

          {/* Large Progress Bar */}
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-sky-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Real-time KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono-numbers">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <Send className="w-3 h-3 text-slate-400" />
                ENVIADOS
              </span>
              <span className="text-lg font-bold text-white block mt-0.5">
                {campaign.stats.sent}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ENTREGADOS
              </span>
              <span className="text-lg font-bold text-emerald-400 block mt-0.5">
                {campaign.stats.delivered}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <Eye className="w-3 h-3 text-sky-400" />
                LEÍDOS
              </span>
              <span className="text-lg font-bold text-sky-400 block mt-0.5">
                {campaign.stats.read}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <MessageSquare className="w-3 h-3 text-amber-400" />
                RESPUESTAS
              </span>
              <span className="text-lg font-bold text-amber-400 block mt-0.5">
                {campaign.stats.replied}
              </span>
            </div>
          </div>
        </div>

        {/* Live Message Delivery Log Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Registro de Estados en Tiempo Real (Meta Webhooks)
            </h4>
            <span className="text-[10px] text-slate-400">
              Mostrando últimos eventos
            </span>
          </div>

          {campaign.logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Esperando despacho de los primeros mensajes...
            </div>
          ) : (
            <div className="space-y-1.5 font-mono-numbers text-xs">
              {campaign.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-slate-300"
                >
                  <div className="flex flex-col truncate max-w-sm">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-white truncate max-w-[140px]">
                        {log.contactName}
                      </span>
                      <span className="text-[11px] text-slate-400">({log.phone})</span>
                    </div>
                    {log.errorMessage && (
                      <span className="text-[10px] text-red-400 truncate mt-0.5 font-sans">
                        ⚠️ {log.errorMessage}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://api.whatsapp.com/send?phone=${log.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(log.renderedText || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition-colors flex items-center gap-1"
                      title="Abrir chat en WhatsApp Web o App"
                    >
                      <span>💬 wa.me</span>
                    </a>

                    {log.status === 'replied' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        RESPONDIDO
                      </span>
                    )}
                    {log.status === 'read' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        LEÍDO ✓✓
                      </span>
                    )}
                    {log.status === 'delivered' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ENTREGADO ✓
                      </span>
                    )}
                    {log.status === 'failed' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        FALLIDO
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400">
                      {log.sentAt ? new Date(log.sentAt).toLocaleTimeString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Velocidad: <strong className="text-slate-300">{campaign.throttleSpeedPerSecond} msg/s</strong> · Meta Graph Cloud API
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={() => pauseBroadcastExecution(campaign.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pausar Envío</span>
              </button>
            ) : !isCompleted ? (
              <button
                onClick={() => startBroadcastExecution(campaign.id)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-colors font-bold"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Reanudar Envío</span>
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              Cerrar Monitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
