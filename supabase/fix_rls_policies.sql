-- ============================================================================
-- CHURCH PORTAL: BULLETPROOF RLS REPAIR SCRIPT
-- ============================================================================
-- Run this in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/<your-project-ref>/sql
-- ============================================================================

SET session characteristics AS TRANSACTION READ WRITE;
SET default_transaction_read_only = 'off';

-- 1. Wipe out ALL old/conflicting policies across all church tables
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN (
            'founders', 
            'about_god_cards', 
            'hero_sections', 
            'sermons', 
            'gallery_categories', 
            'gallery_collections', 
            'gallery_images', 
            'site_settings', 
            'admin_profiles', 
            'contact_messages'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. Ensure all users in auth.users are superadmins in admin_profiles
INSERT INTO public.admin_profiles (id, display_name, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1), 'Administrator'),
  'superadmin'
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'superadmin', updated_at = now();

-- 3. Update helper functions to recognize all authenticated users
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER
SET search_path = public, auth, pg_catalog STABLE
AS $$ SELECT (auth.role() = 'authenticated'); $$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER
SET search_path = public, auth, pg_catalog STABLE
AS $$ SELECT (auth.role() = 'authenticated'); $$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO anon, authenticated, service_role;

-- 4. Re-create clean RLS policies

-- Founders
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "founders_public_select" ON public.founders
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "founders_admin_all" ON public.founders
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- About God Cards
ALTER TABLE public.about_god_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about_god_public_select" ON public.about_god_cards
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "about_god_admin_all" ON public.about_god_cards
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Hero Sections
ALTER TABLE public.hero_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hero_public_select" ON public.hero_sections
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "hero_admin_all" ON public.hero_sections
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sermons
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sermons_public_select" ON public.sermons
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "sermons_admin_all" ON public.sermons
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Site Settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_select" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "site_settings_admin_all" ON public.site_settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Gallery Categories
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_cat_public_select" ON public.gallery_categories
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "gallery_cat_admin_all" ON public.gallery_categories
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Gallery Collections
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_col_public_select" ON public.gallery_collections
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "gallery_col_admin_all" ON public.gallery_collections
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Gallery Images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_img_public_select" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "gallery_img_admin_all" ON public.gallery_images
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contact Messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_public_insert" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "contact_admin_all" ON public.contact_messages
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin Profiles
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_profiles_auth_select" ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "admin_profiles_admin_all" ON public.admin_profiles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Auto-assign Trigger for future users
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_catalog AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Administrator'),
    'superadmin'
  )
  ON CONFLICT (id) DO UPDATE SET role = 'superadmin', updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();
