import { createClient } from '@supabase/supabase-auth-helpers-react'; // O el que uses
import { createClient as createSimpleClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createSimpleClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true // ESTO ES CRÍTICO
  }
});
