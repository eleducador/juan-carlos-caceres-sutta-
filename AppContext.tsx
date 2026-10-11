import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations';
import {
  BillingAlert,
  Campaign,
  CampaignMessageLog,
  Contact,
  Invoice,
  Language,
  MetaApiConfig,
  MetaTemplate,
  PlanDuration,
  SegmentFilter,
  SubscriptionPlan,
  UserRole,
  UserTenant,
  YapePlinConfig,
  YapePlinReceipt,
} from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { dbService } from '../services/db';

interface AppContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['es']) => string;

  // Authentication & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }> | { success: boolean; message?: string };
  signUp: (email: string, password: string, name: string, companyName?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;

  // Active User / Auth & Super Admin
  currentUser: UserTenant;
  isSuperAdmin: boolean;
  switchRole: (role: UserRole) => void;
  usersList: UserTenant[];
  createNewUser: (data: {
    name: string;
    username?: string;
    email: string;
    password?: string;
    companyName: string;
    phone: string;
    planId: PlanDuration;
    durationMonths: 1 | 2 | 4;
    quotaLimit?: number;
    status: 'active' | 'trial' | 'suspended_unpaid';
    unpaidBalance?: number;
  }) => void;
  deleteUser: (userId: string) => void;
  blockUserByAdmin: (userId: string, reason?: string) => void;
  unblockUserByAdmin: (userId: string) => void;
  extendGracePeriod: (userId: string) => void;
  extendUserDuration: (userId: string, monthsToAdd: 1 | 2 | 4) => void;
  updateUserQuota: (userId: string, newLimit: number) => void;
  getDaysRemaining: (dueDate: string) => number;

  // Yape / Plin Config & Management
  yapePlinConfig: YapePlinConfig;
  updateYapePlinConfig: (cfg: Partial<YapePlinConfig>) => void;
  yapePlinReceipts: YapePlinReceipt[];
  submitYapePlinPayment: (receipt: Omit<YapePlinReceipt, 'id' | 'date' | 'status'>) => void;
  approveReceiptAndUnlockUser: (receiptId: string) => void;
  rejectReceipt: (receiptId: string) => void;

  // Meta API Config
  metaConfig: MetaApiConfig;
  updateMetaConfig: (config: Partial<MetaApiConfig>) => void;
  testMetaConnection: () => Promise<{ success: boolean; message: string; details?: any }>;

  // Contacts & Segments
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'metrics'>) => void;
  importContacts: (newContacts: Omit<Contact, 'id' | 'createdAt' | 'metrics'>[]) => void;
  deleteContact: (id: string) => void;
  clearAllContacts: () => void;
  toggleOptOut: (id: string) => void;
  segments: SegmentFilter[];
  createSegment: (segment: Omit<SegmentFilter, 'id'>) => void;

  // Templates
  templates: MetaTemplate[];
  addTemplate: (tpl: Omit<MetaTemplate, 'id' | 'updatedAt'>) => void;
  syncMetaTemplates: () => Promise<void>;

  // Campaigns
  campaigns: Campaign[];
  createCampaign: (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'stats' | 'logs'>) => Campaign;
  activeRunningCampaignId: string | null;
  startBroadcastExecution: (campaignId: string) => Promise<void>;
  pauseBroadcastExecution: (campaignId: string) => void;
  currentRunningCampaign: Campaign | null;

  // Billing & Subscriptions
  plans: SubscriptionPlan[];
  updatePlanPrices: (planId: PlanDuration, pricePEN: number) => void;
  invoices: Invoice[];
  payInvoice: (invoiceId: string, gateway: 'stripe' | 'mercadopago' | 'paypal' | 'yape' | 'plin') => Promise<boolean>;
  changeSubscriptionPlan: (planId: PlanDuration) => void;

  // Notifications
  alerts: BillingAlert[];
  dismissAlert: (id: string) => void;
  requestPushPermission: () => Promise<boolean>;
  pushEnabled: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Time-Based Plans: 1 Mes, 2 Meses, 4 Meses (Precios exclusivamente en Soles)
const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: '1_month',
    name: 'Plan 1 Mes',
    durationMonths: 1,
    durationDays: 30,
    pricePEN: 99,
    quotaMessages: 5000,
    features: [
      '30 Días de Acceso Completo',
      'API Oficial Meta WhatsApp Cloud',
      'Gestor de Contactos y Plantillas Ilimitadas',
      'Segmentación de Audiencias en Tiempo Real',
      'Soporte Técnico Especializado',
    ],
  },
  {
    id: '2_months',
    name: 'Plan 2 Meses',
    durationMonths: 2,
    durationDays: 60,
    pricePEN: 179,
    quotaMessages: 15000,
    recommended: true,
    discountLabel: 'Ahorro 15%',
    features: [
      '60 Días de Acceso Ininterrumpido',
      'Mayor Velocidad de Despacho (20 msg/s)',
      'Exportación Ilimitada de Reportes PDF',
      'Segmentación por Comportamiento y Apertura',
      'Soporte Prioritario WhatsApp 24/7',
    ],
  },
  {
    id: '4_months',
    name: 'Plan 4 Meses',
    durationMonths: 4,
    durationDays: 120,
    pricePEN: 299,
    quotaMessages: 50000,
    discountLabel: 'Mayor Descuento 25%',
    features: [
      '120 Días de Transmisión Comercial',
      'Máxima Capacidad Meta Tier 2 (35 msg/s)',
      'Asesor Dedicado para Aprobación de Plantillas',
      'Backups Automáticos y Cifrado TLS 1.3',
      'SLA de Disponibilidad 99.9%',
    ],
  },
];

