import { supabase } from './supabaseClient';
import type { Sermon } from '../types/database.types';

export const sermonService = {
  /**
   * Fetch published sermons for public website, newest first
   */
  async getPublishedSermons(limit?: number): Promise<Sermon[]> {
    let query = supabase
      .from('sermons')
      .select('*')
      .eq('is_published', true)
      .order('sermon_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching sermons:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch all sermons for admin with optional search filter
   */
  async getAllSermons(search?: string): Promise<Sermon[]> {
    let query = supabase
      .from('sermons')
      .select('*')
      .order('sermon_date', { ascending: false });

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(`title.ilike.${term},pastor_name.ilike.${term},description.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createSermon(sermon: Omit<Sermon, 'id' | 'created_at' | 'updated_at'>): Promise<Sermon> {
    const { data, error } = await supabase
      .from('sermons')
      .insert(sermon)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSermon(id: string, updates: Partial<Sermon>): Promise<Sermon> {
    const { data, error } = await supabase
      .from('sermons')
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

  async deleteSermon(id: string): Promise<void> {
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
