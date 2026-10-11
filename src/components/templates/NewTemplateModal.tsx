import React, { useState } from 'react';
import { 
  X, 
  FileCode, 
  Plus, 
  Trash2, 
  Smartphone, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaTemplate, TemplateCategory } from '../../types';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addTemplate, t } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('MARKETING');
  const [language, setLanguage] = useState('es');
  const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT'>('NONE');
  const [headerContent, setHeaderContent] = useState('');
  const [bodyText, setBodyText] = useState(
    'Hola {{1}}, te compartimos una oferta especial para tu empresa {{2}} válida hoy.'
  );
  const [footerText, setFooterText] = useState('Responde STOP para darte de baja.');
  const [buttons, setButtons] = useState<Array<{ type: 'QUICK_REPLY' | 'URL'; text: string; url?: string }>>([
    { type: 'QUICK_REPLY', text: 'Me interesa' },
    { type: 'QUICK_REPLY', text: 'Hablar con Asesor' },
  ]);

  if (!isOpen) return null;

  const handleAddButton = () => {
    if (buttons.length >= 3) return;
    setButtons([...buttons, { type: 'QUICK_REPLY', text: 'Más Información' }]);
  };

  const handleRemoveButton = (idx: number) => {
    setButtons(buttons.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim() || !bodyText.trim()) return;

    // Detect variables {{1}}, {{2}} in body
    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const vars = matches.map((m) => m.replace(/[\{\}]/g, ''));

    addTemplate({
      metaTemplateId: `meta_${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: name.toLowerCase().replace(/\s+/g, '_'),
      category,
      language,
      status: 'APPROVED', // Simulating official approval
      headerType,
      headerContent: headerType !== 'NONE' ? headerContent : undefined,
      bodyText,
      footerText: footerText || undefined,
      buttons,
      variables: vars.length > 0 ? vars : ['1'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t('create_template')}
              </h3>
              <p className="text-[11px] text-slate-400">
                Diseñador de Plantillas Oficiales de WhatsApp Business Cloud API
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

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Template Details */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nombre de la Plantilla (Identificador Meta) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: promo_navidad_2026"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Solo minúsculas y guiones bajos (formato oficial de Meta).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Categoría Meta
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MARKETING">MARKETING</option>
                  <option value="UTILITY">UTILIDAD (Operacional)</option>
                  <option value="AUTHENTICATION">AUTENTICACIÓN (OTP)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Idioma
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="es">Español (es)</option>
                  <option value="en">Inglés (en_US)</option>
                  <option value="pt">Portugués (pt_BR)</option>
                </select>
              </div>
            </div>

            {/* Header Type */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Encabezado Multimedia (Opcional)
              </label>
              <select
                value={headerType}
                onChange={(e) => setHeaderType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="NONE">Sin Encabezado</option>
                <option value="TEXT">Texto Destacado</option>
                <option value="IMAGE">Imagen (Banner)</option>
                <option value="DOCUMENT">Documento PDF</option>
              </select>

              {headerType === 'TEXT' && (
                <input
                  type="text"
                  value={headerContent}
                  onChange={(e) => setHeaderContent(e.target.value)}
                  placeholder="Texto del encabezado..."
                  className="w-full mt-2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  Cuerpo del Mensaje (Soporta variables {'{{1}}'}, {'{{2}}'}) *
                </label>
                <button
                  type="button"
                  onClick={() => setBodyText((prev) => `${prev} {{${(prev.match(/\{\{(\d+)\}\}/g) || []).length + 1}}}`)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px]"
                >
                  + Insertar Variable
                </button>
              </div>
              <textarea
                rows={4}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
              />
            </div>

            {/* Footer */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Pie de Página (Texto secundario / Opt-out)
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-300 font-semibold">
                  Botones Interactivos (Hasta 3)
                </label>
                {buttons.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddButton}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold"
                  >
                    + Añadir Botón
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {buttons.map((btn, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={btn.text}
                      onChange={(e) => {
                        const next = [...buttons];
                        next[idx].text = e.target.value;
                        setButtons(next);
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Real-time WhatsApp Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Vista Previa en Tiempo Real en WhatsApp
            </label>
            <div className="w-full max-w-sm mx-auto bg-slate-950 border-4 border-slate-800 rounded-3xl p-3 shadow-2xl">
              <div className="w-24 h-4 bg-slate-800 mx-auto rounded-full mb-3" />
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800 mb-3">
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                  W
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Empresa Oficial Meta</div>
                  <div className="text-[10px] text-emerald-400">Verificado Oficial ✓</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl rounded-tl-none bg-emerald-950/80 border border-emerald-700/50 text-slate-100 text-xs shadow-md space-y-2">
                {headerType === 'TEXT' && (
                  <div className="font-bold text-white text-[11px] pb-1 border-b border-emerald-800">
                    {headerContent || '[Encabezado de texto]'}
                  </div>
                )}
                {headerType === 'IMAGE' && (
                  <div className="w-full h-24 bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center text-[10px] text-slate-400">
                    [Banner Imagen Meta]
                  </div>
                )}

                <p className="whitespace-pre-line text-[11px] leading-relaxed text-slate-200">
                  {bodyText
                    .replace(/\{\{1\}\}/g, 'Carlos')
                    .replace(/\{\{2\}\}/g, 'Moda Latina')
                    .replace(/\{\{3\}\}/g, '25%')}
                </p>

                {footerText && (
                  <p className="text-[9px] text-slate-400 pt-1 border-t border-emerald-900/60">
                    {footerText}
                  </p>
                )}

                <div className="text-[9px] text-slate-400 text-right font-mono-numbers">
                  12:45 PM ✓✓
                </div>
              </div>

              {buttons.length > 0 && (
                <div className="mt-2 space-y-1">
                  {buttons.map((btn, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 text-center text-[11px] font-semibold text-emerald-400"
                    >
                      {btn.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            disabled={!name.trim() || !bodyText.trim()}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/10"
          >
            Registrar Plantilla Oficial
          </button>
        </div>
      </div>
    </div>
  );
};