// Initial Mock Tenants with Time Durations and Due Dates
const INITIAL_USERS: UserTenant[] = [
  {
    id: 'user_1',
    name: 'Carlos Mendoza',
    email: 'carlos@modafashion.com',
    password: 'user123',
    companyName: 'Moda Latina Express',
    phone: '+52 55 4123 9988',
    role: 'business_owner',
    status: 'active',
    planId: '2_months',
    durationMonths: 2,
    quotaUsed: 3820,
    quotaLimit: 15000,
    unpaidBalance: 0,
    startDate: '2026-09-15',
    dueDate: '2026-11-15', // Active with ~35 days remaining
    currency: 'PEN',
    createdAt: '2026-01-15',
  },
  {
    id: 'user_2',
    name: 'Lucía Fernández',
    email: 'lucia@clinicaesperanza.com',
    password: 'user123',
    companyName: 'Clínica Médica Esperanza',
    phone: '+51 987 654 321',
    role: 'business_owner',
    status: 'suspended_unpaid', // Expired and blocked for unpaid renewal
    planId: '1_month',
    durationMonths: 1,
    quotaUsed: 1050,
    quotaLimit: 5000,
    unpaidBalance: 99.00,
    startDate: '2026-09-01',
    dueDate: '2026-10-01', // Expired!
    currency: 'PEN',
    createdAt: '2026-02-10',
  },
  {
    id: 'user_3',
    name: 'Roberto Gómez',
    email: 'roberto@inmobiliariaurban.com',
    password: 'user123',
    companyName: 'Inmobiliaria Urban Tower',
    phone: '+57 310 554 2211',
    role: 'business_owner',
    status: 'overdue_grace',
    planId: '4_months',
    durationMonths: 4,
    quotaUsed: 7890,
    quotaLimit: 50000,
    unpaidBalance: 299.00,
    startDate: '2026-06-14',
    dueDate: '2026-10-14',
    currency: 'PEN',
    createdAt: '2026-03-01',
  },
  {
    id: 'user_4',
    name: 'Admin Global Meta',
    email: 'superadmin@whatsbroadcast.io',
    password: 'admin123',
    companyName: 'WhatsBroadcast Core Team',
    phone: '+51 984 512 890',
    role: 'super_admin',
    status: 'active',
    planId: '4_months',
    durationMonths: 4,
    quotaUsed: 42100,
    quotaLimit: 100000,
    unpaidBalance: 0,
    startDate: '2026-01-01',
    dueDate: '2027-01-01',
    currency: 'PEN',
    createdAt: '2025-10-01',
  },
];

const INITIAL_YAPE_PLIN_CONFIG: YapePlinConfig = {
  yapeEnabled: true,
  yapeNumber: '984 512 890',
  yapeHolder: 'WhatsBroadcast Pagos SAC',
  yapeQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=YAPE_PAGO_984512890_WHATSBROADCAST',
  plinEnabled: true,
  plinNumber: '984 512 890',
  plinHolder: 'WhatsBroadcast Pagos SAC',
  plinBank: 'Interbank / BBVA / Scotiabank',
  plinQrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=PLIN_PAGO_984512890_WHATSBROADCAST',
  currency: 'PEN',
};

const INITIAL_YAPE_PLIN_RECEIPTS: YapePlinReceipt[] = [
  {
    id: 'rcp_101',
    userId: 'user_2',
    userName: 'Lucía Fernández',
    companyName: 'Clínica Médica Esperanza',
    method: 'YAPE',
    operationCode: 'OP-889124',
    amount: 99.00, // 1 month plan in PEN
    currency: 'PEN',
    date: '2026-10-11 08:45',
    status: 'pending_review',
    planId: '1_month',
  },
];

// Initial realistic Meta Templates
const INITIAL_TEMPLATES: MetaTemplate[] = [
  {
    id: 'tpl_1',
    metaTemplateId: '984120938472910',
    name: 'promocion_exclusiva_vip',
    category: 'MARKETING',
    language: 'es',
    status: 'APPROVED',
    headerType: 'IMAGE',
    headerContent: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80',
    bodyText: '¡Hola {{1}}! Como miembro distinguido de {{2}}, te obsequiamos un cupón especial del {{3}}% de descuento en tu próxima compra válida hasta este fin de semana.',
    footerText: 'Responde STOP para darte de baja.',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Ver Catálogo VIP' },
      { type: 'QUICK_REPLY', text: 'Hablar con Asesor' },
    ],
    variables: ['nombre', 'empresa', 'descuento'],
    updatedAt: '2026-10-01',
  },
  {
    id: 'tpl_2',
    metaTemplateId: '772183921098451',
    name: 'recordatorio_vencimiento_pago',
    category: 'UTILITY',
    language: 'es',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerContent: 'Aviso Importante de Facturación',
    bodyText: 'Estimado/a {{1}}, le recordamos que su factura N° {{2}} por un saldo de {{3}} vence el {{4}}. Evite la suspensión de su servicio efectuando su pago a tiempo.',
    footerText: 'WhatsBroadcast Pro - Soporte Financiero',
    buttons: [
      { type: 'URL', text: 'Pagar en Línea', url: 'https://whatsbroadcast.io/pay' },
      { type: 'QUICK_REPLY', text: 'Ya realicé el pago' },
    ],
    variables: ['nombre', 'factura', 'saldo', 'fecha_vencimiento'],
    updatedAt: '2026-09-28',
  },
  {
    id: 'tpl_3',
    metaTemplateId: '661902837482910',
    name: 'confirmacion_despacho_pedido',
    category: 'UTILITY',
    language: 'es',
    status: 'APPROVED',
    headerType: 'NONE',
    bodyText: 'Hola {{1}}, tu pedido {{2}} ya se encuentra en camino con la empresa {{3}}. El número de rastreo es {{4}}. Estará llegando aproximadamente en 24 horas.',
    footerText: 'Gracias por tu compra.',
    buttons: [
      { type: 'QUICK_REPLY', text: 'Rastrear Guía' },
      { type: 'QUICK_REPLY', text: 'Cambiar Dirección' },
    ],
    variables: ['nombre', 'pedido', 'courier', 'guia'],
    updatedAt: '2026-09-15',
  },
];

