-- Supabase Migration: 002_campuses_table.sql
-- Adds Campuses Table with RLS for Church Campus Information

CREATE TABLE IF NOT EXISTS public.campuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  campus_page_name TEXT,
  campus_page_url TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campuses_published ON public.campuses(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_campuses_primary ON public.campuses(is_primary);

-- Enable RLS
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;

-- Public can view published campuses
CREATE POLICY "Public can view published campuses"
  ON public.campuses FOR SELECT
  USING (is_published = true);

-- Authenticated admins can view all campuses
CREATE POLICY "Admins can view all campuses"
  ON public.campuses FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated admins can insert campuses
CREATE POLICY "Admins can insert campuses"
  ON public.campuses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated admins can update campuses
CREATE POLICY "Admins can update campuses"
  ON public.campuses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can delete campuses
CREATE POLICY "Admins can delete campuses"
  ON public.campuses FOR DELETE
  TO authenticated
  USING (true);
