import { supabase } from './supabaseClient';
import { siteSettingsService } from './siteSettingsService';
import type { Campus } from '../types/database.types';

const STORAGE_KEY = 'mizpah_campuses_v1';

// Helper to generate UUID
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'campus_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

const DEFAULT_MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=MIZPAH+MINISTRIES+NO+1+KR+COLONY+PODILI+ROAD+KANIGIRI+MARKAPURAM+ANDHRA+PRADESH+INDIA+523230';

const DEFAULT_SANCTUARY_CAMPUS: Campus = {
  id: 'main-sanctuary',
  name: 'Mizpah Ministries Headquarters',
  address: `MIZPAH MINISTRIES 
NO:1 KR COLONY,
PODILI ROAD, KANIGIRI,
MARKAPURAM (D)
ANDHRA PRADESH
INDIA. PIN-523230`,
  phone: '',
  email: '',
  campus_page_name: '',
  campus_page_url: '',
  map_url: '',
  is_primary: true,
  is_published: true,
  sort_order: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const campusService = {
  /**
   * Fetch all campuses (for admin manager)
   */
  async getAllCampuses(): Promise<Campus[]> {
    // 1. Try querying the dedicated 'campuses' table first
    try {
      const { data, error } = await (supabase as any)
        .from('campuses')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const list = data as unknown as Campus[];
        this.cacheLocal(list);
        return list;
      }
    } catch (_) {
      // Ignore table missing error and fallback to site_settings
    }

    // 2. Fallback: Read from site_settings.social_links.campuses
    try {
      const settings = await siteSettingsService.getSiteSettings();
      const campuses = (settings?.social_links as any)?.campuses;
      if (Array.isArray(campuses)) {
        this.cacheLocal(campuses);
        return campuses;
      }
    } catch (err) {
      console.warn('Could not fetch campuses from site settings:', err);
    }

    // 3. Fallback: Read local cache
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}

    return [DEFAULT_SANCTUARY_CAMPUS];
  },

  /**
   * Fetch only published campuses (for public Contact page)
   */
  async getPublishedCampuses(): Promise<Campus[]> {
    const all = await this.getAllCampuses();
    return all.filter((c) => c.is_published !== false);
  },

  /**
   * Create a new campus
   */
  async createCampus(
    data: Omit<Campus, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Campus> {
    const newCampus: Campus = {
      ...data,
      id: generateId(),
      is_primary: !!data.is_primary,
      is_published: data.is_published !== false,
      sort_order: data.sort_order ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 1. Try dedicated table
    try {
      const { data: inserted, error } = await (supabase as any)
        .from('campuses')
        .insert(newCampus)
        .select()
        .single();

      if (!error && inserted) {
        const result = inserted as unknown as Campus;
        const all = await this.getAllCampuses();
        this.cacheLocal(all);
        return result;
      }
    } catch (_) {}

    // 2. Fallback to site_settings
    const current = await this.getAllCampuses();
    // If setting as primary, unset others
    const updatedList = newCampus.is_primary
      ? current.map((c) => ({ ...c, is_primary: false }))
      : [...current];

    updatedList.push(newCampus);
    await this.persistToSettings(updatedList);
    this.cacheLocal(updatedList);

    return newCampus;
  },

  /**
   * Update an existing campus
   */
  async updateCampus(id: string, updates: Partial<Campus>): Promise<Campus> {
    const now = new Date().toISOString();

    // 1. Try dedicated table
    try {
      const { data: updated, error } = await (supabase as any)
        .from('campuses')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        const result = updated as unknown as Campus;
        const all = await this.getAllCampuses();
        this.cacheLocal(all);
        return result;
      }
    } catch (_) {}

    // 2. Fallback to site_settings
    const current = await this.getAllCampuses();
    const updatedList = current.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          updated_at: now,
        };
      }
      // If marking as primary, unmark others
      if (updates.is_primary) {
        return { ...item, is_primary: false };
      }
      return item;
    });

    await this.persistToSettings(updatedList);
    this.cacheLocal(updatedList);

    const found = updatedList.find((c) => c.id === id);
    if (!found) throw new Error('Campus not found');
    return found;
  },

  /**
   * Delete a campus
   */
  async deleteCampus(id: string): Promise<void> {
    // 1. Try dedicated table
    try {
      const { error } = await (supabase as any)
        .from('campuses')
        .delete()
        .eq('id', id);

      if (!error) {
        const all = await this.getAllCampuses();
        this.cacheLocal(all);
        return;
      }
    } catch (_) {}

    // 2. Fallback to site_settings
    const current = await this.getAllCampuses();
    const updatedList = current.filter((item) => item.id !== id);

    await this.persistToSettings(updatedList);
    this.cacheLocal(updatedList);
  },

  /**
   * Set a campus as primary
   */
  async setPrimaryCampus(id: string): Promise<Campus> {
    return this.updateCampus(id, { is_primary: true });
  },

  /**
   * Toggle published status
   */
  async togglePublish(id: string, is_published: boolean): Promise<Campus> {
    return this.updateCampus(id, { is_published });
  },

  /**
   * Helper: Persist list of campuses into site_settings.social_links.campuses
   */
  async persistToSettings(campuses: Campus[]): Promise<void> {
    const settings = await siteSettingsService.getSiteSettings();
    const currentSocials = (settings?.social_links as any) || {};

    await siteSettingsService.saveSiteSettings(settings?.id, {
      social_links: {
        ...currentSocials,
        campuses,
      },
      church_name: settings?.church_name || 'Mizpah Ministries',
    });
  },

  cacheLocal(campuses: Campus[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campuses));
    } catch (_) {}
  },
};
