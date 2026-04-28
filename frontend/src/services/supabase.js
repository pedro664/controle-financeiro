import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zsecddvaixboqgqgcodg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZWNkZHZhaXhib3FncWdjb2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTE0NDIsImV4cCI6MjA5MDgyNzQ0Mn0.VP-Y11zira5DFnykd30FJXgQjJ_sVTURjAIFKxpR7XA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
