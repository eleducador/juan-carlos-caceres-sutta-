import React, { useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  Tag, 
  CheckCircle2, 
  Ban, 
  Trash2, 
  Sliders, 
  Filter,
  ShieldCheck,
  FileSpreadsheet,
  X,
  FileText,
  AlertCircle,
  FileDown,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { Contact } from '../../types';
import { AudienceSegmentationModal } from './AudienceSegmentationModal';

export const ContactManagement: React.FC = () => {
  const { 
    contacts, 
    addContact, 
    importContacts, 
    deleteContact, 
    clearAllContacts,
    toggleOptOut, 
    segments,
    t 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'opted_out'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // New Single Contact Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDni, setNewDni] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTagsStr, setNewTagsStr] = useState('Cliente');
  const [newDescuento, setNewDescuento] = useState('15');
  const [newSaldo, setNewSaldo] = useState('S/ 0');

  // Excel File Upload & Mapping State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<{
    name: string;
    phone: string;
    dni: string;
  }>({ name: '', phone: '', dni: '' });
  const [importPreview, setImportPreview] = useState<Array<{ name: string; phone: string; dni?: string; extras: string }>>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)));

  const filteredContacts = contacts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (selectedTag !== 'all' && !c.tags.includes(selectedTag)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchDni = c.dni ? c.dni.includes(q) : false;
      const matchCompany = c.company ? c.company.toLowerCase().includes(q) : false;
      if (!matchName && !matchPhone && !matchDni && !matchCompany) return false;
    }
    return true;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addContact({
      name: newName.trim(),
      phone: newPhone.trim(),
      dni: newDni.trim() || undefined,
      company: newCompany.trim() || undefined,
      email: newEmail.trim() || undefined,
      tags: newTagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      customFields: {
        descuento: newDescuento,
        saldo: newSaldo,
      },
      status: 'active',
    });

    setNewName('');
    setNewPhone('');
    setNewDni('');
    setNewCompany('');
    setNewEmail('');
    setShowAddModal(false);
  };

  // Helper function to auto-detect columns matching keywords
  const findMatchingHeader = (headers: string[], regex: RegExp): string => {
    return headers.find((h) => regex.test(h.trim().toLowerCase())) || '';
  };

  // Read Excel / CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Parse rows as array of objects with headers
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rows.length === 0) {
          setImportError('El archivo Excel no contiene filas de datos.');
          return;
        }

        // Get headers from first row keys
        const headers = Object.keys(rows[0]);
        setDetectedHeaders(headers);
        setRawRows(rows);

        // Auto-detect columns specifically for DNI, Celular and Nombre Completo
        const matchedDni = findMatchingHeader(headers, /^(dni|d\.n\.i|documento|cedula|c[eé]dula|identificaci[oó]n|ci|id)/i);
        const matchedPhone = findMatchingHeader(headers, /^(celular|tel[eé]fono|telefono|phone|m[oó]vil|movil|whatsapp|wssp|wsp|n[uú]mero)/i) || headers[1] || '';
        const matchedName = findMatchingHeader(headers, /^(nombre\s*completo|nombres\s*completos|nombre|nombres|name|full\s*name|cliente|contacto)/i) || headers[0] || '';

        const newMap = {
          dni: matchedDni || '',
          phone: matchedPhone,
          name: matchedName,
        };
        setColumnMapping(newMap);
        updatePreview(rows, newMap);
      } catch (err: any) {
        setImportError(`Error al procesar el archivo Excel: ${err.message || 'Formato no soportado'}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  const updatePreview = (rows: any[], mapping: { name: string; phone: string; dni: string }) => {
    const previewList = rows.slice(0, 4).map((row) => {
      const dni = mapping.dni ? String(row[mapping.dni] || '').trim() : undefined;
      const phone = String(row[mapping.phone] || '').trim();
      const name = String(row[mapping.name] || '').trim();
      
      const extras = 'Solo se importarán: DNI, Celular y Nombre Completo';

      return { dni, phone, name, extras };
    });

    setImportPreview(previewList);
  };

  const handleColumnChange = (field: 'name' | 'phone' | 'dni', colName: string) => {
    const updated = { ...columnMapping, [field]: colName };
    setColumnMapping(updated);
    updatePreview(rawRows, updated);
  };

  const handleConfirmImport = () => {
    if (!columnMapping.name || !columnMapping.phone) {
      setImportError('Debes seleccionar las columnas de Nombres Completos y Celular.');
      return;
    }

    const contactsToImport: Omit<Contact, 'id' | 'createdAt' | 'metrics'>[] = [];

    for (const row of rawRows) {
      const name = String(row[columnMapping.name] || '').trim();
      let phone = String(row[columnMapping.phone] || '').trim();
      const dni = columnMapping.dni ? String(row[columnMapping.dni] || '').trim() : undefined;

      // Skip empty records
      if (!name || !phone) continue;

      // Clean phone numbers: remove spaces, dashes, parentheses
      phone = phone.replace(/[^\d+]/g, '');
      if (!phone.startsWith('+')) {
        // If 9 digits (standard mobile in Peru), prefix +51
        if (phone.length === 9) {
          phone = '+51' + phone;
        } else {
          phone = '+' + phone;
        }
      }

      // Only take DNI, Celular, and Nombre Completo
      contactsToImport.push({
        name,
        phone,
        dni: dni || undefined,
        tags: ['Importado Excel'],
        customFields: {
          dni: dni || '',
        },
        status: 'active',
      });
    }

    if (contactsToImport.length > 0) {
      importContacts(contactsToImport);
      setShowImportModal(false);
      setExcelFile(null);
      setRawRows([]);
      setDetectedHeaders([]);
      setImportPreview([]);
    } else {
      setImportError('No se encontraron registros válidos con Nombres Completos y Celular.');
    }
  };

  // Download official manual feeding template (DNI, Celular, Nombre Completo)
  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      {
        'DNI': '45892019',
        'Celular': '+51 984 512 890',
        'Nombre Completo': 'Carlos Alberto Mendoza Morales'
      },
      {
        'DNI': '71029384',
        'Celular': '+51 987 654 321',
        'Nombre Completo': 'Lucía Fernández Ramos'
      },
      {
        'DNI': '10928374',
        'Celular': '+51 991 223 344',
        'Nombre Completo': 'Roberto Carlos Gómez Quispe'
      },
      {
        'DNI': '43981275',
        'Celular': '+51 955 882 110',
        'Nombre Completo': 'María Elena Valdivia Castro'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Give columns nice auto width
    worksheet['!cols'] = [
      { wch: 15 }, // DNI
      { wch: 20 }, // Celular
      { wch: 35 }, // Nombre Completo
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Contactos');
    XLSX.writeFile(workbook, 'Plantilla_Manual_Contactos_WhatsBroadcast.xlsx');
  };

  // Export existing database contacts to a clean, reliable Excel file for manual feeding / editing
  const handleExportExcel = () => {
    const exportData = filteredContacts.map((c) => ({
      'DNI': c.dni || '',
      'Celular': c.phone,
      'Nombre Completo': c.name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData.length > 0 ? exportData : [
      {
        'DNI': '',
        'Celular': '',
        'Nombre Completo': ''
      }
    ]);

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 35 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Base_Contactos');
    XLSX.writeFile(workbook, `Contactos_BaseDatos_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCsv = () => {
    const header = 'DNI,Celular,Nombre Completo\n';
    const rows = filteredContacts.map((c) =>
      `"${c.dni || ''}","${c.phone}","${c.name}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Contactos_WhatsBroadcast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {t('contacts_title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('contacts_subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSegmentModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>{t('segment_audiences')}</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Importar Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors"
            title="Exportar archivo Excel descargable para alimentar la base de datos de manera manual"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar Excel (.xlsx)</span>
          </button>

          {contacts.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
              title="Eliminar todos los contactos registrados de la base de datos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Todos ({contacts.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_contact')}</span>
          </button>
        </div>
      </div>

      {/* Meta Opt-out notice */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t('opt_out_notice')}</span>
        </div>
        <span className="font-mono-numbers text-[11px] text-slate-500 hidden sm:inline">
          {contacts.filter((c) => c.status === 'opted_out').length} contactos en lista de exclusión
        </span>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Status buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({contacts.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'active' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos ({contacts.filter((c) => c.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('opted_out')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'opted_out' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Opt-out STOP ({contacts.filter((c) => c.status === 'opted_out').length})
            </button>
          </div>

          {/* Tag Dropdown */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las etiquetas</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                Etiqueta: {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, DNI, teléfono..."
            className="w-full sm:w-72 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                <th className="py-2.5 px-3">Contacto</th>
                <th className="py-2.5 px-3">DNI / Documento</th>
                <th className="py-2.5 px-3">Teléfono WhatsApp</th>
                <th className="py-2.5 px-3">Empresa</th>
                <th className="py-2.5 px-3">Etiquetas</th>
                <th className="py-2.5 px-3 text-right">Interacción</th>
                <th className="py-2.5 px-3 text-right">Estado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
              {filteredContacts.map((contact) => {
                const openRate = contact.metrics.messagesSent > 0
                  ? ((contact.metrics.messagesRead / contact.metrics.messagesSent) * 100).toFixed(0)
                  : '0';

                return (
                  <tr key={contact.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-3 font-sans font-semibold text-slate-100">
                      <div>{contact.name}</div>
                      {contact.email && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          {contact.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {contact.dni ? (
                        <span className="text-[11px] font-semibold text-sky-400">{contact.dni}</span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-mono text-xs">
                      {contact.phone}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">
                      {contact.company || '—'}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-slate-300 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="text-slate-200">
                        {contact.metrics.messagesRead} / {contact.metrics.messagesSent} ({openRate}%)
                      </div>
                      <div className="text-[10px] text-amber-400">
                        {contact.metrics.messagesReplied} respuestas
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      {contact.status === 'active' ? (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Activo
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          Opt-out (STOP)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleOptOut(contact.id)}
                          className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                          title={contact.status === 'active' ? 'Marcar Opt-out' : 'Reactivar contacto'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                          title="Eliminar contacto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">
                {t('add_contact')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">DNI / Documento</label>
                  <input
                    type="text"
                    value={newDni}
                    onChange={(e) => setNewDni(e.target.value)}
                    placeholder="Ej. 72918234"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Ej. +525512345678"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Empresa / Negocio</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Ej. Ferretería Central"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Etiquetas (Separadas por comas)</label>
                <input
                  type="text"
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                  placeholder="VIP, Cliente Frecuente, Mayorista"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Descuento (%)</label>
                  <input
                    type="text"
                    value={newDescuento}
                    onChange={(e) => setNewDescuento(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Saldo Pendiente</label>
                  <input
                    type="text"
                    value={newSaldo}
                    onChange={(e) => setNewSaldo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  Guardar Contacto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal with Dedicated Column Extraction */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Importación de Contactos desde Excel (.xlsx / .xls / .csv)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Solo se importan las columnas: DNI, Celular y Nombres Completos
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setExcelFile(null);
                  setRawRows([]);
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              {/* Instructions banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Criterio Estricto de Extracción: DNI, Celular y Nombres Completos
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadSampleTemplate}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] inline-flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Descargar Plantilla Excel Base</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  El sistema toma <strong>única y exclusivamente</strong> las columnas de <strong>DNI</strong>, <strong>Celular</strong> y <strong>Nombres Completos</strong> para alimentar la base de datos de manera limpia, rápida y fiable.
                </p>
              </div>

              {/* Upload area */}
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-6 text-center bg-slate-950/40 transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-white mb-1">
                  {excelFile ? excelFile.name : 'Selecciona o arrastra tu archivo Excel'}
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Soporta formatos .XLSX, .XLS y .CSV
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md shadow-emerald-500/10"
                >
                  {excelFile ? 'Cambiar Archivo' : 'Explorar Archivo Excel'}
                </button>
              </div>

              {importError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Detected Headers & Mapping Controls */}
              {detectedHeaders.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Mapeo de Columnas para Base de Datos ({rawRows.length} filas detectadas)
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Columnas detectadas automáticamente
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Columna DNI */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <label className="block text-[11px] font-semibold text-sky-400 mb-1">
                        Columna DNI *
                      </label>
                      <select
                        value={columnMapping.dni}
                        onChange={(e) => handleColumnChange('dni', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Seleccionar --</option>
                        {detectedHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Columna Celular */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                        Columna CELULAR *
                      </label>
                      <select
                        value={columnMapping.phone}
                        onChange={(e) => handleColumnChange('phone', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {detectedHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Columna Nombres Completos */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                        Columna NOMBRES COMPLETOS *
                      </label>
                      <select
                        value={columnMapping.name}
                        onChange={(e) => handleColumnChange('name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {detectedHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Preview of Extracted Data */}
                  <div>
                    <h5 className="text-[11px] font-semibold text-slate-400 mb-2">
                      Vista previa de datos que se guardarán (DNI, Celular y Nombres Completos):
                    </h5>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="text-slate-400 border-b border-slate-800">
                            <th className="pb-1.5 pr-3">DNI</th>
                            <th className="pb-1.5 pr-3">Celular (WhatsApp)</th>
                            <th className="pb-1.5 pr-3">Nombres Completos</th>
                            <th className="pb-1.5">Filtro de Seguridad</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {importPreview.map((item, idx) => (
                            <tr key={idx} className="text-slate-300">
                              <td className="py-2 pr-3 font-mono text-sky-400 font-semibold">
                                {item.dni || <span className="text-slate-500">—</span>}
                              </td>
                              <td className="py-2 pr-3 font-mono text-emerald-400 font-bold">
                                {item.phone || <span className="text-red-400">Falta</span>}
                              </td>
                              <td className="py-2 pr-3 font-semibold text-white">
                                {item.name || <span className="text-red-400">Falta</span>}
                              </td>
                              <td className="py-2 text-[10px] text-emerald-400/90">
                                ✓ Solo DNI, Celular y Nombre
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {rawRows.length > 0 ? `${rawRows.length} contactos detectados en el archivo` : ''}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setExcelFile(null);
                    setRawRows([]);
                    setImportError(null);
                  }}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!excelFile || rawRows.length === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 transition-colors shadow-md shadow-emerald-500/10"
                >
                  Guardar en Base de Datos {rawRows.length > 0 ? `(${rawRows.length})` : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear All Contacts */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl p-6 text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  ¿Eliminar todos los contactos?
                </h3>
                <p className="text-xs text-red-300/90 mt-1 leading-relaxed">
                  Estás a punto de vaciar y eliminar los <strong>{contacts.length} contactos</strong> de la base de datos de audiencia. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">¿Qué sucederá?</p>
              <p>• La lista de contactos quedará en 0 para que puedas subir una base de datos nueva.</p>
              <p>• Podrás volver a importar contactos limpios usando tu archivo Excel en cualquier momento.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllContacts();
                  setShowClearAllModal(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Todos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audience Segmentation Modal */}
      <AudienceSegmentationModal
        isOpen={showSegmentModal}
        onClose={() => setShowSegmentModal(false)}
      />
    </div>
  );
};
