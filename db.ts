import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Contact, Campaign, MetaApiConfig, UserTenant } from '../types';

export const dbService = {
  // Profiles
  async getProfile(userId: string): Promise<UserTenant | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      username: data.username || data.email.split('@')[0],
      email: data.email,
      password: data.password || 'user123',
      companyName: data.company_name,
      phone: data.phone,
      role: data.role,
      status: data.status,
      planId: data.plan_id,
      durationMonths: data.duration_months,
      startDate: data.start_date,
      dueDate: data.due_date,
      quotaUsed: data.quota_used,
      quotaLimit: data.quota_limit,
      unpaidBalance: Number(data.unpaid_balance || 0),
      currency: 'PEN',
      createdAt: data.created_at,
    };
  },

  async getAllProfiles(): Promise<UserTenant[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      username: d.username || d.email.split('@')[0],
      email: d.email,
      password: d.password || 'user123',
      companyName: d.company_name,
      phone: d.phone,
      role: d.role,
      status: d.status,
      planId: d.plan_id,
      durationMonths: d.duration_months,
      startDate: d.start_date,
      dueDate: d.due_date,
      quotaUsed: d.quota_used,
      quotaLimit: d.quota_limit,
      unpaidBalance: Number(d.unpaid_balance || 0),
      currency: 'PEN',
      createdAt: d.created_at,
    }));
  },

  async saveProfile(user: UserTenant): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
        company_name: user.companyName,
        phone: user.phone,
        role: user.role,
        status: user.status,
        plan_id: user.planId,
        duration_months: user.durationMonths,
        start_date: user.startDate,
        due_date: user.dueDate,
        quota_used: user.quotaUsed,
        quota_limit: user.quotaLimit,
        unpaid_balance: user.unpaidBalance,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    return !error;
  },

  // Meta Config
  async getMetaConfig(userId: string): Promise<MetaApiConfig | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('meta_configs')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return {
      phoneNumberId: data.phone_number_id || '',
      wabaId: data.waba_id || '',
      accessToken: data.access_token || '',
      apiVersion: 'v21.0',
      webhookUrl: 'https://whatsbroadcast.io/api/webhook/meta',
      verifyToken: 'WHATS_BROADCAST_SECURE_TOKEN_2026',
      isSandboxMode: false,
      rateTier: 'Tier 2 (10k/día)',
      isConnected: Boolean(data.is_connected),
      lastTestedAt: data.updated_at,
    };
  },

  async saveMetaConfig(userId: string, config: Partial<MetaApiConfig>): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase
      .from('meta_configs')
      .upsert({
        user_id: userId,
        phone_number_id: config.phoneNumberId,
        waba_id: config.wabaId,
        access_token: config.accessToken,
        is_connected: config.isConnected,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    return !error;
  },

  // Contacts
  async getContacts(userId: string): Promise<Contact[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      dni: c.dni || '',
      company: c.company || '',
      tags: c.tags || [],
      customFields: c.custom_fields || {},
      status: c.is_opted_out ? 'opted_out' : 'active',
      createdAt: c.created_at,
      metrics: {
        messagesSent: c.messages_sent || 0,
        messagesRead: c.messages_read || 0,
        messagesReplied: 0,
        lastInteraction: c.updated_at,
      },
    }));
  },

  async insertContacts(userId: string, contacts: Omit<Contact, 'id' | 'createdAt' | 'metrics'>[]): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const records = contacts.map(c => ({
      user_id: userId,
      name: c.name,
      phone: c.phone,
      dni: c.dni,
      email: c.email || '',
      company: c.company || '',
      tags: c.tags || [],
      custom_fields: c.customFields || {},
      is_opted_out: c.status === 'opted_out',
    }));
    const { error } = await supabase.from('contacts').insert(records);
    return !error;
  },

  async deleteContact(userId: string, contactId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactId)
      .eq('user_id', userId);
    return !error;
  },

  async toggleContactOptOut(userId: string, contactId: string, currentStatus: 'active' | 'opted_out' | 'bounced'): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    const newOptOut = currentStatus !== 'opted_out';
    const { error } = await supabase
      .from('contacts')
      .update({ is_opted_out: newOptOut })
      .eq('id', contactId)
      .eq('user_id', userId);
    return !error;
  },

  // Campaigns
  async getCampaigns(userId: string): Promise<Campaign[]> {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((camp: any) => ({
      id: camp.id,
      title: camp.name,
      templateId: camp.template_id,
      templateName: camp.template_name,
      targetAudience: {
        type: 'custom_tag',
        filterLabel: camp.target_tag || 'Todos',
        totalContacts: 0,
      },
      variableMapping: {},
      scheduledFor: camp.scheduled_at,
      status: camp.status,
      throttleSpeedPerSecond: 10,
      stats: camp.stats || { total: 0, sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 },
      logs: camp.logs || [],
      createdAt: camp.created_at,
    }));
  },

  async saveCampaign(userId: string, campaign: Omit<Campaign, 'id' | 'createdAt' | 'stats' | 'logs'>): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name: campaign.title,
        template_id: campaign.templateId,
        template_name: campaign.templateName,
        target_tag: campaign.targetAudience.filterLabel,
        scheduled_at: campaign.scheduledFor,
        status: campaign.status || 'draft',
        stats: { total: 0, sent: 0, delivered: 0, read: 0, replied: 0, failed: 0 },
        logs: [],
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return data.id;
  },
};