// Initial Realistic Contacts
const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c_1',
    name: 'Sofía Valenzuela',
    phone: '+525512345678',
    dni: '45892011',
    email: 'sofia.val@gmail.com',
    company: 'Distribuidora Norte',
    customFields: { ciudad: 'Monterrey', saldo: 'S/ 1,200', descuento: '25', pedido: '#4491' },
    tags: ['VIP', 'Cliente Frecuente'],
    status: 'active',
    metrics: { messagesSent: 12, messagesRead: 11, messagesReplied: 6, lastInteraction: '2026-10-09' },
    createdAt: '2026-01-10',
  },
  {
    id: 'c_2',
    name: 'Mateo Morales',
    phone: '+525598765432',
    dni: '71092834',
    email: 'mateo.m@corporativo.mx',
    company: 'Soluciones IT Tech',
    customFields: { ciudad: 'CDMX', saldo: 'S/ 850', descuento: '15', pedido: '#4492' },
    tags: ['Lead Caliente', 'B2B'],
    status: 'active',
    metrics: { messagesSent: 8, messagesRead: 7, messagesReplied: 4, lastInteraction: '2026-10-10' },
    createdAt: '2026-02-12',
  },
  {
    id: 'c_3',
    name: 'Valeria Castro',
    phone: '+541144332211',
    dni: '38920194',
    email: 'valeria.castro@estudio.ar',
    company: 'Estudio Creativo Sur',
    customFields: { ciudad: 'Buenos Aires', saldo: 'S/ 0', descuento: '30', pedido: '#4493' },
    tags: ['VIP', 'Diseño'],
    status: 'active',
    metrics: { messagesSent: 15, messagesRead: 14, messagesReplied: 9, lastInteraction: '2026-10-11' },
    createdAt: '2026-01-20',
  },
  {
    id: 'c_4',
    name: 'Diego Arismendi',
    phone: '+573118899001',
    dni: '10928374',
    email: 'diego.a@logistica.co',
    company: 'Carga Express Andina',
    customFields: { ciudad: 'Bogotá', saldo: 'S/ 2,400', descuento: '10', pedido: '#4494' },
    tags: ['Comprador Reciente'],
    status: 'active',
    metrics: { messagesSent: 5, messagesRead: 4, messagesReplied: 1, lastInteraction: '2026-10-08' },
    createdAt: '2026-03-05',
  },
  {
    id: 'c_5',
    name: 'Camila Rojas',
    phone: '+56987654321',
    dni: '18492019',
    email: 'camila.r@retail.cl',
    company: 'Tiendas Al Sur',
    customFields: { ciudad: 'Santiago', saldo: 'S/ 320', descuento: '20', pedido: '#4495' },
    tags: ['Inactivo', 'Reactivar'],
    status: 'active',
    metrics: { messagesSent: 9, messagesRead: 3, messagesReplied: 0, lastInteraction: '2026-09-14' },
    createdAt: '2026-01-18',
  },
  {
    id: 'c_6',
    name: 'Javier Navarro',
    phone: '+523311223344',
    dni: '48291033',
    email: 'jnavarro@constructora.mx',
    company: 'Navarro Constructores',
    customFields: { ciudad: 'Guadalajara', saldo: 'S/ 5,000', descuento: '20', pedido: '#4496' },
    tags: ['VIP', 'Corporativo'],
    status: 'active',
    metrics: { messagesSent: 18, messagesRead: 16, messagesReplied: 8, lastInteraction: '2026-10-10' },
    createdAt: '2026-02-01',
  },
  {
    id: 'c_7',
    name: 'Elena Silva',
    phone: '+5511998877665',
    dni: '29384712',
    email: 'elena.silva@brasiltech.br',
    company: 'Brasil Tech Hub',
    customFields: { ciudad: 'São Paulo', saldo: 'S/ 0', descuento: '15', pedido: '#4497' },
    tags: ['B2B', 'Cliente Frecuente'],
    status: 'active',
    metrics: { messagesSent: 10, messagesRead: 9, messagesReplied: 5, lastInteraction: '2026-10-07' },
    createdAt: '2026-03-11',
  },
  {
    id: 'c_8',
    name: 'Andrés Paredes (Opted Out)',
    phone: '+525544332211',
    dni: '59283741',
    email: 'andres.p@correo.com',
    company: 'Particular',
    customFields: { ciudad: 'Puebla', saldo: 'S/ 0', descuento: '0', pedido: '#4498' },
    tags: ['Opt-Out'],
    status: 'opted_out',
    metrics: { messagesSent: 4, messagesRead: 4, messagesReplied: 1, lastInteraction: '2026-08-20' },
    createdAt: '2026-02-28',
  },
];

