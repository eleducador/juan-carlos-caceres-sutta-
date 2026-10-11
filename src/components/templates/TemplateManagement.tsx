import React, { useState } from 'react';
import { 
  FileCode, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Tag, 
  Smartphone,
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaTemplate } from '../../types';
import { NewTemplateModal } from './NewTemplateModal';

export const TemplateManagement: React.FC = () => {
  const { templates, syncMetaTemplates, t } = useApp();

  const [showNewModal, setShowNewModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedPreviewTemplate, setSelectedPreviewTemplate] = useState<MetaTemplate | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncMetaTemplates();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {t('templates_title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('templates_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : t('sync_meta')}</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{t('create_template')}</span>
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between text-left space-y-4"
          >
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">
                    {tpl.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{tpl.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase">{tpl.language}</span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  {tpl.status}
                </span>
              </div>

              {/* Template Body Snippet */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans line-clamp-4">
                {tpl.bodyText}
              </div>

              {/* Buttons and Variables summary */}
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {tpl.variables.length} Variables ({tpl.variables.join(', ')})
                </span>
                {tpl.headerType !== 'NONE' && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Cabecera: {tpl.headerType}
                  </span>
                )}
                {tpl.buttons.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400">
                    {tpl.buttons.length} Botones interactivos
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono-numbers">
                Actualizado: {tpl.updatedAt}
              </span>
              <button
                onClick={() => setSelectedPreviewTemplate(tpl)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vista Previa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal New Template */}
      <NewTemplateModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
      />

      {/* Template Detail Preview Modal */}
      {selectedPreviewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-bold text-white font-mono truncate">
                {selectedPreviewTemplate.name}
              </h3>
              <button
                onClick={() => setSelectedPreviewTemplate(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* WhatsApp bubble */}
            <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-700/50 text-slate-100 text-xs shadow-md space-y-2">
              <p className="whitespace-pre-line leading-relaxed">
                {selectedPreviewTemplate.bodyText}
              </p>
              {selectedPreviewTemplate.footerText && (
                <p className="text-[10px] text-slate-400 pt-1 border-t border-emerald-900">
                  {selectedPreviewTemplate.footerText}
                </p>
              )}
            </div>

            {selectedPreviewTemplate.buttons.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedPreviewTemplate.buttons.map((b, i) => (
                  <div
                    key={i}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 text-center text-xs font-semibold text-emerald-400"
                  >
                    {b.text}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setSelectedPreviewTemplate(null)}
              className="mt-4 w-full py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
            >
              Cerrar Vista Previa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
