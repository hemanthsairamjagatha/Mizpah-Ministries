-- Seed Script: supabase/seed.sql
-- Mizpah Ministries Church Portal
-- Clean Seed Data & Admin Profile Linking

-- Ensure transaction is in Read-Write mode
SET session characteristics AS TRANSACTION READ WRITE;
SET default_transaction_read_only = 'off';

-- 1. Default Gallery Categories
INSERT INTO public.gallery_categories (name, slug, sort_order)
VALUES 
  ('All Photos', 'all', 0),
  ('Worship', 'worship', 1),
  ('Community', 'community', 2),
  ('Prayer', 'prayer', 3),
  ('Youth', 'youth', 4),
  ('Sanctuary', 'sanctuary', 5)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name, 
  sort_order = EXCLUDED.sort_order;

-- 2. Initial Site Settings
INSERT INTO public.site_settings (
  church_name, 
  short_description, 
  contact_email, 
  contact_phone, 
  address, 
  social_links, 
  footer_description
)
SELECT 
  'Mizpah Ministries',
  'A Christ-centered sanctuary dedicated to faith, community, worship, and service.',
  'hello@mizpahministries.org',
  '(800) 555-4321',
  'MIZPAH MINISTRIES
NO:1 KR COLONY,
PODILI ROAD,KNIGRI,
MARKAPURAM (D)
ANDHRA PRADESH
INDIA.PIN-523230',
  '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com", "twitter": "https://twitter.com"}'::jsonb,
  'Welcome to Mizpah Ministries. We are a warm, welcoming community of believers seeking to know Christ and make Him known.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- 3. Hero Slide
INSERT INTO public.hero_sections (
  title, 
  description, 
  image_path, 
  button_text, 
  button_url, 
  is_published, 
  sort_order
)
SELECT 
  'Walking Together in Grace & Truth',
  'Experience heartfelt worship, genuine fellowship, and the transforming power of God''s Word every Sunday.',
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80',
  'Watch Sermons',
  '#sermons',
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.hero_sections);

-- 4. About God Cards
INSERT INTO public.about_god_cards (
  title, 
  short_description, 
  full_description, 
  image_path, 
  is_published, 
  sort_order
)
SELECT 
  'God the Father',
  'The Almighty Creator and loving Father whose providence guides our lives.',
  'We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit. God the Father created the heavens and the earth by His sovereign will and loves humanity unconditionally. Through His boundless grace, He invites all people into an eternal covenant of redemption.',
  'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
  true,
  1
WHERE NOT EXISTS (SELECT 1 FROM public.about_god_cards WHERE title = 'God the Father');

INSERT INTO public.about_god_cards (
  title, 
  short_description, 
  full_description, 
  image_path, 
  is_published, 
  sort_order
)
SELECT 
  'Jesus Christ the Son',
  'The Savior of the world, through whom we have grace, forgiveness, and eternal life.',
  'Jesus Christ is the true light of the world, fully God and fully man. Through His sinless life, sacrificial death on the cross, and victorious resurrection on the third day, He conquered death and established peace between God and humankind.',
  'https://images.unsplash.com/photo-1510525009512-ad7fc3378317?auto=format&fit=crop&w=800&q=80',
  true,
  2
WHERE NOT EXISTS (SELECT 1 FROM public.about_god_cards WHERE title = 'Jesus Christ the Son');

INSERT INTO public.about_god_cards (
  title, 
  short_description, 
  full_description, 
  image_path, 
  is_published, 
  sort_order
)
SELECT 
  'The Holy Spirit',
  'Our divine Comforter, Counselor, and the empowering presence of God with us.',
  'The Holy Spirit indwells every believer from the moment of faith, imparting spiritual gifts, divine guidance, moral conviction, and supernatural peace. He unifies the global Church and empowers us to live out the Great Commission.',
  'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80',
  true,
  3
WHERE NOT EXISTS (SELECT 1 FROM public.about_god_cards WHERE title = 'The Holy Spirit');

-- 5. Primary Founder
INSERT INTO public.founders (
  name, 
  vision, 
  biography, 
  image_path, 
  is_primary, 
  is_published
)
SELECT 
  'Pastor Ezekiel.G',
  '"For every way that someone can be lost, we want to provide a practical way for them to be found in the very place that they have ended up."',
  'Pastor Ezekiel has dedicated his life to shepherding souls, building intentional community, and cultivating leaders across generations. Under his guidance, Mizpah Ministries has blossomed into a beacon of hope and spiritual refuge.',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.founders);

-- 6. Sermons
INSERT INTO public.sermons (
  title, 
  description, 
  pastor_name, 
  sermon_date, 
  youtube_url, 
  thumbnail_path, 
  is_published
)
SELECT 
  'The Power of Steadfast Prayer',
  'Discover how personal prayer shifts anxiety into unshakeable divine peace when life feels turbulent.',
  'Pastor Ezekiel.G',
  '2026-10-18',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1510525009512-ad7fc3378317?auto=format&fit=crop&w=1200&q=80',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.sermons WHERE title = 'The Power of Steadfast Prayer');

-- 7. Link Superadmin Profile for Existing Admin Users (including office@pixenox.com)
INSERT INTO public.admin_profiles (id, display_name, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1), 'Administrator'), 
  'superadmin'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET 
  role = 'superadmin',
  display_name = EXCLUDED.display_name;
