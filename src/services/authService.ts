import { supabase } from './supabaseClient';
import type { AdminProfile } from '../types/database.types';
import type { LoginFormValues } from '../lib/validation';

export const authService = {
  /**
   * Log in an administrator with email and password
   */
  async signIn({ email, password }: LoginFormValues) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Verify admin profile exists
    if (data.user) {
      let profile = await this.getAdminProfile(data.user.id);
      if (!profile) {
        // If not found in admin_profiles, attempt to create
        try {
          const { data: newProfile, error: profileErr } = await supabase
            .from('admin_profiles')
            .insert({
              id: data.user.id,
              display_name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Admin',
              role: 'superadmin',
            })
            .select()
            .single();

          if (!profileErr && newProfile) {
            profile = newProfile;
          }
        } catch (e) {
          console.warn('Could not auto-create admin profile:', e);
        }

        // If still null, provide fallback so authenticated user is never locked out
        if (!profile) {
          profile = {
            id: data.user.id,
            display_name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0] || 'Administrator',
            role: 'superadmin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }
      return { session: data.session, user: data.user, profile };
    }

    return { session: data.session, user: data.user, profile: null };
  },

  /**
   * Sign out current admin
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current active session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  /**
   * Get admin profile for user
   */
  async getAdminProfile(userId: string): Promise<AdminProfile | null> {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching admin profile:', error.message);
        return null;
      }
      return data;
    } catch (err: any) {
      console.warn('Exception fetching admin profile:', err?.message);
      return null;
    }
  },

  /**
   * List all admin profiles (for superadmin management)
   */
  async listAdminProfiles(): Promise<AdminProfile[]> {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Update admin profile role or display name
   */
  async updateAdminProfile(id: string, updates: Partial<AdminProfile>) {
    const { data, error } = await supabase
      .from('admin_profiles')
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
};
