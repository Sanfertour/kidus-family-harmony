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
  avatar_url?: string;
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
  fetchSession: () => Promise<void>;
  initializeNest: (nestId: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  subscribeToChanges: () => void;
  signOut: () => Promise<void>;
  setEvents: (events: EventData[]) => void; // Necesario para Realtime
}
