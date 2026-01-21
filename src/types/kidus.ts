// src/types/kidus.ts

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
  assigned_to?: string; // ID del profile
  created_at?: string;
  created_by?: string; // ID del profile que lo creó
}

export interface Profile {
  id: string;
  nest_id: string | null;
  role: UserRole;
  display_name: string;
  avatar_url?: string; // Usado para el color/avatar en la UI
}

export interface Nest {
  id: string;
  nest_code: string; // El KID-XXXXX
  name: string;
  created_at: string;
}

// Para la detección de conflictos
export interface ConflictInfo {
  eventId: string;
  conflictingEventIds: string[];
  message: string;
  isPrivateConflict: boolean;
}

// Estado global del Store (Zustand)
export interface NestState {
  profile: Profile | null;
  nestId: string | null;
  nestCode: string | null;
  members: Profile[];
  events: EventData[];
  loading: boolean;
  fetchSession: () => Promise<void>;
  initializeNest: (nestId: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  subscribeToChanges: () => void;
  signOut: () => Promise<void>;
}
