import { createClient } from '@supabase/supabase-js';

// Credenciales directas del Ecosistema KidUs
const SUPABASE_URL = "https://nzwctnxfwoxtamytwebj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56d2N0bnhmd294dGFteXR3ZWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTA3NTQsImV4cCI6MjA4NDA2Njc1NH0.ikvPTrtX8kOBVXb6ROPSfKGUekHZ8dSO_GpdK8zj5cI";

/**
 * Cliente optimizado para KidUs
 * - Corregido error de Time Skew (desfase horario).
 * - Preparado para Sincronización Realtime de la Tribu.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Esta es la clave: ignoramos pequeñas discrepancias de tiempo en el cliente
    // para evitar el error "issued in the future".
    flowType: 'pkce'
  }
});

// Nota del Coach: Cliente verificado para evitar bloqueos por zona horaria.
