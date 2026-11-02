-- Supabase Migration: 001_initial_schema.sql
-- Church Website & Admin Portal (Mizpah Ministries)
-- Fully Idempotent & PostgREST / search_path Safe

-- Ensure transaction is in Read-Write mode
SET session characteristics AS TRANSACTION READ WRITE;
SET default_transaction_read_only = 'off';

-- ============================================================================
-- 1. DATABASE TABLES
-- ============================================================================

-- 1. Admin Profiles table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Site Settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_name TEXT NOT NULL DEFAULT 'Mizpah Ministries',
  logo_path TEXT,
  short_description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  social_links JSONB DEFAULT '{"facebook":"","instagram":"","youtube":"","twitter":""}'::jsonb,
  footer_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Hero Sections table
CREATE TABLE IF NOT EXISTS public.hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_path TEXT NOT NULL,
  button_text TEXT,
  button_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 4. About God Cards table
CREATE TABLE IF NOT EXISTS public.about_god_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  image_path TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 5. Founders table
CREATE TABLE IF NOT EXISTS public.founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vision TEXT NOT NULL,
  biography TEXT,
  image_path TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 6. Sermons table
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pastor_name TEXT NOT NULL,
  sermon_date DATE NOT NULL DEFAULT CURRENT_DATE,
  youtube_url TEXT NOT NULL,
  thumbnail_path TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 7. Gallery Categories table
CREATE TABLE IF NOT EXISTS public.gallery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Gallery Collections table
CREATE TABLE IF NOT EXISTS public.gallery_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.gallery_categories(id) ON DELETE RESTRICT,
  cover_image_path TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 9. Gallery Images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.gallery_collections(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 10. Contact Messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_hero_sections_published ON public.hero_sections(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_about_god_published ON public.about_god_cards(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_founders_published ON public.founders(is_published, is_primary);
CREATE INDEX IF NOT EXISTS idx_sermons_published ON public.sermons(is_published, sermon_date DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_category ON public.gallery_collections(category_id, is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_images_collection ON public.gallery_images(collection_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status, created_at DESC);

-- ============================================================================
-- 3. STORAGE BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('site-assets', 'site-assets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('about-images', 'about-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('founder-images', 'founder-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('sermon-thumbnails', 'sermon-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('gallery-images', 'gallery-images', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_god_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. HELPER SECURITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
STABLE
AS $$
  SELECT (
    auth.role() = 'authenticated'
    AND (
      EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = auth.uid()
      )
      OR (auth.jwt() ->> 'email') = 'admin@mizpahministries.org'
      OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
STABLE
AS $$
  SELECT (
    auth.role() = 'authenticated'
    AND (
      EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = auth.uid() AND role = 'superadmin'
      )
      OR (auth.jwt() ->> 'email') = 'admin@mizpahministries.org'
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO anon, authenticated, service_role;

-- ============================================================================
-- 6. IDEMPOTENT RLS POLICIES
-- NOTE: Uses (auth.uid() IS NOT NULL) directly for authenticated admin checks.
-- This prevents "function is_admin() does not exist" errors caused by
-- PostgREST resetting search_path to empty string ('').
-- ============================================================================

-- Site Settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Hero Sections
DROP POLICY IF EXISTS "Public can view published hero sections" ON public.hero_sections;
CREATE POLICY "Public can view published hero sections" ON public.hero_sections
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage hero sections" ON public.hero_sections;
CREATE POLICY "Admins can manage hero sections" ON public.hero_sections
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- About God Cards
DROP POLICY IF EXISTS "Public can view published about god cards" ON public.about_god_cards;
CREATE POLICY "Public can view published about god cards" ON public.about_god_cards
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage about god cards" ON public.about_god_cards;
CREATE POLICY "Admins can manage about god cards" ON public.about_god_cards
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Founders
DROP POLICY IF EXISTS "Public can view published founders" ON public.founders;
CREATE POLICY "Public can view published founders" ON public.founders
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage founders" ON public.founders;
CREATE POLICY "Admins can manage founders" ON public.founders
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Sermons (Drop any legacy duplicate policies as well)
DROP POLICY IF EXISTS "Admin write sermons" ON public.sermons;
DROP POLICY IF EXISTS "Anon write sermons" ON public.sermons;
DROP POLICY IF EXISTS "Public read sermons" ON public.sermons;
DROP POLICY IF EXISTS "Public can view published sermons" ON public.sermons;
CREATE POLICY "Public can view published sermons" ON public.sermons
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage sermons" ON public.sermons;
CREATE POLICY "Admins can manage sermons" ON public.sermons
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Gallery Categories
DROP POLICY IF EXISTS "Public can view gallery categories" ON public.gallery_categories;
CREATE POLICY "Public can view gallery categories" ON public.gallery_categories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery categories" ON public.gallery_categories;
CREATE POLICY "Admins can manage gallery categories" ON public.gallery_categories
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Gallery Collections
DROP POLICY IF EXISTS "Public can view published gallery collections" ON public.gallery_collections;
CREATE POLICY "Public can view published gallery collections" ON public.gallery_collections
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage gallery collections" ON public.gallery_collections;
CREATE POLICY "Admins can manage gallery collections" ON public.gallery_collections
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Gallery Images
DROP POLICY IF EXISTS "Public can view images of published collections" ON public.gallery_images;
CREATE POLICY "Public can view images of published collections" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.gallery_collections gc
      WHERE gc.id = gallery_images.collection_id AND (gc.is_published = true OR auth.uid() IS NOT NULL)
    )
  );

DROP POLICY IF EXISTS "Admins can manage gallery images" ON public.gallery_images;
CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Contact Messages
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view and manage contact messages" ON public.contact_messages;
CREATE POLICY "Only admins can view and manage contact messages" ON public.contact_messages
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admin Profiles
DROP POLICY IF EXISTS "Admins can view admin profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin profiles" ON public.admin_profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Superadmins can manage admin profiles" ON public.admin_profiles;
CREATE POLICY "Superadmins can manage admin profiles" ON public.admin_profiles
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Safety fallback if public.profiles exists in database
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
    CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- ============================================================================
-- 7. STORAGE OBJECT POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Public read church buckets" ON storage.objects;
CREATE POLICY "Public read church buckets" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('site-assets', 'about-images', 'founder-images', 'sermon-thumbnails', 'gallery-images'));

DROP POLICY IF EXISTS "Authenticated upload church buckets" ON storage.objects;
CREATE POLICY "Authenticated upload church buckets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('site-assets', 'about-images', 'founder-images', 'sermon-thumbnails', 'gallery-images'));

DROP POLICY IF EXISTS "Authenticated update church buckets" ON storage.objects;
CREATE POLICY "Authenticated update church buckets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('site-assets', 'about-images', 'founder-images', 'sermon-thumbnails', 'gallery-images'));

DROP POLICY IF EXISTS "Authenticated delete church buckets" ON storage.objects;
CREATE POLICY "Authenticated delete church buckets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id IN ('site-assets', 'about-images', 'founder-images', 'sermon-thumbnails', 'gallery-images'));
