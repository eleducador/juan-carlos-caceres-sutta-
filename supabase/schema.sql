-- ==============================================================================
-- SCHEMA SUPABASE: WhatsBroadcast Pro (Multi-Tenant con Row Level Security)
-- ==============================================================================

-- 1. Tabla de Perfiles de Usuario (Tenants)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'business_owner',
  status TEXT DEFAULT 'active',
  plan_id TEXT DEFAULT '1_month',
  duration_months INT DEFAULT 1,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  grace_period_days INT DEFAULT 3,
  quota_used INT DEFAULT 0,
  quota_limit INT DEFAULT 1000,
  unpaid_balance NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Configuración de Meta Cloud API por Usuario
CREATE TABLE IF NOT EXISTS public.meta_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  phone_number_id TEXT DEFAULT '',
  waba_id TEXT DEFAULT '',
  access_token TEXT DEFAULT '',
  app_id TEXT DEFAULT '',
  is_connected BOOLEAN DEFAULT FALSE,
  verified_name TEXT DEFAULT '',
  quality_rating TEXT DEFAULT 'GREEN',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Contactos (Directorio privado por Usuario)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  dni TEXT DEFAULT '',
  email TEXT DEFAULT '',
  company TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  is_opted_out BOOLEAN DEFAULT FALSE,
  messages_sent INT DEFAULT 0,
  messages_delivered INT DEFAULT 0,
  messages_read INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Plantillas de WhatsApp (Templates HSM por Usuario)
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meta_template_id TEXT,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'MARKETING',
  language TEXT DEFAULT 'es',
  status TEXT DEFAULT 'APPROVED',
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Campañas de Mensajería Masiva
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_id TEXT,
  template_name TEXT,
  target_tag TEXT,
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  stats JSONB DEFAULT '{"total": 0, "sent": 0, "delivered": 0, "read": 0, "failed": 0}'::jsonb,
  logs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Facturas / Recibos
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  plan_name TEXT NOT NULL,
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Recibos de Pagos Yape / Plin
CREATE TABLE IF NOT EXISTS public.yape_plin_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_name TEXT,
  tenant_email TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  method TEXT,
  reference_number TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  date TIMESTAMPTZ DEFAULT NOW(),
  plan_id TEXT,
  months INT DEFAULT 1
);

-- ==============================================================================
-- TRIGGER: Creación automática de Perfil y MetaConfig al registrar usuario
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, company_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mi Empresa'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'business_owner')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.meta_configs (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS): Aislamiento Total por Usuario
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yape_plin_receipts ENABLE ROW LEVEL SECURITY;

-- Helper para verificar si es super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Eliminar políticas previas si ya existen para evitar errores al re-ejecutar
DROP POLICY IF EXISTS "Users can view their own profile or admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or admins update all" ON public.profiles;
DROP POLICY IF EXISTS "Users own their Meta config" ON public.meta_configs;
DROP POLICY IF EXISTS "Users access only their contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users access only their templates" ON public.templates;
DROP POLICY IF EXISTS "Users access only their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users view only their invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users manage their receipts" ON public.yape_plin_receipts;

-- POLÍTICAS: profiles
CREATE POLICY "Users can view their own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Users can update their own profile or admins update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_super_admin());

-- POLÍTICAS: meta_configs
CREATE POLICY "Users own their Meta config"
  ON public.meta_configs FOR ALL
  USING (auth.uid() = user_id OR public.is_super_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin());

-- POLÍTICAS: contacts
CREATE POLICY "Users access only their contacts"
  ON public.contacts FOR ALL
  USING (auth.uid() = user_id OR public.is_super_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin());

-- POLÍTICAS: templates
CREATE POLICY "Users access only their templates"
  ON public.templates FOR ALL
  USING (auth.uid() = user_id OR public.is_super_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin());

-- POLÍTICAS: campaigns
CREATE POLICY "Users access only their campaigns"
  ON public.campaigns FOR ALL
  USING (auth.uid() = user_id OR public.is_super_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin());

-- POLÍTICAS: invoices
CREATE POLICY "Users view only their invoices"
  ON public.invoices FOR ALL
  USING (auth.uid() = user_id OR public.is_super_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin());

-- POLÍTICAS: yape_plin_receipts
CREATE POLICY "Users manage their receipts"
  ON public.yape_plin_receipts FOR ALL
  USING (auth.uid() = user_id OR public.is_super_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_super_admin());
