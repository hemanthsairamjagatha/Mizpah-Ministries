import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rwyqybnlksnrkappnspo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3eXF5Ym5sa3NucmthcHBuc3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNjU4ODgsImV4cCI6MjEwODc0MTg4OH0.FvZ3UWLscZCRSSxJGW558eQIsNb_kb-n8chaJobwFTU';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
