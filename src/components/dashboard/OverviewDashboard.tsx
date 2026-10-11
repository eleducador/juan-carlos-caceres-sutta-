import React from 'react';
import { 
  Send, 
  CheckCheck, 
  Eye, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  Upload, 
  FileDown, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PdfReportService } from '../../services/pdfReportService';

interface OverviewDashboardProps {
  onNewCampaign: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  onNewCampaign,
  onNavigateTab,
  onOpenSettings,
}) => {
  const { 
    campaigns, 
    contacts, 
    currentUser, 
    metaConfig, 
    t 
  } = useApp();

  // Aggregate stats
  const totalSent = campaigns.reduce((acc, c) => acc + c.stats.sent, 0);
  const totalDelivered = campaigns.reduce((acc, c) => acc + c.stats.delivered, 0);
  const totalRead = campaigns.reduce((acc, c) => acc + c.stats.read, 0);
  const totalReplied = campaigns.reduce((acc, c) => acc + c.stats.replied, 0);

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0';
  const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0.0';
  const replyRate = totalRead > 0 ? ((totalReplied / totalRead) * 100).toFixed(1) : '0.0';

  const handleDownloadPdf = () => {
    PdfReportService.generateExecutiveReport(campaigns, contacts, currentUser.companyName);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {currentUser.companyName}
            </h1>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-emerald-400 font-medium">
              API Oficial Meta Activa
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transmisión masiva autorizada · Tasa de entrega de alta velocidad
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('export_pdf_report')}</span>
          </button>

          <button
            onClick={onNewCampaign}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{t('new_campaign_btn')}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Tabular numerals, unboxed metadata) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* KPI 1: Total Sent */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('total_sent')}</span>
            <Send className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono-numbers">
            {totalSent.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">+14.2%</span>
            <span aria-hidden="true">·</span>
            <span>vs ciclo anterior</span>
          </div>
        </div>

        {/* KPI 2: Delivery Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('delivery_rate')}</span>
            <CheckCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono-numbers">
            {deliveryRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-300 font-mono-numbers">{totalDelivered} recibidos</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Sin bloqueos</span>
          </div>
        </div>

        {/* KPI 3: Open / Read Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('read_rate')}</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono-numbers">
            {readRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-300 font-mono-numbers">{totalRead} leídos</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-400">Doble check azul</span>
          </div>
        </div>

        {/* KPI 4: Reply Rate */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">{t('reply_rate')}</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white font-mono-numbers">
            {replyRate}%
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-300 font-mono-numbers">{totalReplied} respuestas</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">Interacción directa</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Real-time Performance & Meta Infrastructure Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Timeline Visualization */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {t('messages_by_hour')}
              </h2>
              <p className="text-[11px] text-slate-400">
                Monitoreo continuo de latencia de entrega y aperturas registradas
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span>Entregados</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400"></span>
                <span>Leídos</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
            {[
              { label: '08:00', sent: 35, read: 28 },
              { label: '10:00', sent: 82, read: 70 },
              { label: '12:00', sent: 95, read: 84 },
              { label: '14:00', sent: 64, read: 52 },
              { label: '16:00', sent: 110, read: 96 },
              { label: '18:00', sent: 75, read: 65 },
              { label: '20:00', sent: 40, read: 34 },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full max-w-[32px] flex items-end gap-1 h-full">
                  <div
                    className="w-1/2 bg-emerald-500/80 rounded-t-sm hover:bg-emerald-400 transition-all"
                    style={{ height: `${(bar.sent / 120) * 100}%` }}
                    title={`${bar.sent} entregados a las ${bar.label}`}
                  />
                  <div
                    className="w-1/2 bg-sky-400/80 rounded-t-sm hover:bg-sky-300 transition-all"
                    style={{ height: `${(bar.read / 120) * 100}%` }}
                    title={`${bar.read} leídos a las ${bar.label}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono-numbers">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Tiempo medio de lectura tras entrega: <strong className="text-slate-200 font-mono-numbers">3.4 minutos</strong></span>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              Ver analítica detallada
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meta Official Cloud API Status Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                  M
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Meta Cloud API Status
                  </h3>
                  <span className="text-[10px] text-slate-400">Infraestructura Oficial</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CONECTADO
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Teléfono Emisor:</span>
                <span className="font-mono-numbers font-medium text-slate-200">+52 55 9988 7766</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Calidad de Número:</span>
                <span className="text-emerald-400 font-semibold">ALTA (GREEN)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Límite de Envío:</span>
                <span className="font-mono-numbers font-medium">{metaConfig.rateTier}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span className="text-slate-400">Versión Graph:</span>
                <span className="font-mono-numbers">{metaConfig.apiVersion}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-300">
                <span className="text-slate-400">Modo de Operación:</span>
                <span className="text-slate-200 font-medium">
                  {metaConfig.isSandboxMode ? 'Sandbox de Pruebas Seguro' : 'Producción Meta Directo'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={onOpenSettings}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
            >
              Configurar Credenciales WABA
            </button>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {t('recent_broadcasts')}
            </h3>
            <p className="text-[11px] text-slate-400">
              Campañas personalizadas ejecutadas con plantillas aprobadas
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            {t('view_all')} →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                <th className="py-2.5 px-3">Campaña</th>
                <th className="py-2.5 px-3">Plantilla</th>
                <th className="py-2.5 px-3">Audiencia</th>
                <th className="py-2.5 px-3 text-right">Enviados</th>
                <th className="py-2.5 px-3 text-right">Entrega</th>
                <th className="py-2.5 px-3 text-right">Apertura</th>
                <th className="py-2.5 px-3 text-right">Respuestas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {campaigns.slice(0, 4).map((camp) => {
                const campDeliveryRate = camp.stats.sent > 0
                  ? ((camp.stats.delivered / camp.stats.sent) * 100).toFixed(1)
                  : '0.0';
                const campReadRate = camp.stats.delivered > 0
                  ? ((camp.stats.read / camp.stats.delivered) * 100).toFixed(1)
                  : '0.0';

                return (
                  <tr key={camp.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-200">
                      <div className="font-sans font-semibold text-white">{camp.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(camp.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">
                      <span className="text-[11px] font-mono text-slate-400">
                        {camp.templateName}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">
                      <span className="text-[11px] text-slate-300">
                        {camp.targetAudience.filterLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {camp.stats.sent}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                      {campDeliveryRate}%
                    </td>
                    <td className="py-3 px-3 text-right text-sky-400 font-semibold">
                      {campReadRate}%
                    </td>
                    <td className="py-3 px-3 text-right text-amber-400 font-semibold">
                      {camp.stats.replied}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
