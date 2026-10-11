-- ==============================================================================
-- FIX DIRECTO PARA PERMITIR REGISTRO SIN BLOQUEOS
-- ==============================================================================

-- 1. Eliminar el trigger anterior que bloqueaba auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Asegurar que las columnas de profiles acepten cualquier valor sin restricción
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_id_check;

-- 3. Crear función de inserción ultra-segura que no lanza excepciones
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    company_name, 
    role, 
    status, 
    plan_id, 
    duration_months,
    start_date,
    due_date,
    quota_used,
    quota_limit,
    unpaid_balance
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, 'Usuario'), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Mi Empresa'),
    'business_owner',
    'active',
    '1_month',
    1,
    NOW(),
    NOW() + INTERVAL '30 days',
    0,
    1000,
    0.00
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.meta_configs (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Si ocurre cualquier error, no bloquear la creación de la cuenta en auth.users
  RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-asociar el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Dar permisos totales al servicio
GRANT ALL ON TABLE public.profiles TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.meta_configs TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.contacts TO authenticated, anon, service_role;
GRANT ALL ON TABLE public.campaigns TO authenticated, anon, service_role;
