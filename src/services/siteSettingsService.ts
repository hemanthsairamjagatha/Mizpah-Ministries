import { supabase } from './supabaseClient';
import type { SiteSettings } from '../types/database.types';

export const siteSettingsService = {
  async getSiteSettings(): Promise<SiteSettings | null> {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching site settings:', error.message);
      return null;
    }
    return data;
  },

  async updateSiteSettings(id: string, updates: Partial<SiteSettings>): Promise<SiteSettings> {
    const { data, error } = await supabase
      .from('site_settings')
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

  async saveSiteSettings(id: string | undefined, updates: Partial<SiteSettings>): Promise<SiteSettings> {
    if (id) {
      return this.updateSiteSettings(id, updates);
    }
    const { data, error } = await supabase
      .from('site_settings')
      .insert({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
