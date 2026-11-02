import { supabase } from './supabaseClient';
import type { Founder } from '../types/database.types';

export const founderService = {
  /**
   * Get primary published founder for public website
   */
  async getPrimaryFounder(): Promise<Founder | null> {
    // First try primary published
    let { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('is_published', true)
      .eq('is_primary', true)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      // Fallback to any published founder
      const { data: fallbackData } = await supabase
        .from('founders')
        .select('*')
        .eq('is_published', true)
        .limit(1)
        .maybeSingle();
      return fallbackData || null;
    }

    return data;
  },

  /**
   * Fetch all founders for admin management
   */
  async getAllFounders(): Promise<Founder[]> {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createFounder(founder: Omit<Founder, 'id' | 'created_at' | 'updated_at'>): Promise<Founder> {
    // If setting as primary, demote other primaries first
    if (founder.is_primary) {
      await supabase
        .from('founders')
        .update({ is_primary: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await supabase
      .from('founders')
      .insert(founder)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFounder(id: string, updates: Partial<Founder>): Promise<Founder> {
    // If setting as primary, demote others
    if (updates.is_primary) {
      await supabase
        .from('founders')
        .update({ is_primary: false })
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('founders')
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

  async deleteFounder(id: string): Promise<void> {
    const { error } = await supabase
      .from('founders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
