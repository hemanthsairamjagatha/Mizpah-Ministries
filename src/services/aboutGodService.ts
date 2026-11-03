import { supabase } from './supabaseClient';
import { siteSettingsService } from './siteSettingsService';
import { slugify } from '../lib/utils';
import type { AboutGodCard, GospelText } from '../types/database.types';

export const DEFAULT_GOSPEL_TEXT: GospelText = {
  id: 'default-gospel-text',
  heading: 'The Gospel',
  label: 'Text :',
  scripture:
    'Isaiah 9:6. For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.',
  priority: 1,
  is_published: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

export const aboutGodService = {
  /**
   * Fetch published About God cards for public website (order by sort_order)
   */
  async getPublishedAboutGodCards(): Promise<AboutGodCard[]> {
    const { data, error } = await supabase
      .from('about_god_cards')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Error fetching about god cards:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch all About God cards for admin management
   */
  async getAllAboutGodCards(): Promise<AboutGodCard[]> {
    const { data, error } = await supabase
      .from('about_god_cards')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createAboutGodCard(card: Omit<AboutGodCard, 'id' | 'created_at' | 'updated_at'>): Promise<AboutGodCard> {
    const { data, error } = await supabase
      .from('about_god_cards')
      .insert(card)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAboutGodCard(id: string, updates: Partial<AboutGodCard>): Promise<AboutGodCard> {
    const { data, error } = await supabase
      .from('about_god_cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAboutGodCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('about_god_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Fetch single published card by slug or id
   */
  async getCardBySlugOrId(slugOrId: string): Promise<AboutGodCard | null> {
    const cards = await this.getPublishedAboutGodCards();
    const normalized = decodeURIComponent(slugOrId).toLowerCase().trim();
    return (
      cards.find(
        (c) => c.id === slugOrId || slugify(c.title) === normalized
      ) || null
    );
  },

  /**
   * Fetch all Gospel texts for admin management
   */
  async getAllGospelTexts(): Promise<GospelText[]> {
    try {
      const settings = await siteSettingsService.getSiteSettings();
      let gospelTexts = (settings?.social_links as any)?.gospel_texts;
      if (typeof gospelTexts === 'string') {
        try {
          gospelTexts = JSON.parse(gospelTexts);
        } catch (_) {}
      }
      if (Array.isArray(gospelTexts) && gospelTexts.length > 0) {
        gospelTexts.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
        this.cacheGospelTexts(gospelTexts);
        return gospelTexts;
      }
    } catch (err) {
      console.warn('Could not fetch gospel texts from site settings:', err);
    }

    try {
      const cached = localStorage.getItem('mizpah_gospel_texts_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
          return parsed;
        }
      }
    } catch (_) {}

    return [DEFAULT_GOSPEL_TEXT];
  },

  /**
   * Fetch published Gospel texts for public display (sorted by priority)
   */
  async getPublishedGospelTexts(): Promise<GospelText[]> {
    const all = await this.getAllGospelTexts();
    return all
      .filter((t) => t.is_published !== false)
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
  },

  /**
   * Create a new Gospel text entry (no image required)
   */
  async createGospelText(data: Omit<GospelText, 'id' | 'created_at' | 'updated_at'>): Promise<GospelText> {
    const current = await this.getAllGospelTexts();
    const newEntry: GospelText = {
      ...data,
      id: 'gospel_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      priority: data.priority ?? (current.length + 1),
      is_published: data.is_published !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated = [...current, newEntry].sort(
      (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
    );
    await this.persistGospelTexts(updated);
    this.cacheGospelTexts(updated);
    return newEntry;
  },

  /**
   * Update an existing Gospel text entry
   */
  async updateGospelText(id: string, updates: Partial<GospelText>): Promise<GospelText> {
    const current = await this.getAllGospelTexts();
    const idx = current.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error('Gospel text entry not found');
    }

    const updatedEntry: GospelText = {
      ...current[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    current[idx] = updatedEntry;
    current.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
    await this.persistGospelTexts(current);
    this.cacheGospelTexts(current);
    return updatedEntry;
  },

  /**
   * Delete a Gospel text entry
   */
  async deleteGospelText(id: string): Promise<void> {
    const current = await this.getAllGospelTexts();
    const filtered = current.filter((t) => t.id !== id);
    await this.persistGospelTexts(filtered);
    this.cacheGospelTexts(filtered);
  },

  cacheGospelTexts(texts: GospelText[]) {
    try {
      localStorage.setItem('mizpah_gospel_texts_v1', JSON.stringify(texts));
    } catch (_) {}
  },

  async persistGospelTexts(texts: GospelText[]) {
    try {
      const settings = await siteSettingsService.getSiteSettings();
      const existingSocials = (settings?.social_links as any) || {};
      await siteSettingsService.saveSiteSettings(settings?.id, {
        social_links: {
          ...existingSocials,
          gospel_texts: texts,
        },
      });
    } catch (err) {
      console.warn('Failed to persist gospel texts to database:', err);
    }
  },
};
