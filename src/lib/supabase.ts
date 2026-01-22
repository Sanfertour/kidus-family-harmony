import { createClient } from '@supabase/supabase-js';

// KidUs utiliza variables de entorno estándar de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación de seguridad para el desarrollador
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Error de Configuración: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas en el .env o en Netlify."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true // CRÍTICO: Para capturar el token de Google al volver a la app
  }
});
