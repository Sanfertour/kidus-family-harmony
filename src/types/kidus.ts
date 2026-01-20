/**
 * PILARES KIDUS:
 * 1. Cerebro Compartido: Tipado estricto para evitar fallos de lógica.
 * 2. Autonomía: Soporte nativo para is_private.
 * 3. Alerta Naranja: Sistema de conflictos integrado.
 */

export type KidUsCategory = "school" | "activity" | "medical" | "family" | "work" | "meal";
export type UserRole = "autonomous" | "dependent"; // Guía o Tribu

export interface NestMember {
  id: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string;
  color?: string; // Color asignado para la UI (Estética Brisa)
  nest_id: string;
}

// Interfaz para la lógica de negocio en el Frontend
export interface KidUsEvent {
  id: string;
  nest_id: string;
  title: string;
  description?: string;
  start_time: string; // ISO String
  end_time?: string;   // ISO String
  location?: string;
  category: KidUsCategory;
  
  // LOGÍSTICA
  created_by: string;    // ID del Guía que lo creó
  assigned_to?: string;  // ID del miembro de la Tribu o Guía responsable
  
  // ESTADOS
  is_private: boolean;   // Si es true, otros Guías solo ven "Ocupado"
  
  // UI Y DINÁMICAS (Propiedades calculadas en el Front)
  has_conflict?: boolean; 
  conflict_with?: string[]; 
}

// --- MAPEO DE BASE DE DATOS (SUPABASE) ---
// Úsalo para los tipos de retorno de las queries de Supabase
export interface DbEvent {
  id: string;
  nest_id: string;
  created_by: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  category: KidUsCategory;
  assigned_to: string | null;
  is_private: boolean;
  created_at: string;
}

// Estructura para la Alerta Naranja (Detección de colisiones)
export interface ConflictInfo {
  eventId: string;
  conflictingEventIds: string[];
  message: string;
  isPrivateConflict: boolean; // Indica si el choque es con un evento oculto
}
