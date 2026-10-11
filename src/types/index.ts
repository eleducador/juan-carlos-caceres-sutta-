export type Language = 'es' | 'en' | 'pt';

export type UserRole = 'super_admin' | 'business_owner' | 'marketing_manager' | 'operator';

export type AccountStatus = 'active' | 'suspended_unpaid' | 'trial' | 'overdue_grace';

export type PlanDuration = '1_month' | '2_months' | '4_months';

export interface UserTenant {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  companyName: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  planId: PlanDuration;
  durationMonths: 1 | 2 | 4;
  quotaUsed: number;
  quotaLimit: number;
  unpaidBalance: number;
  startDate: string;
  dueDate: string;
  currency: string;
  createdAt: string;
}

export interface YapePlinConfig {
  yapeEnabled: boolean;
  yapeNumber: string;
  yapeHolder: string;
  yapeQrUrl?: string;
  plinEnabled: boolean;
  plinNumber: string;
  plinHolder: string;
  plinBank: string;
  plinQrUrl?: string;
  currency: 'PEN';
}

export interface YapePlinReceipt {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  method: 'YAPE' | 'PLIN';
  operationCode: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending_review' | 'approved' | 'rejected';
  planId: PlanDuration;
  receiptImageUrl?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string; // E.164 format (+52...)
  dni?: string; // Documento Nacional de Identidad / Cédula
  email?: string;
  company?: string;
  customFields: Record<string, string>; // e.g. { ciudad: 'CDMX', saldo: '$450', pedido: '#8891' }
  tags: string[];
  status: 'active' | 'opted_out' | 'bounced';
  metrics: {
    messagesSent: number;
    messagesRead: number;
    messagesReplied: number;
    lastInteraction?: string;
  };
  createdAt: string;
}

export interface SegmentFilter {
  id: string;
  name: string;
  description: string;
  criteria: {
    tag?: string;
    status?: 'active' | 'opted_out';
    minOpenRate?: number;
    inactiveDays?: number;
    hasReplied?: boolean;
  };
  contactCount?: number;
}

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED';

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface MetaTemplate {
  id: string;
  metaTemplateId: string;
  name: string;
  category: TemplateCategory;
  language: string; // e.g. 'es', 'en_US', 'pt_BR'
  status: TemplateStatus;
  headerType: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  headerContent?: string; // Text or placeholder URL
  bodyText: string; // Contains {{1}}, {{2}}
  footerText?: string;
  buttons: TemplateButton[];
  variables: string[]; // List of variable keys e.g. ["nombre", "empresa", "descuento"]
  updatedAt: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'paused' | 'failed';

export interface CampaignMessageLog {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'replied' | 'failed';
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  repliedAt?: string;
  renderedText: string;
}

export interface Campaign {
  id: string;
  title: string;
  templateId: string;
  templateName: string;
  targetAudience: {
    type: 'all' | 'segment' | 'custom_tag';
    targetId?: string;
    filterLabel: string;
    totalContacts: number;
  };
  variableMapping: Record<string, string>; // e.g. { "1": "name", "2": "company" }
  status: CampaignStatus;
  scheduledFor?: string; // ISO string if scheduled
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  throttleSpeedPerSecond: number; // e.g. 5, 15, 30 msgs/sec
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    failed: number;
  };
  logs: CampaignMessageLog[];
}

export interface MetaApiConfig {
  phoneNumberId: string;
  wabaId: string; // WhatsApp Business Account ID
  accessToken: string;
  apiVersion: string; // e.g. 'v21.0'
  webhookUrl: string;
  verifyToken: string;
  isSandboxMode: boolean;
  rateTier: 'Tier 1 (1k/día)' | 'Tier 2 (10k/día)' | 'Tier 3 (100k/día)' | 'Tier Unlimited';
  isConnected: boolean;
  lastTestedAt?: string;
}

export interface SubscriptionPlan {
  id: PlanDuration;
  name: string;
  durationMonths: 1 | 2 | 4;
  durationDays: number; // 30, 60, 120
  pricePEN: number; // Precio exclusivo en Soles (PEN)
  quotaMessages: number;
  features: string[];
  recommended?: boolean;
  discountLabel?: string;
}

export interface Invoice {
  id: string;
  userId?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  planName: string;
  messagesSentInCycle: number;
  downloadUrl?: string;
}

export interface BillingAlert {
  id: string;
  type: 'payment_due' | 'quota_warning' | 'payment_overdue_blocked' | 'payment_success';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}