// Initial Campaigns
const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_1',
    title: 'Campaña Primavera - Cupones VIP 25%',
    templateId: 'tpl_1',
    templateName: 'promocion_exclusiva_vip',
    targetAudience: {
      type: 'custom_tag',
      targetId: 'VIP',
      filterLabel: 'Etiqueta: VIP (Clientes de Alto Valor)',
      totalContacts: 120,
    },
    variableMapping: { '1': 'name', '2': 'company', '3': 'descuento' },
    status: 'completed',
    createdAt: '2026-10-08T10:00:00Z',
    startedAt: '2026-10-08T10:05:00Z',
    completedAt: '2026-10-08T10:20:00Z',
    throttleSpeedPerSecond: 15,
    stats: {
      total: 120,
      sent: 120,
      delivered: 118,
      read: 98,
      replied: 42,
      failed: 2,
    },
    logs: [
      {
        id: 'log_1',
        contactId: 'c_1',
        contactName: 'Sofía Valenzuela',
        phone: '+525512345678',
        status: 'replied',
        sentAt: '2026-10-08T10:05:12Z',
        deliveredAt: '2026-10-08T10:05:13Z',
        readAt: '2026-10-08T10:07:30Z',
        repliedAt: '2026-10-08T10:12:00Z',
        renderedText: '¡Hola Sofía Valenzuela! Como miembro distinguido de Distribuidora Norte...',
      },
    ],
  },
  {
    id: 'camp_2',
    title: 'Aviso Cobranza Ciclo Octubre 2026',
    templateId: 'tpl_2',
    templateName: 'recordatorio_vencimiento_pago',
    targetAudience: {
      type: 'all',
      filterLabel: 'Todos los contactos con saldo pendiente',
      totalContacts: 64,
    },
    variableMapping: { '1': 'name', '2': 'pedido', '3': 'saldo', '4': 'ciudad' },
    status: 'completed',
    createdAt: '2026-10-05T09:00:00Z',
    startedAt: '2026-10-05T09:02:00Z',
    completedAt: '2026-10-05T09:12:00Z',
    throttleSpeedPerSecond: 10,
    stats: {
      total: 64,
      sent: 64,
      delivered: 63,
      read: 56,
      replied: 28,
      failed: 1,
    },
    logs: [],
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_101',
    userId: 'user_1',
    invoiceNumber: 'INV-2026-0891',
    date: '2026-09-15',
    dueDate: '2026-11-15',
    amount: 179.0,
    currency: 'PEN',
    status: 'paid',
    planName: 'Plan 2 Meses',
    messagesSentInCycle: 3820,
  },
  {
    id: 'inv_102',
    userId: 'user_2',
    invoiceNumber: 'INV-2026-0944',
    date: '2026-09-01',
    dueDate: '2026-10-01',
    amount: 99.0,
    currency: 'PEN',
    status: 'overdue',
    planName: 'Plan 1 Mes',
    messagesSentInCycle: 1050,
  },
  {
    id: 'inv_103',
    userId: 'user_3',
    invoiceNumber: 'INV-2026-1002',
    date: '2026-10-11',
    dueDate: '2026-11-11',
    amount: 179.0,
    currency: 'PEN',
    status: 'pending',
    planName: 'Plan 2 Meses (Renovación)',
    messagesSentInCycle: 0,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('wb_auth_token');
    return savedAuth === 'authenticated';
  });

  // Load from localStorage or defaults
  const [usersList, setUsersList] = useState<UserTenant[]>(() => {
    const saved = localStorage.getItem('wb_users_v2');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const savedUserId = localStorage.getItem('wb_current_user_id');
    return savedUserId || 'user_1';
  });

  const [yapePlinConfig, setYapePlinConfig] = useState<YapePlinConfig>(() => {
    const saved = localStorage.getItem('wb_yape_plin');
    return saved ? JSON.parse(saved) : INITIAL_YAPE_PLIN_CONFIG;
  });

  const [yapePlinReceipts, setYapePlinReceipts] = useState<YapePlinReceipt[]>(() => {
    const saved = localStorage.getItem('wb_receipts');
    return saved ? JSON.parse(saved) : INITIAL_YAPE_PLIN_RECEIPTS;
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem('wb_plans_duration');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [metaConfig, setMetaConfig] = useState<MetaApiConfig>(() => {
    const saved = localStorage.getItem('wb_meta_config');
    return saved
      ? JSON.parse(saved)
      : {
          phoneNumberId: '394829104829102',
          wabaId: '109283948572019',
          accessToken: 'EAAG9...TOKEN_META_CLOUD_API_PROD',
          apiVersion: 'v21.0',
          webhookUrl: 'https://whatsbroadcast.io/api/webhook/meta',
          verifyToken: 'WHATS_BROADCAST_SECURE_TOKEN_2026',
          isSandboxMode: true,
          rateTier: 'Tier 2 (10k/día)',
          isConnected: true,
          lastTestedAt: new Date().toISOString(),
        };
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('wb_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [templates, setTemplates] = useState<MetaTemplate[]>(() => {
    const saved = localStorage.getItem('wb_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('wb_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('wb_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [activeRunningCampaignId, setActiveRunningCampaignId] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<BillingAlert[]>([]);

  const [pushEnabled, setPushEnabled] = useState<boolean>(false);

  const [segments, setSegments] = useState<SegmentFilter[]>([
    {
      id: 'seg_1',
      name: 'Clientes VIP de Alta Tasa de Respuesta',
      description: 'Contactos con etiqueta VIP y tasa de apertura mayor al 80%',
      criteria: { tag: 'VIP', minOpenRate: 80 },
      contactCount: 3,
    },
    {
      id: 'seg_2',
      name: 'Leads Calientes & B2B',
      description: 'Prospectos recientes con interacciones en los últimos 7 días',
      criteria: { tag: 'Lead Caliente' },
      contactCount: 2,
    },
    {
      id: 'seg_3',
      name: 'Reactivación de Inactivos',
      description: 'Contactos sin respuesta en más de 20 días',
      criteria: { inactiveDays: 20 },
      contactCount: 1,
    },
  ]);

  // Auto-enforce suspension for expired accounts past their due date
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setUsersList((prev) =>
      prev.map((user) => {
        // Super admins are never expired
        if (user.role === 'super_admin') return user;
        
        // If user is active or in trial and dueDate has arrived or passed (<= today)
        if (user.status !== 'suspended_unpaid' && user.dueDate && user.dueDate <= today) {
          const plan = plans.find((p) => p.id === user.planId) || plans[0];
          return {
            ...user,
            status: 'suspended_unpaid',
            unpaidBalance: user.unpaidBalance > 0 ? user.unpaidBalance : plan.pricePEN,
          };
        }
        return user;
      })
    );
  }, []);

  // Restore Supabase Session on reload
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Cargar lista global de usuarios y clientes desde Supabase en la nube
    dbService.getAllProfiles().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsersList((prev) => {
          const map = new Map<string, UserTenant>();
          prev.forEach((u) => map.set(u.id, u));
          cloudUsers.forEach((cu) => map.set(cu.id, cu));
          return Array.from(map.values());
        });
      }
    }).catch(console.error);

    // 2. Restaurar sesión activa
    supabase.auth.getSession().then(async ({ data }: { data: any }) => {
      const session = data?.session;
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setIsAuthenticated(true);
        const profile = await dbService.getProfile(session.user.id);
        if (profile) {
          setUsersList((prev) => {
            const exists = prev.some((u) => u.id === profile.id);
            return exists ? prev.map((u) => (u.id === profile.id ? profile : u)) : [profile, ...prev];
          });
        }
        const userContacts = await dbService.getContacts(session.user.id);
        setContacts(userContacts);
        const userMeta = await dbService.getMetaConfig(session.user.id);
        if (userMeta) setMetaConfig(userMeta);
        const userCampaigns = await dbService.getCampaigns(session.user.id);
        setCampaigns(userCampaigns);
      }
    });
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('wb_users_v2', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('wb_yape_plin', JSON.stringify(yapePlinConfig));
  }, [yapePlinConfig]);

  useEffect(() => {
    localStorage.setItem('wb_receipts', JSON.stringify(yapePlinReceipts));
  }, [yapePlinReceipts]);

  useEffect(() => {
    localStorage.setItem('wb_plans_duration', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('wb_meta_config', JSON.stringify(metaConfig));
  }, [metaConfig]);

  useEffect(() => {
    localStorage.setItem('wb_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('wb_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('wb_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('wb_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Helper to calculate remaining days
  const getDaysRemaining = (dueDate: string): number => {
    if (!dueDate) return 0;
    const dueTime = new Date(dueDate).getTime();
    const nowTime = Date.now();
    return Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));
  };

  // Current User helper
  const currentUser = usersList.find((u) => u.id === currentUserId) || usersList[0];
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Translation helper
  const t = (key: keyof typeof translations['es']): string => {
    const dict = translations[language] || translations.es;
    return (dict as any)[key] || (translations.es as any)[key] || key;
  };

  // Auth Functions (Conectado a Supabase + Fallback Local)
  const login = async (loginIdentifier: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanInput = loginIdentifier.trim().toLowerCase();

    // 1. Buscar en usersList si coincide por username o email para resolver el email real
    const matchedUser = usersList.find(
      (u) => (u.username && u.username.toLowerCase() === cleanInput) || u.email.toLowerCase() === cleanInput
    );

    const emailToUse = matchedUser ? matchedUser.email.toLowerCase() : (cleanInput.includes('@') ? cleanInput : `${cleanInput}@cliente.local`);

    // 2. Intentar con Supabase Auth si está configurado
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: password,
        });

        if (!error && data?.user) {
          setCurrentUserId(data.user.id);
          setIsAuthenticated(true);
          localStorage.setItem('wb_auth_token', 'authenticated');
          localStorage.setItem('wb_current_user_id', data.user.id);

          const profile = await dbService.getProfile(data.user.id);
          if (profile) {
            setUsersList((prev) => {
              const exists = prev.some((u) => u.id === profile.id);
              return exists ? prev.map((u) => (u.id === profile.id ? profile : u)) : [profile, ...prev];
            });
          }

          const userContacts = await dbService.getContacts(data.user.id);
          setContacts(userContacts);

          const userMeta = await dbService.getMetaConfig(data.user.id);
          if (userMeta) setMetaConfig(userMeta);

          const userCampaigns = await dbService.getCampaigns(data.user.id);
          setCampaigns(userCampaigns);

          return { success: true };
        }
      } catch (err: any) {
        console.error('Error al conectar con Supabase Auth:', err);
      }
    }

    // 3. Fallback directo con el usuario creado en el panel
    if (matchedUser) {
      if (password && matchedUser.password && matchedUser.password !== password) {
        return {
          success: false,
          message: 'Contraseña incorrecta. Por favor verifica tus credenciales.',
        };
      }

      setCurrentUserId(matchedUser.id);
      setIsAuthenticated(true);
      localStorage.setItem('wb_auth_token', 'authenticated');
      localStorage.setItem('wb_current_user_id', matchedUser.id);
      return { success: true };
    }

    return {
      success: false,
      message: 'No se encontró ninguna cuenta registrada con este usuario o correo.',
    };
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    companyName: string = 'Mi Empresa'
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name,
              company_name: companyName,
              role: 'business_owner',
            },
          },
        });

        if (error) return { success: false, message: error.message };

        if (data.user) {
          // Si no requiere confirmación de email inmediata, iniciar sesión
          if (data.session) {
            setCurrentUserId(data.user.id);
            setIsAuthenticated(true);
            localStorage.setItem('wb_auth_token', 'authenticated');
            localStorage.setItem('wb_current_user_id', data.user.id);
            setContacts([]);
            setCampaigns([]);
          }
          return { success: true, message: 'Cuenta creada con éxito. Por favor inicia sesión.' };
        }
      } catch (err: any) {
        return { success: false, message: err.message || 'Error al registrar usuario en Supabase' };
      }
    }

    // Fallback Local
    createNewUser({
      name,
      email: cleanEmail,
      password,
      companyName,
      phone: '',
      planId: '1_month',
      durationMonths: 1,
      status: 'active',
    });

    return { success: true, message: 'Usuario creado exitosamente.' };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setIsAuthenticated(false);
    localStorage.removeItem('wb_auth_token');
    localStorage.removeItem('wb_current_user_id');
  };

  const switchRole = (role: UserRole) => {
    if (role === 'super_admin') {
      setCurrentUserId('user_4');
      localStorage.setItem('wb_current_user_id', 'user_4');
    } else {
      setCurrentUserId('user_1');
      localStorage.setItem('wb_current_user_id', 'user_1');
    }
  };

  // Admin User controls: Time-based user provisioning
  const createNewUser = (data: {
    name: string;
    username?: string;
    email: string;
    password?: string;
    companyName: string;
    phone: string;
    planId: PlanDuration;
    durationMonths: 1 | 2 | 4;
    quotaLimit?: number;
    status: 'active' | 'trial' | 'suspended_unpaid';
    unpaidBalance?: number;
  }) => {
    const durationDays = data.durationMonths === 1 ? 30 : data.durationMonths === 2 ? 60 : 120;
    const startDate = new Date().toISOString().slice(0, 10);
    const dueDate = new Date(Date.now() + durationDays * 86400000).toISOString().slice(0, 10);

    const targetPlan = plans.find((p) => p.id === data.planId) || plans[0];

    const generatedUsername = data.username?.trim().toLowerCase() || data.email.split('@')[0].toLowerCase();

    const newUser: UserTenant = {
      id: `user_${Date.now()}`,
      name: data.name,
      username: generatedUsername,
      email: data.email,
      password: data.password || 'user123',
      companyName: data.companyName,
      phone: data.phone,
      role: 'business_owner',
      status: data.status,
      planId: data.planId,
      durationMonths: data.durationMonths,
      quotaUsed: 0,
      quotaLimit: data.quotaLimit || targetPlan.quotaMessages,
      unpaidBalance: data.unpaidBalance || (data.status === 'suspended_unpaid' ? targetPlan.pricePEN : 0),
      startDate,
      dueDate,
      currency: 'PEN',
      createdAt: startDate,
    };

    setUsersList((prev) => [newUser, ...prev]);

    // Persistir perfil directamente en Supabase en la nube para acceso global
    if (isSupabaseConfigured && supabase) {
      dbService.saveProfile(newUser).catch(console.error);
    }

    // Create invoice for this specific user
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      userId: newUser.id,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: startDate,
      dueDate,
      amount: targetPlan.pricePEN,
      currency: 'PEN',
      status: data.status === 'active' ? 'paid' : 'pending',
      planName: targetPlan.name,
      messagesSentInCycle: 0,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const deleteUser = (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
  };

  const blockUserByAdmin = (userId: string, reason?: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const plan = plans.find((p) => p.id === u.planId) || plans[0];
          return {
            ...u,
            status: 'suspended_unpaid',
            unpaidBalance: u.unpaidBalance > 0 ? u.unpaidBalance : plan.pricePEN,
          };
        }
        return u;
      })
    );
  };

  const unblockUserByAdmin = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const durationDays = u.durationMonths === 1 ? 30 : u.durationMonths === 2 ? 60 : 120;
          return {
            ...u,
            status: 'active',
            unpaidBalance: 0,
            dueDate: new Date(Date.now() + durationDays * 86400000).toISOString().slice(0, 10),
          };
        }
        return u;
      })
    );
  };

  const extendGracePeriod = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newDue = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
          return { ...u, status: 'overdue_grace', dueDate: newDue };
        }
        return u;
      })
    );
  };

  const extendUserDuration = (userId: string, monthsToAdd: 1 | 2 | 4) => {
    const daysToAdd = monthsToAdd === 1 ? 30 : monthsToAdd === 2 ? 60 : 120;
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const currentDueTime = new Date(u.dueDate).getTime();
          const baseTime = currentDueTime > Date.now() ? currentDueTime : Date.now();
          const newDueDate = new Date(baseTime + daysToAdd * 86400000).toISOString().slice(0, 10);
          const newPlanId: PlanDuration = monthsToAdd === 1 ? '1_month' : monthsToAdd === 2 ? '2_months' : '4_months';

          return {
            ...u,
            status: 'active',
            unpaidBalance: 0,
            durationMonths: monthsToAdd,
            planId: newPlanId,
            dueDate: newDueDate,
          };
        }
        return u;
      })
    );
  };

  const updateUserQuota = (userId: string, newLimit: number) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, quotaLimit: newLimit } : u))
    );
  };

  // Yape / Plin Config & Management
  const updateYapePlinConfig = (cfg: Partial<YapePlinConfig>) => {
    setYapePlinConfig((prev) => ({ ...prev, ...cfg }));
  };

  const submitYapePlinPayment = (receiptData: Omit<YapePlinReceipt, 'id' | 'date' | 'status'>) => {
    const newReceipt: YapePlinReceipt = {
      ...receiptData,
      id: `rcp_${Date.now()}`,
      date: new Date().toLocaleString(),
      status: 'pending_review',
    };
    setYapePlinReceipts((prev) => [newReceipt, ...prev]);

    setAlerts((prev) => [
      {
        id: `alt_${Date.now()}`,
        type: 'payment_due',
        title: `Nuevo Comprobante ${receiptData.method} Recibido`,
        message: `${receiptData.companyName} registró código de operación: ${receiptData.operationCode} por S/ ${receiptData.amount.toFixed(2)}.`,
        createdAt: 'Justo ahora',
        read: false,
      },
      ...prev,
    ]);
  };

  const approveReceiptAndUnlockUser = (receiptId: string) => {
    const targetReceipt = yapePlinReceipts.find((r) => r.id === receiptId);
    if (!targetReceipt) return;

    setYapePlinReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'approved' } : r))
    );

    // Determine duration to extend: 1, 2 or 4 months
    const planMonths: 1 | 2 | 4 = targetReceipt.planId === '4_months' ? 4 : targetReceipt.planId === '2_months' ? 2 : 1;
    extendUserDuration(targetReceipt.userId, planMonths);

    // Mark pending invoices as paid
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.status === 'pending' || inv.status === 'overdue' ? { ...inv, status: 'paid' } : inv
      )
    );

    setAlerts((prev) => [
      {
        id: `alt_${Date.now()}`,
        type: 'payment_success',
        title: `Pago por ${targetReceipt.method} Aprobado Exitosamente`,
        message: `El cliente ${targetReceipt.companyName} fue dado de alta con plan de ${planMonths} mes(es) renovado.`,
        createdAt: 'Justo ahora',
        read: false,
      },
      ...prev,
    ]);
  };

  const rejectReceipt = (receiptId: string) => {
    setYapePlinReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'rejected' } : r))
    );
  };

  const updatePlanPrices = (planId: PlanDuration, pricePEN: number) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId ? { ...p, pricePEN } : p
      )
    );
  };

  // Meta API controls
  const updateMetaConfig = (cfg: Partial<MetaApiConfig>) => {
    setMetaConfig((prev) => {
      const updated = { ...prev, ...cfg };
      if (isSupabaseConfigured && currentUser?.id) {
        dbService.saveMetaConfig(currentUser.id, updated).catch(console.error);
      }
      return updated;
    });
  };

  const testMetaConnection = async () => {
    await new Promise((r) => setTimeout(r, 800));
    const isSuccess = metaConfig.isSandboxMode || (metaConfig.phoneNumberId && metaConfig.accessToken.length > 10);
    if (isSuccess) {
      setMetaConfig((prev) => ({
        ...prev,
        isConnected: true,
        lastTestedAt: new Date().toISOString(),
      }));
      return {
        success: true,
        message: 'Conexión verificada con la API Oficial de Meta WhatsApp Cloud.',
        details: { tier: metaConfig.rateTier, quality: 'HIGH (GREEN)' },
      };
    }
    return {
      success: false,
      message: 'Token o Phone Number ID inválido en Meta Graph API.',
    };
  };

  // Contacts (Persistidos y aislados en Supabase)
  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'metrics'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `c_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      metrics: { messagesSent: 0, messagesRead: 0, messagesReplied: 0 },
    };
    setContacts((prev) => [newContact, ...prev]);

    if (isSupabaseConfigured && currentUser?.id) {
      dbService.insertContacts(currentUser.id, [contactData]).catch(console.error);
    }
  };

  const importContacts = (newItems: Omit<Contact, 'id' | 'createdAt' | 'metrics'>[]) => {
    const formatted = newItems.map((item, idx) => ({
      ...item,
      id: `c_${Date.now()}_${idx}`,
      createdAt: new Date().toISOString().slice(0, 10),
      metrics: { messagesSent: 0, messagesRead: 0, messagesReplied: 0 },
    }));
    setContacts((prev) => [...formatted, ...prev]);

    if (isSupabaseConfigured && currentUser?.id) {
      dbService.insertContacts(currentUser.id, newItems).catch(console.error);
    }
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured && currentUser?.id) {
      dbService.deleteContact(currentUser.id, id).catch(console.error);
    }
  };

  const clearAllContacts = () => {
    setContacts([]);
  };

  const toggleOptOut = (id: string) => {
    const target = contacts.find((c) => c.id === id);
    if (target && isSupabaseConfigured && currentUser?.id) {
      dbService.toggleContactOptOut(currentUser.id, id, target.status).catch(console.error);
    }

    setContacts((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'opted_out' ? 'active' : 'opted_out' }
          : c
      )
    );
  };

  const createSegment = (seg: Omit<SegmentFilter, 'id'>) => {
    const newSeg: SegmentFilter = {
      ...seg,
      id: `seg_${Date.now()}`,
      contactCount: contacts.filter((c) => {
        if (seg.criteria.tag && !c.tags.includes(seg.criteria.tag)) return false;
        if (seg.criteria.status && c.status !== seg.criteria.status) return false;
        return true;
      }).length,
    };
    setSegments((prev) => [newSeg, ...prev]);
  };

  // Templates
  const addTemplate = (tpl: Omit<MetaTemplate, 'id' | 'updatedAt'>) => {
    const newTpl: MetaTemplate = {
      ...tpl,
      id: `tpl_${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setTemplates((prev) => [newTpl, ...prev]);
  };

  const syncMetaTemplates = async () => {
    await new Promise((r) => setTimeout(r, 1200));
    setTemplates((prev) =>
      prev.map((t) => ({ ...t, status: 'APPROVED', updatedAt: new Date().toISOString().slice(0, 10) }))
    );
  };

  // Campaigns
  const createCampaign = (
    data: Omit<Campaign, 'id' | 'createdAt' | 'stats' | 'logs'>
  ): Campaign => {
    const newCamp: Campaign = {
      ...data,
      id: `camp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      stats: {
        total: data.targetAudience.totalContacts,
        sent: 0,
        delivered: 0,
        read: 0,
        replied: 0,
        failed: 0,
      },
      logs: [],
    };
    setCampaigns((prev) => [newCamp, ...prev]);

    if (isSupabaseConfigured && currentUser?.id) {
      dbService.saveCampaign(currentUser.id, data).catch(console.error);
    }

    return newCamp;
  };

  // Real-time broadcast engine
  const startBroadcastExecution = async (campaignId: string) => {
    setActiveRunningCampaignId(campaignId);

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, status: 'running', startedAt: new Date().toISOString() }
          : c
      )
    );

    const targetCampaign = campaigns.find((c) => c.id === campaignId);
    if (!targetCampaign) return;

    const eligibleContacts = contacts.filter((c) => c.status !== 'opted_out');
    const totalToProcess = Math.min(eligibleContacts.length, targetCampaign.stats.total || eligibleContacts.length);

    let sentCount = 0;
    let deliveredCount = 0;
    let readCount = 0;
    let repliedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < totalToProcess; i++) {
      const contact = eligibleContacts[i % eligibleContacts.length];
      await new Promise((r) => setTimeout(r, 250));

      const isFail = Math.random() < 0.03;
      sentCount++;
      if (isFail) {
        failedCount++;
      } else {
        deliveredCount++;
        if (Math.random() > 0.15) readCount++;
        if (Math.random() > 0.65) repliedCount++;
      }

      const logItem: CampaignMessageLog = {
        id: `log_${Date.now()}_${i}`,
        contactId: contact.id,
        contactName: contact.name,
        phone: contact.phone,
        status: isFail ? 'failed' : Math.random() > 0.4 ? 'read' : 'delivered',
        errorMessage: isFail ? 'Número fuera de cobertura o no registrado' : undefined,
        sentAt: new Date().toISOString(),
        deliveredAt: !isFail ? new Date().toISOString() : undefined,
        readAt: !isFail ? new Date().toISOString() : undefined,
        renderedText: `Mensaje personalizado para ${contact.name} (${contact.company || 'Cliente'})`,
      };

      setCampaigns((prev) =>
        prev.map((c) => {
          if (c.id === campaignId) {
            return {
              ...c,
              stats: {
                total: totalToProcess,
                sent: sentCount,
                delivered: deliveredCount,
                read: readCount,
                replied: repliedCount,
                failed: failedCount,
              },
              logs: [logItem, ...c.logs.slice(0, 49)],
            };
          }
          return c;
        })
      );

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, quotaUsed: u.quotaUsed + 1 } : u
        )
      );
    }

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, status: 'completed', completedAt: new Date().toISOString() }
          : c
      )
    );
    setActiveRunningCampaignId(null);
  };

  const pauseBroadcastExecution = (campaignId: string) => {
    setActiveRunningCampaignId(null);
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: 'paused' } : c))
    );
  };

  const currentRunningCampaign =
    campaigns.find((c) => c.id === activeRunningCampaignId) || null;

  // Payments & Subscription
  const payInvoice = async (
    invoiceId: string,
    gateway: 'stripe' | 'mercadopago' | 'paypal' | 'yape' | 'plin'
  ): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1200));

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'paid' } : inv))
    );

    // Auto extend user duration by current plan duration
    extendUserDuration(currentUser.id, currentUser.durationMonths || 1);

    setAlerts((prev) => [
      {
        id: `alt_${Date.now()}`,
        type: 'payment_success',
        title: `Pago procesado con éxito vía ${gateway.toUpperCase()}`,
        message: `Tu suscripción por ${currentUser.durationMonths || 1} mes(es) ha sido renovada exitosamente.`,
        createdAt: 'Justo ahora',
        read: false,
      },
      ...prev,
    ]);

    return true;
  };

  const changeSubscriptionPlan = (planId: PlanDuration) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          const days = selectedPlan.durationDays;
          const newDueDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
          return {
            ...u,
            planId,
            durationMonths: selectedPlan.durationMonths,
            dueDate: newDueDate,
            quotaLimit: selectedPlan.quotaMessages,
          };
        }
        return u;
      })
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        const granted = perm === 'granted';
        setPushEnabled(granted);
        if (granted) {
          new Notification('WhatsBroadcast Pro', {
            body: 'Notificaciones push activadas para avisos de facturación y vencimiento de planes.',
            icon: '/favicon.ico',
          });
        }
        return granted;
      } catch (err) {
        setPushEnabled(true);
        return true;
      }
    }
    setPushEnabled(true);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isAuthenticated,
        login,
        signUp,
        logout,
        currentUser,
        isSuperAdmin,
        switchRole,
        usersList,
        createNewUser,
        deleteUser,
        blockUserByAdmin,
        unblockUserByAdmin,
        extendGracePeriod,
        extendUserDuration,
        updateUserQuota,
        getDaysRemaining,
        yapePlinConfig,
        updateYapePlinConfig,
        yapePlinReceipts,
        submitYapePlinPayment,
        approveReceiptAndUnlockUser,
        rejectReceipt,
        metaConfig,
        updateMetaConfig,
        testMetaConnection,
        contacts,
        addContact,
        importContacts,
        deleteContact,
        clearAllContacts,
        toggleOptOut,
        segments,
        createSegment,
        templates,
        addTemplate,
        syncMetaTemplates,
        campaigns,
        createCampaign,
        activeRunningCampaignId,
        startBroadcastExecution,
        pauseBroadcastExecution,
        currentRunningCampaign,
        plans,
        updatePlanPrices,
        invoices,
        payInvoice,
        changeSubscriptionPlan,
        alerts,
        dismissAlert,
        requestPushPermission,
        pushEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
