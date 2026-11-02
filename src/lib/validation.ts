import { z } from 'zod';
import { getYouTubeVideoId } from './utils';

// 1. Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Please enter your name (at least 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  subject: z.string().min(1, 'Please select whether you attend'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

// 2. Admin Login Schema
export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

// 3. Hero Section Schema
export const heroSectionSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  button_text: z.string().optional().nullable(),
  button_url: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
export type HeroSectionValues = z.infer<typeof heroSectionSchema>;

// 4. About God Card Schema
export const aboutGodCardSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  short_description: z.string().min(5, 'Short description is required'),
  full_description: z.string().min(20, 'Full description must be at least 20 characters'),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
export type AboutGodCardValues = z.infer<typeof aboutGodCardSchema>;

// 5. Founder Schema
export const founderSchema = z.object({
  name: z.string().min(2, 'Founder name is required'),
  vision: z.string().min(10, 'Vision statement must be at least 10 characters'),
  biography: z.string().optional().nullable(),
  is_primary: z.boolean().default(true),
  is_published: z.boolean().default(true),
});
export type FounderValues = z.infer<typeof founderSchema>;

// 6. Sermon Schema
export const sermonSchema = z.object({
  title: z.string().min(3, 'Sermon title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pastor_name: z.string().min(2, 'Preacher / Pastor name is required'),
  sermon_date: z.string().min(4, 'Sermon date is required'),
  youtube_url: z.string().url('Must be a valid URL').refine((url) => {
    return getYouTubeVideoId(url) !== null;
  }, {
    message: 'Must be a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)',
  }),
  is_published: z.boolean().default(true),
});
export type SermonValues = z.infer<typeof sermonSchema>;

// 7. Gallery Collection Schema
export const galleryCollectionSchema = z.object({
  title: z.string().min(2, 'Collection title is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional().nullable(),
  category_id: z.string().uuid('Please select a valid category'),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
export type GalleryCollectionValues = z.infer<typeof galleryCollectionSchema>;

// 8. Site Settings Schema
export const siteSettingsSchema = z.object({
  church_name: z.string().min(2, 'Church name is required'),
  short_description: z.string().optional().nullable(),
  contact_email: z.string().email('Valid email is required').optional().or(z.literal('')),
  contact_phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  footer_description: z.string().optional().nullable(),
  social_facebook: z.string().optional().or(z.literal('')),
  social_instagram: z.string().optional().or(z.literal('')),
  social_youtube: z.string().optional().or(z.literal('')),
  social_twitter: z.string().optional().or(z.literal('')),
});
export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
