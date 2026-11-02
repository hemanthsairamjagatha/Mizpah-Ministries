import { supabase } from './supabaseClient';
import type { ContactMessage } from '../types/database.types';
import type { ContactFormValues } from '../lib/validation';

// Simple in-memory client-side rate limit & duplicate prevention
let lastSubmissionTimestamp = 0;
let lastSubmissionHash = '';

export const contactService = {
  /**
   * Submit a contact message with basic anti-spam & duplicate prevention
   */
  async submitContactMessage(values: ContactFormValues): Promise<boolean> {
    const now = Date.now();
    // 1. Rate limiting: require at least 5 seconds between submissions
    if (now - lastSubmissionTimestamp < 5000) {
      throw new Error('Please wait a few seconds before submitting another inquiry.');
    }

    // 2. Duplicate submission prevention
    const currentHash = `${values.email.trim().toLowerCase()}_${values.subject.trim()}_${values.message.trim().substring(0, 30)}`;
    if (currentHash === lastSubmissionHash && (now - lastSubmissionTimestamp < 60000)) {
      throw new Error('You have already submitted this message recently. Thank you!');
    }

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone?.trim() || null,
        subject: values.subject.trim(),
        message: values.message.trim(),
        status: 'unread',
      });

    if (error) {
      console.error('Contact submission error:', error);
      throw new Error(error.message || 'Failed to send message. Please try again later.');
    }

    lastSubmissionTimestamp = now;
    lastSubmissionHash = currentHash;

    return true;
  },

  /**
   * Fetch all contact messages for admin with status filter and search query
   */
  async getContactMessages(statusFilter?: string, searchQuery?: string): Promise<ContactMessage[]> {
    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter as any);
    }

    if (searchQuery && searchQuery.trim()) {
      const term = `%${searchQuery.trim()}%`;
      query = query.or(`name.ilike.${term},email.ilike.${term},subject.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Update message status (unread, read, replied) and internal notes
   */
  async updateMessageStatus(
    id: string, 
    status: 'unread' | 'read' | 'replied',
    internalNotes?: string
  ): Promise<ContactMessage> {
    const updates: Partial<ContactMessage> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (internalNotes !== undefined) {
      updates.internal_notes = internalNotes;
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete message
   */
  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get unread count for badge
   */
  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'unread');

    if (error) return 0;
    return count || 0;
  },
};
