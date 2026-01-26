export type UserRole = 'autonomous' | 'dependent';

export interface EventData {
  id: string;
  nest_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_private: boolean;
  category: 'school' | 'meal' | 'health' | 'activity' | 'other';
  assigned_to?: string; 
  created_at?: string;
  created_by?: string;
}

export interface Profile {
  id: string;
  nest_id: string | null;
  role: UserRole;
  display_name: string;
  avatar_url?: string; // Aquí vendrá la URL de Google para los Guías
  color: string | null;   // <-- CRÍTICO: Esto soluciona el error TS2339 en Vercel
}

export interface Nest {
  id: string;
  nest_code: string; 
  name: string;
  created_at: string;
}

export interface NestState {
  profile: Profile | null;
  nestId: string | null;
  nestCode: string | null;
  members: Profile[];
  events: EventData[];
  loading: boolean;
  initialized: boolean; // Añadido para controlar el estado de carga inicial
  fetchSession: () => Promise<void>;
  initializeNest: (nestId: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  subscribeToChanges: () => () => void; // Cambiado para permitir limpieza del useEffect
  signOut: () => Promise<void>;
  setEvents: (events: EventData[]) => void;
}
