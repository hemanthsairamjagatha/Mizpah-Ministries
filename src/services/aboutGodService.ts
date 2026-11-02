import { supabase } from './supabaseClient';
import { slugify } from '../lib/utils';
import type { AboutGodCard } from '../types/database.types';

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
};
