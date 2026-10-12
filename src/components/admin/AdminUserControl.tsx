import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Ban, 
  CheckCircle2, 
  Clock, 
  Search, 
  DollarSign, 
  Users, 
  Calendar,
  AlertTriangle,
  SlidersHorizontal,
  CreditCard,
  UserPlus,
  Trash2,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserTenant } from '../../types';
import { CreateUserModal } from './CreateUserModal';
import { PaymentMethodsSettings } from './PaymentMethodsSettings';

export const AdminUserControl: React.FC = () => {
  const { 
    usersList, 
    deleteUser,
    blockUserByAdmin, 
    unblockUserByAdmin, 
    extendGracePeriod, 
    extendUserDuration,
    getDaysRemaining,
    updateUserQuota,
    updateUserRole,
    yapePlinReceipts,
    t 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'payments'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserForQuota, setSelectedUserForQuota] = useState<UserTenant | null>(null);
  const [newQuotaValue, setNewQuotaValue] = useState<number>(10000);

  const pendingReceiptsCount = yapePlinReceipts.filter((r) => r.status === 'pending_review').length;

  const filteredUsers = usersList.filter((u) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.companyName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalClients = usersList.filter((u) => u.role !== 'super_admin').length;
  const blockedCount = usersList.filter((u) => u.status === 'suspended_unpaid').length;
  const totalDebt = usersList.reduce((acc, u) => acc + (u.unpaidBalance || 0), 0);

  const handleSaveQuota = () => {
    if (selectedUserForQuota) {
      updateUserQuota(selectedUserForQuota.id, newQuotaValue);
      setSelectedUserForQuota(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {t('admin_title')}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold uppercase">
              Super Admin Activo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestión comercial de clientes, venta de usuarios, control de bloqueos por mora y cuentas Yape / Plin
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Nuevo Cliente</span>
        </button>
      </div>

      {/* Admin Top Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeSubTab === 'users'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes y Bloqueos por Falta de Pago ({totalClients})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors relative ${
            activeSubTab === 'payments'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-purple-400" />
          <span>Publicación Yape / Plin y Costos de Planes</span>
          {pendingReceiptsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {activeSubTab === 'payments' ? (
        <PaymentMethodsSettings />
      ) : (
        <>
          {/* Pending receipts alert banner */}
          {pendingReceiptsCount > 0 && (
            <div 
              onClick={() => setActiveSubTab('payments')}
              className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-all text-xs text-amber-200"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>
                  Hay <strong>{pendingReceiptsCount} pago(s) de Yape / Plin</strong> esperando validación en tu cuenta personal para dar de alta a los clientes.
                </span>
              </div>
              <span className="font-bold text-amber-300 hover:text-white flex items-center gap-1 text-[11px]">
                Validar y Dar de Alta →
              </span>
            </div>
          )}

          {/* Admin Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-numbers">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <span className="text-xs text-slate-400 font-sans block">Clientes Totales en Plataforma</span>
              <div className="text-2xl font-bold text-white mt-1">
                {totalClients}
              </div>
              <span className="text-[11px] text-slate-400 font-sans block mt-1">
                Cuentas SaaS activas o en prueba
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <span className="text-xs text-slate-400 font-sans block">Cuentas Bloqueadas por Mora</span>
              <div className="text-2xl font-bold text-red-400 mt-1">
                {blockedCount}
              </div>
              <span className="text-[11px] text-red-300 font-sans block mt-1">
                Envío masivo pausado por falta de pago
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left">
              <span className="text-xs text-slate-400 font-sans block">Saldo Pendiente de Cobro Total</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                S/ {totalDebt.toFixed(2)}
              </div>
              <span className="text-[11px] text-slate-400 font-sans block mt-1">
                Recaudable vía Yape o Plin en Soles
              </span>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('filter_tenants')}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                    <th className="py-2.5 px-3">Empresa / Cliente</th>
                    <th className="py-2.5 px-3">Credenciales</th>
                    <th className="py-2.5 px-3">Plan</th>
                    <th className="py-2.5 px-3">Consumo de Cuota</th>
                    <th className="py-2.5 px-3">Estado de Acceso</th>
                    <th className="py-2.5 px-3">Saldo Deudor</th>
                    <th className="py-2.5 px-3">Vencimiento</th>
                    <th className="py-2.5 px-3 text-right">Control de Administrador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-numbers">
                  {filteredUsers.map((user) => {
                    const isBlocked = user.status === 'suspended_unpaid';
                    const isGrace = user.status === 'overdue_grace';
                    const quotaPercent = Math.min(100, Math.round((user.quotaUsed / (user.quotaLimit || 1)) * 100));

                    return (
                      <tr key={user.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3 px-3 font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">{user.companyName}</span>
                            {user.role === 'super_admin' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                👑 Super Admin
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                Cliente
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            {user.name} · {user.phone}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                          <div className="font-bold text-emerald-400">👤 {user.username || user.email.split('@')[0]}</div>
                          <div className="text-[10px] text-slate-400">🔑 Clave: <span className="text-white font-bold">{user.password || 'user123'}</span></div>
                          {user.email && !user.email.endsWith('@cliente.local') && (
                            <div className="text-[10px] text-slate-500 font-sans">{user.email}</div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {user.planId === '1_month' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                              Plan 1 Mes (30d)
                            </span>
                          ) : user.planId === '2_months' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              Plan 2 Meses (60d)
                            </span>
                          ) : user.planId === '4_months' ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              Plan 4 Meses (120d)
                            </span>
                          ) : (
                            <span className="uppercase text-[11px] font-semibold text-slate-300">
                              {user.planId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-200">
                            {user.quotaUsed.toLocaleString()} / {user.quotaLimit.toLocaleString()} ({quotaPercent}%)
                          </div>
                          <div className="w-24 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full ${quotaPercent > 90 ? 'bg-red-500' : 'bg-emerald-400'}`}
                              style={{ width: `${quotaPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 font-sans">
                          {isBlocked ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              Bloqueado (Mora)
                            </span>
                          ) : isGrace ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              Plazo de Gracia
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Activo / Alta
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {user.unpaidBalance > 0 ? (
                            <span className="font-bold text-red-400">
                              S/ {user.unpaidBalance.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400">Al día (S/ 0.00)</span>
                          )}
                        </td>
                        {/* CONTÓMETRO DE SUSCRIPCIÓN */}
                        <td className="py-3 px-3 text-[11px]">
                          <div className="text-white font-mono text-xs">{user.dueDate}</div>
                          {(() => {
                            const days = getDaysRemaining(user.dueDate);
                            if (days > 7) {
                              return (
                                <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                  <span>⏳</span> Quedan {days} días
                                </div>
                              );
                            } else if (days > 0) {
                              return (
                                <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                                  <span>⚠️</span> Vence en {days} días
                                </div>
                              );
                            } else if (days === 0) {
                              return (
                                <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-red-500/25 text-red-300 border border-red-500/50 text-[10px] font-extrabold">
                                  <span>🚨</span> ¡VENCE HOY!
                                </div>
                              );
                            } else {
                              return (
                                <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-500/30 text-[10px] font-bold">
                                  <span>⛔</span> Vencido hace {Math.abs(days)} días
                                </div>
                              );
                            }
                          })()}
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Role management */}
                            {user.email === 'jcsutta2@gmail.com' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                                Dueño Principal
                              </span>
                            ) : user.role === 'super_admin' ? (
                              <button
                                onClick={() => updateUserRole(user.id, 'business_owner')}
                                className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors"
                                title="Cambiar a cuenta de Cliente (Quitar acceso a pestaña Super Admin)"
                              >
                                Quitar Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => updateUserRole(user.id, 'super_admin')}
                                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 transition-colors"
                                title="Promover a Super Administrador (Tendrá acceso a la pestaña de Super Usuario)"
                              >
                                👑 Hacer Super Admin
                              </button>
                            )}

                            {user.role !== 'super_admin' && (
                              <>
                                {/* Quick Time Extension Buttons: 1M, 2M, 4M */}
                                <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-950 text-[10px]">
                                  <button
                                    onClick={() => extendUserDuration(user.id, 1)}
                                    className="px-1.5 py-0.5 hover:bg-slate-800 text-slate-300 font-bold transition-colors"
                                    title="Renovar por 1 Mes (+30 días)"
                                  >
                                    +1M
                                  </button>
                                  <span className="text-slate-700">|</span>
                                  <button
                                    onClick={() => extendUserDuration(user.id, 2)}
                                    className="px-1.5 py-0.5 hover:bg-slate-800 text-emerald-400 font-bold transition-colors"
                                    title="Renovar por 2 Meses (+60 días)"
                                  >
                                    +2M
                                  </button>
                                  <span className="text-slate-700">|</span>
                                  <button
                                    onClick={() => extendUserDuration(user.id, 4)}
                                    className="px-1.5 py-0.5 hover:bg-slate-800 text-purple-400 font-bold transition-colors"
                                    title="Renovar por 4 Meses (+120 días)"
                                  >
                                    +4M
                                  </button>
                                </div>

                                {isBlocked ? (
                                  <button
                                    onClick={() => unblockUserByAdmin(user.id)}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                                    title="Dar de alta / Desbloquear cuenta"
                                  >
                                    Dar de Alta
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => blockUserByAdmin(user.id)}
                                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                    title="Bloquear cuenta por falta de pago"
                                  >
                                    Bloquear
                                  </button>
                                )}

                                <button
                                  onClick={() => extendGracePeriod(user.id)}
                                  className="p-1 rounded text-slate-400 hover:text-amber-400 transition-colors"
                                  title="Extender 7 días de gracia"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedUserForQuota(user);
                                    setNewQuotaValue(user.quotaLimit);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                                  title="Modificar límite de cuota"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {user.email !== 'jcsutta2@gmail.com' && (
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors"
                                title="Eliminar cuenta de cliente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Quota modifier modal */}
      {selectedUserForQuota && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Modificar Cuota de Mensajes
            </h3>
            <p className="text-xs text-slate-400">
              Ajusta el límite mensual de envío para <strong>{selectedUserForQuota.companyName}</strong>:
            </p>

            <input
              type="number"
              value={newQuotaValue}
              onChange={(e) => setNewQuotaValue(Number(e.target.value))}
              step={1000}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono-numbers focus:outline-none focus:border-emerald-500 text-sm"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForQuota(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg"
              >
                Guardar Cuota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
