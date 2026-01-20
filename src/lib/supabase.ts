import { createClient } from '@supabase/supabase-js';

// Usamos el objeto global de Vite para capturar las variables de Netlify
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación de seguridad para que sepas en la consola si fallan las llaves
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "🚨 KidUs Error: No se detectan las variables de entorno de Supabase. " +
    "Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén en Netlify."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
