import { createClient } from '@supabase/supabase-js';

// Usamos las credenciales reales de tu Mega-Prompt para asegurar la conexión inmediata
const SUPABASE_URL = "https://nzwctnxfwoxtamytwebj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d2N0bnhmd294dGFteXR3ZWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTA3NTQsImV4cCI6MjA4NDA2Njc1NH0.ikvPTrtX8kOBVXb6ROPSfKGUekHZ8dSO_GpdK8zj5cI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Tip para el Coach: Al exportar 'supabase', cualquier componente podrá 
// usar Realtime para sincronizar el Nido al instante.
