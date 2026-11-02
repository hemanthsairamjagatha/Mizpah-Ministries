import { supabase } from './supabaseClient';
import type { HeroSection } from '../types/database.types';

export const heroService = {
  /**
   * Fetch published hero slides for public display
   */
  async getPublishedHeroSections(): Promise<HeroSection[]> {
    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Error fetching hero sections:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch all hero sections for admin management
   */
  async getAllHeroSections(): Promise<HeroSection[]> {
    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createHeroSection(section: Omit<HeroSection, 'id' | 'created_at' | 'updated_at'>): Promise<HeroSection> {
    const { data, error } = await supabase
      .from('hero_sections')
      .insert(section)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateHeroSection(id: string, updates: Partial<HeroSection>): Promise<HeroSection> {
    const { data, error } = await supabase
      .from('hero_sections')
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

  async deleteHeroSection(id: string): Promise<void> {
    const { error } = await supabase
      .from('hero_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
