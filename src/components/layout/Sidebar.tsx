import React from 'react';
import {
  LayoutDashboard,
  Send,
  Users,
  FileCode,
  BarChart3,
  CreditCard,
  ShieldCheck,
  Settings,
  Zap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  const { t, isSuperAdmin, currentUser } = useApp();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'campaigns', label: t('nav_campaigns'), icon: Send },
    { id: 'contacts', label: t('nav_contacts'), icon: Users },
    { id: 'templates', label: t('nav_templates'), icon: FileCode },
    { id: 'analytics', label: t('nav_analytics'), icon: BarChart3 },
    { id: 'billing', label: t('nav_billing'), icon: CreditCard },
  ];

  if (isSuperAdmin) {
    navItems.push({ id: 'admin', label: t('nav_admin'), icon: ShieldCheck });
  }

  const quotaPercentage = Math.min(
    100,
    Math.round((currentUser.quotaUsed / (currentUser.quotaLimit || 1)) * 100)
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 select-none">
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Navigation links */}
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Navegación Principal
              </p>
              {currentUser.status === 'suspended_unpaid' && !isSuperAdmin ? (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span>Acceso Restringido</span>
                  </div>
                  <p className="text-[10px] text-red-300/80 leading-tight">
                    Módulos inhabilitados por vencimiento de suscripción.
                  </p>
                </div>
              ) : (
                navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Meta Cloud API Direct Settings link */}
            <div>
              <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                Conectividad Meta
              </p>
              <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span className="truncate">{t('nav_settings')}</span>
              </button>
            </div>
          </div>

          {/* Account Plan & Quota Card */}
          <div className="pt-4 border-t border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-200">
                  Plan {currentUser.planId.toUpperCase()}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono-numbers font-medium">
                  {quotaPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quotaPercentage > 85
                      ? 'bg-amber-400'
                      : quotaPercentage >= 100
                      ? 'bg-red-500'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${quotaPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-numbers">
                <span>{currentUser.quotaUsed.toLocaleString()} enviados</span>
                <span>/ {currentUser.quotaLimit.toLocaleString()}</span>
              </div>

              <button
                onClick={() => setActiveTab('billing')}
                className="mt-2.5 w-full py-1 text-center text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-md border border-slate-700/60 transition-colors"
              >
                Gestionar Cuota o Plan
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (touch-friendly for handheld phones) */}
      {currentUser.status !== 'suspended_unpaid' || isSuperAdmin ? (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Panel</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'campaigns' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Envíos</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'contacts' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Contactos</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'templates' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-5 h-5" />
            <span>Plantillas</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'billing' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Planes</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
                activeTab === 'admin' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Admin</span>
            </button>
          )}
        </nav>
      ) : null}
    </>
  );
};
