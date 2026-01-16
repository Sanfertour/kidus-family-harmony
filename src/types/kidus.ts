// KidUs Core Types - Optimización "El Nido"

export interface NestMember {
  id: string;
  name: string;
  role: "adult" | "child";
  color: string;
  avatar?: string;
  school?: string;
  grade?: string;
  class?: string;
  custodyDays?: number[]; 
}

export interface EventData {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  // Interesado (Sujeto): Define el color de la tarjeta
  memberId: string;
  memberName: string;
  memberColor: string;
  // Tipo de evento (Incluye 'meal' para automatización de menús)
  type: "school" | "activity" | "medical" | "family" | "work" | "meal";
  // Responsable (Logística): El adulto que gestiona
  assignedToId?: string;
  assignedToName?: string;
  notes?: string;
  // Alerta Naranja: Detección de colisiones
  hasConflict?: boolean;
  conflictWith?: string[];
  // Modo Privado/Sorpresa: Oculta detalles al resto
  isPrivate?: boolean;
}

// Estructura para la Alerta Naranja
export interface ConflictInfo {
  eventId: string;
  conflictingEventIds: string[];
  message: string;
  isPrivateConflict: boolean; // Indica si el choque es con un evento oculto
}

// --- Tipos de Base de Datos (Mapeo directo a Supabase) ---

export interface DbEvent {
  id: string;
  nest_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  member_id: string; // Interesado
  assigned_to_id?: string; // Responsable
  type: "school" | "activity" | "medical" | "family" | "work" | "meal";
  notes?: string;
  is_private: boolean;
  created_at: string;
}
