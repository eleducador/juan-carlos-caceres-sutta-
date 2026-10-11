import React, { useState } from 'react';
import { X, Sparkles, Filter, Users, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AudienceSegmentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudienceSegmentationModal: React.FC<AudienceSegmentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { contacts, createSegment, clearAllContacts, t } = useApp();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [minOpenRate, setMinOpenRate] = useState<number>(0);
  const [inactiveDays, setInactiveDays] = useState<number>(0);
  const [onlyReplied, setOnlyReplied] = useState<boolean>(false);

  if (!isOpen) return null;

  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)));

  // Calculate matching contacts in real-time
  const matchedContacts = contacts.filter((c) => {
    if (c.status === 'opted_out') return false;
    if (selectedTag !== 'all' && !c.tags.includes(selectedTag)) return false;
    if (minOpenRate > 0) {
      const rate = c.metrics.messagesSent > 0
        ? (c.metrics.messagesRead / c.metrics.messagesSent) * 100
        : 0;
      if (rate < minOpenRate) return false;
    }
    if (onlyReplied && c.metrics.messagesReplied === 0) return false;
    return true;
  });

  const handleSave = () => {
    if (!name.trim()) return;

    createSegment({
      name,
      description: description || `Segmento dinámico con ${matchedContacts.length} contactos filtrados`,
      criteria: {
        tag: selectedTag !== 'all' ? selectedTag : undefined,
        minOpenRate: minOpenRate > 0 ? minOpenRate : undefined,
        inactiveDays: inactiveDays > 0 ? inactiveDays : undefined,
        hasReplied: onlyReplied ? true : undefined,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t('segment_audiences')}
              </h3>
              <p className="text-[11px] text-slate-400">
                Segmentación por comportamiento de apertura y respuesta
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
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre del Segmento *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Clientes VIP con Alta Respuesta"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descripción o Propósito
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Dirigido a promociones flash de alto ticket"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Filtrar por Etiqueta
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas las etiquetas</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Min Open rate slider */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="font-semibold text-slate-300">
                Tasa Mínima de Apertura (Lectura):
              </label>
              <span className="font-bold text-emerald-400 font-mono-numbers">
                {minOpenRate}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minOpenRate}
              onChange={(e) => setMinOpenRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Only replied toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Solo Contactos que Han Respondido
              </p>
              <p className="text-[11px] text-slate-400">
                Filtra prospectos con al menos 1 mensaje de respuesta previo
              </p>
            </div>
            <input
              type="checkbox"
              checked={onlyReplied}
              onChange={(e) => setOnlyReplied(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </div>

          {/* Live Preview Match Card */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200">
                  Audiencia Coincidente
                </span>
                <p className="text-[11px] text-slate-400">Cumplen con todos los filtros definidos</p>
              </div>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono-numbers">
              {matchedContacts.length} contactos
            </div>
          </div>
        </div>

        {/* Clear All Contacts Confirmation Banner */}
        {showClearConfirm && (
          <div className="p-4 mx-5 mb-2 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>¿Eliminar todos los {contacts.length} contactos de la base de datos?</span>
            </div>
            <p className="text-[11px] text-red-300/80">
              Esta acción vaciará por completo la lista de audiencia y no se puede deshacer.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllContacts();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shadow-sm"
              >
                Sí, vaciar todos los contactos
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <div>
            {contacts.length > 0 && !showClearConfirm && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                title="Vaciar todos los contactos de la audiencia"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Contactos ({contacts.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/10"
            >
              Guardar Segmento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
