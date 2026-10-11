import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause, 
  AlertCircle, 
  BarChart2, 
  Users, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Campaign } from '../../types';

interface CampaignListProps {
  onNewCampaign: () => void;
  onOpenRunner: (campaignId: string) => void;
  onNavigateAnalytics: () => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  onNewCampaign,
  onOpenRunner,
  onNavigateAnalytics,
}) => {
  const { campaigns, startBroadcastExecution, t } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {t('campaigns_title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('campaigns_subtitle')}
          </p>
        </div>
        <button
          onClick={onNewCampaign}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{t('create_campaign')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Segmented status filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'completed', label: 'Completadas' },
            { id: 'scheduled', label: 'Programadas' },
            { id: 'running', label: 'En Transmisión' },
            { id: 'draft', label: 'Borradores' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de campaña..."
            className="w-full sm:w-64 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Campaigns Grid / List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
            <Send className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-500" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron campañas</p>
            <p className="text-xs text-slate-500 mt-1">Crea tu primer envío masivo con plantillas aprobadas.</p>
            <button
              onClick={onNewCampaign}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Campaña Ahora</span>
            </button>
          </div>
        ) : (
          filteredCampaigns.map((camp) => {
            const deliveryRate = camp.stats.sent > 0
              ? ((camp.stats.delivered / camp.stats.sent) * 100).toFixed(1)
              : '0.0';
            const readRate = camp.stats.delivered > 0
              ? ((camp.stats.read / camp.stats.delivered) * 100).toFixed(1)
              : '0.0';
            const replyRate = camp.stats.read > 0
              ? ((camp.stats.replied / camp.stats.read) * 100).toFixed(1)
              : '0.0';

            return (
              <div
                key={camp.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Info block */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                        {camp.title}
                      </h3>
                      {camp.status === 'completed' && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Completada
                        </span>
                      )}
                      {camp.status === 'scheduled' && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Programada
                        </span>
                      )}
                      {camp.status === 'running' && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Transmitiendo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                      <span>Plantilla: <strong className="text-slate-300 font-mono text-[11px]">{camp.templateName}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Audiencia: <strong className="text-slate-300">{camp.targetAudience.filterLabel}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>Creada: {new Date(camp.createdAt).toLocaleDateString()}</span>
                      {camp.scheduledFor && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-300">Envío: {new Date(camp.scheduledFor).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Breakdown Strip */}
                  <div className="flex items-center gap-4 sm:gap-6 py-2 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono-numbers shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ENVIADOS</span>
                      <span className="text-xs md:text-sm font-bold text-white">{camp.stats.sent}</span>
                    </div>
                    <div className="border-l border-slate-800 pl-4">
                      <span className="text-[10px] text-slate-400 block">ENTREGA</span>
                      <span className="text-xs md:text-sm font-bold text-emerald-400">{deliveryRate}%</span>
                    </div>
                    <div className="border-l border-slate-800 pl-4">
                      <span className="text-[10px] text-slate-400 block">APERTURA</span>
                      <span className="text-xs md:text-sm font-bold text-sky-400">{readRate}%</span>
                    </div>
                    <div className="border-l border-slate-800 pl-4">
                      <span className="text-[10px] text-slate-400 block">RESPUESTAS</span>
                      <span className="text-xs md:text-sm font-bold text-amber-400">{camp.stats.replied}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {camp.status === 'running' ? (
                      <button
                        onClick={() => onOpenRunner(camp.id)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ver Transmisión</span>
                      </button>
                    ) : camp.status === 'scheduled' ? (
                      <button
                        onClick={() => {
                          startBroadcastExecution(camp.id);
                          onOpenRunner(camp.id);
                        }}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Lanzar Ya</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenRunner(camp.id)}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Detalles y Logs</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
