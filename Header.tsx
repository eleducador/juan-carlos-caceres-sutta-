import React, { useState } from 'react';
import { 
  Bell, 
  Globe, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  UserCheck, 
  SlidersHorizontal,
  ChevronDown,
  Lock,
  Layers,
  LogOut,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenNotifications,
}) => {
  const { 
    currentUser, 
    isSuperAdmin, 
    switchRole, 
    metaConfig, 
    language, 
    setLanguage, 
    t, 
    alerts,
    logout 
  } = useApp();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: 'ES' },
    { code: 'en', label: 'English', flag: 'US' },
    { code: 'pt', label: 'Português', flag: 'BR' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-4 md:px-8 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-base">
            W
          </div>
          <span>WhatsBroadcast</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20">
            PRO
          </span>
        </a>
      </div>

      {/* Zone 2: Navigation Links for desktop */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        {currentUser.status === 'suspended_unpaid' && !isSuperAdmin ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-xs text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Acceso Temporalmente Restringido · Regulariza tu Pago</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'hover:text-white'}`}
            >
              {t('nav_dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`whitespace-nowrap transition-colors ${activeTab === 'campaigns' ? 'text-emerald-400 font-semibold' : 'hover:text-white'}`}
            >
              {t('nav_campaigns')}
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`whitespace-nowrap transition-colors ${activeTab === 'contacts' ? 'text-emerald-400 font-semibold' : 'hover:text-white'}`}
            >
              {t('nav_contacts')}
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`whitespace-nowrap transition-colors ${activeTab === 'templates' ? 'text-emerald-400 font-semibold' : 'hover:text-white'}`}
            >
              {t('nav_templates')}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap transition-colors ${activeTab === 'analytics' ? 'text-emerald-400 font-semibold' : 'hover:text-white'}`}
            >
              {t('nav_analytics')}
            </button>
          </>
        )}
      </nav>

      {/* Zone 3: Controls & Primary Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Meta API connection badge */}
        <button
          onClick={onOpenSettings}
          title={metaConfig.isConnected ? 'API Oficial Meta Conectada' : 'Configurar Meta API'}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
        >
          {metaConfig.isConnected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline text-slate-200">Meta Cloud API:</span>
              <span className="text-emerald-400 font-mono text-[11px]">{metaConfig.isSandboxMode ? 'Sandbox' : 'Oficial'}</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Conectar Meta</span>
            </>
          )}
        </button>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors"
            aria-label="Seleccionar idioma"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase">{language}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                    language === l.code ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{l.label}</span>
                  <span className="text-[10px] text-slate-400">{l.flag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          aria-label="Ver notificaciones de facturación"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </button>

        {/* Role & Account Selector (Switch between Super Admin and Tenant) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isSuperAdmin
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isSuperAdmin ? (
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            ) : (
              <div className="w-4 h-4 rounded bg-emerald-500/30 flex items-center justify-center text-[10px] text-emerald-300 font-bold">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="leading-tight text-[11px] font-semibold truncate max-w-[110px]">
                {currentUser.companyName}
              </span>
              <span className="text-[9px] text-slate-400">
                {isSuperAdmin ? 'Super Admin' : 'Cuenta Cliente'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Estado: {currentUser.status === 'suspended_unpaid' ? 'Bloqueado por Mora' : 'Activo'}</span>
                </div>
              </div>

              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2 py-1">
                Mi Cuenta
              </p>

              <button
                onClick={() => {
                  onOpenSettings();
                  setShowRoleMenu(false);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 mb-2 bg-slate-800/80 hover:bg-slate-800 text-emerald-400 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Editar Mi Perfil & Clave</span>
              </button>

              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2 py-1 border-t border-slate-800/80 pt-1.5">
                Cambiar Modo / Rol
              </p>

              <button
                onClick={() => {
                  switchRole('business_owner');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between mb-1 ${
                  !isSuperAdmin ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Moda Latina (Cliente)</span>
                </div>
                {!isSuperAdmin && <span className="text-[10px] text-emerald-400">Activo</span>}
              </button>

              <button
                onClick={() => {
                  switchRole('super_admin');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between ${
                  isSuperAdmin ? 'bg-amber-500/10 text-amber-300' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Super Admin Global</span>
                </div>
                {isSuperAdmin && <span className="text-[10px] text-amber-400">Activo</span>}
              </button>

              <div className="pt-1 mt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
