import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Users, 
  FileCode, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Smartphone, 
  Sliders, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaApiService } from '../../services/metaApiService';
import { MetaTemplate } from '../../types';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSuccess: (campaignId: string) => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onLaunchSuccess,
}) => {
  const { 
    templates, 
    contacts, 
    segments, 
    createCampaign, 
    startBroadcastExecution,
    t 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'tag' | 'segment'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('VIP');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(segments[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  
  // Variable mapping e.g. { "1": "name", "2": "company", "3": "descuento" }
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>({
    '1': 'name',
    '2': 'company',
    '3': 'descuento',
    '4': 'pedido',
  });

  const [sendOption, setSendOption] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [throttleSpeed, setThrottleSpeed] = useState<number>(15);

  if (!isOpen) return null;

  // Selected template object
  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Eligible contacts calculation (excluding opted-out)
  const eligibleContacts = contacts.filter((c) => {
    if (c.status === 'opted_out') return false;
    if (audienceType === 'tag') return c.tags.includes(selectedTag);
    if (audienceType === 'segment') {
      const seg = segments.find((s) => s.id === selectedSegmentId);
      if (seg && seg.criteria.tag) return c.tags.includes(seg.criteria.tag);
    }
    return true;
  });

  const sampleContact = eligibleContacts[0] || contacts[0];
  const previewBody = activeTemplate
    ? MetaApiService.interpolateTemplateBody(activeTemplate.bodyText, variableMapping, sampleContact)
    : '';

  // Get available tags
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)));

  const handleLaunch = async () => {
    if (!title.trim()) return;

    let filterLabel = 'Todos los contactos activos';
    if (audienceType === 'tag') filterLabel = `Etiqueta: ${selectedTag}`;
    if (audienceType === 'segment') {
      const seg = segments.find((s) => s.id === selectedSegmentId);
      filterLabel = `Segmento: ${seg?.name || 'Personalizado'}`;
    }

    const campaign = createCampaign({
      title,
      templateId: activeTemplate.id,
      templateName: activeTemplate.name,
      targetAudience: {
        type: audienceType === 'tag' ? 'custom_tag' : audienceType === 'segment' ? 'segment' : 'all',
        targetId: audienceType === 'tag' ? selectedTag : selectedSegmentId,
        filterLabel,
        totalContacts: eligibleContacts.length,
      },
      variableMapping,
      status: sendOption === 'schedule' ? 'scheduled' : 'draft',
      scheduledFor: sendOption === 'schedule' ? scheduledDateTime : undefined,
      throttleSpeedPerSecond: throttleSpeed,
    });

    if (sendOption === 'now') {
      await startBroadcastExecution(campaign.id);
    }

    onLaunchSuccess(campaign.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {t('create_campaign')}
              </h2>
              <p className="text-[11px] text-slate-400">
                Paso {step} de 3 · Configuración de Envío Masivo Oficial Meta
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

        {/* Stepper Indicator */}
        <div className="px-6 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 py-1 font-medium transition-colors ${
              step === 1 ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Audiencia y Datos</span>
          </button>
          <span className="text-slate-700">──</span>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 py-1 font-medium transition-colors ${
              step === 2 ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Plantilla y Variables</span>
          </button>
          <span className="text-slate-700">──</span>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 py-1 font-medium transition-colors ${
              step === 3 ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Velocidad y Lanzamiento</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: Campaign Name & Audience */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('campaign_name')} *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Liquidación Fin de Mes - Descuento Clientes VIP"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t('target_audience')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setAudienceType('all')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      audienceType === 'all'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">Todos los Contactos</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {contacts.filter((c) => c.status !== 'opted_out').length} contactos disponibles
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudienceType('tag')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      audienceType === 'tag'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">Por Etiqueta Específica</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Filtrar por VIP, Lead, Cliente, etc.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudienceType('segment')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      audienceType === 'segment'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">Segmento Inteligente</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Basado en apertura y respuestas
                    </div>
                  </button>
                </div>
              </div>

              {/* Tag selector */}
              {audienceType === 'tag' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Seleccionar Etiqueta de Audiencia:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedTag === tag
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Segment selector */}
              {audienceType === 'segment' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Seleccionar Segmento Dinámico:
                  </label>
                  <select
                    value={selectedSegmentId}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {segments.map((seg) => (
                      <option key={seg.id} value={seg.id}>
                        {seg.name} ({seg.contactCount} contactos)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Summary of audience */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total destinatarios elegibles:</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono-numbers mt-0.5">
                    {eligibleContacts.length} destinatarios
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>Protección Opt-out Meta: Activa</span>
                  <div className="text-slate-500">Contactos con STOP excluidos automáticamente</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Template Selection & Variable Mapping & Live Preview */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Template & Variable Mapping */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('select_template')}
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} · ({tpl.category} - {tpl.language})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">
                    {t('variable_mapping')}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Asocia cada parámetro de la plantilla oficial con un campo de tu base de contactos:
                  </p>

                  <div className="space-y-3">
                    {activeTemplate.variables.map((varName, idx) => {
                      const paramIndex = String(idx + 1);
                      return (
                        <div key={paramIndex} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                          <span className="font-mono text-emerald-400 shrink-0">
                            {`{{${paramIndex}}}`} ({varName})
                          </span>
                          <select
                            value={variableMapping[paramIndex] || 'name'}
                            onChange={(e) =>
                              setVariableMapping((prev) => ({
                                ...prev,
                                [paramIndex]: e.target.value,
                              }))
                            }
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="name">Nombre del Contacto</option>
                            <option value="dni">DNI / Documento de Identidad</option>
                            <option value="phone">Teléfono WhatsApp</option>
                            <option value="company">Empresa / Negocio</option>
                            <option value="email">Correo Electrónico</option>
                            <option value="descuento">Campo 'descuento' (Custom)</option>
                            <option value="saldo">Campo 'saldo' (Custom)</option>
                            <option value="pedido">Campo 'pedido' (Custom)</option>
                            <option value="ciudad">Campo 'ciudad' (Custom)</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live WhatsApp Mobile Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {t('preview_whatsapp')} (Simulación en Teléfono)
                </label>
                <div className="w-full max-w-sm mx-auto bg-slate-950 border-4 border-slate-800 rounded-3xl p-3 shadow-2xl">
                  {/* Phone Top Notch */}
                  <div className="w-24 h-4 bg-slate-800 mx-auto rounded-full mb-3" />
                  
                  {/* Chat header */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 mb-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                      W
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Tu Empresa Oficial</div>
                      <div className="text-[10px] text-emerald-400">Cuenta de empresa oficial ✓</div>
                    </div>
                  </div>

                  {/* Chat Message Bubble */}
                  <div className="p-3.5 rounded-2xl rounded-tl-none bg-emerald-950/80 border border-emerald-700/50 text-slate-100 text-xs shadow-md space-y-2">
                    {/* Header preview */}
                    {activeTemplate.headerType === 'TEXT' && (
                      <div className="font-bold text-white text-[11px] pb-1 border-b border-emerald-800">
                        {activeTemplate.headerContent}
                      </div>
                    )}
                    {activeTemplate.headerType === 'IMAGE' && (
                      <div className="w-full h-24 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-[10px] text-slate-400">
                        [Encabezado Multimedia Meta Image]
                      </div>
                    )}

                    {/* Body text with live replaced values */}
                    <p className="whitespace-pre-line text-[11px] leading-relaxed text-slate-200">
                      {previewBody}
                    </p>

                    {/* Footer text */}
                    {activeTemplate.footerText && (
                      <p className="text-[9px] text-slate-400 pt-1 border-t border-emerald-900/60">
                        {activeTemplate.footerText}
                      </p>
                    )}

                    <div className="text-[9px] text-slate-400 text-right font-mono-numbers">
                      12:45 PM ✓✓
                    </div>
                  </div>

                  {/* Template Interactive Buttons */}
                  {activeTemplate.buttons.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {activeTemplate.buttons.map((btn, idx) => (
                        <div
                          key={idx}
                          className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 text-center text-[11px] font-semibold text-emerald-400 hover:bg-slate-800 transition-colors shadow-sm"
                        >
                          {btn.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Throttling & Dispatch Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Momento del Envío
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSendOption('now')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      sendOption === 'now'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">{t('send_now')}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Iniciar la transmisión masiva inmediatamente
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSendOption('schedule')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      sendOption === 'schedule'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs">{t('schedule_broadcast')}</div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Programar fecha y hora para envío automático
                    </span>
                  </button>
                </div>
              </div>

              {sendOption === 'schedule' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    {t('scheduled_date')}:
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Sending speed throttling */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {t('sending_speed')}
                  </label>
                  <span className="text-xs font-bold text-emerald-400 font-mono-numbers">
                    {throttleSpeed} mensajes/segundo
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={throttleSpeed}
                  onChange={(e) => setThrottleSpeed(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5 msg/s (Máxima cautela)</span>
                  <span>15-20 msg/s (Recomendado Meta Tier 2)</span>
                  <span>35 msg/s (Alta velocidad)</span>
                </div>
              </div>

              {/* Ready to Launch Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Campaña:</span>
                  <span className="font-semibold text-white">{title || 'Sin título'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destinatarios Totales:</span>
                  <span className="font-mono-numbers font-bold text-emerald-400">{eligibleContacts.length} contactos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plantilla Meta:</span>
                  <span className="font-mono text-slate-200">{activeTemplate.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !title.trim()) {
                  setTitle('Campaña Masiva Oficial ' + new Date().toLocaleDateString());
                }
                setStep((s) => (s + 1) as any);
              }}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              className="px-6 py-2.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
            >
              <Send className="w-4 h-4" />
              <span>{sendOption === 'schedule' ? 'Guardar y Programar' : 'Iniciar Transmisión Masiva'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
