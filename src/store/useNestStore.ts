import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface NestState {
  profile: any | null;
  nestId: string | null;
  nestCode: string | null;
  members: any[];
  events: any[];
  loading: boolean;
  
  // Acciones
  fetchSession: () => Promise<void>;
  initializeNest: (nestId: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  subscribeToChanges: () => void;
}

export const useNestStore = create<NestState>((set, get) => ({
  profile: null,
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: false,

  fetchSession: async () => {
    set({ loading: true });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profile) {
        set({ profile, nestId: profile.nest_id });
        if (profile.nest_id) {
          await get().initializeNest(profile.nest_id);
        }
      }
    }
    set({ loading: false });
  },

  initializeNest: async (id) => {
    set({ nestId: id, loading: true });
    
    // Cargar datos básicos del nido
    const { data: nestData } = await supabase
      .from('nests')
      .select('nest_code')
      .eq('id', id)
      .maybeSingle();
      
    set({ nestCode: nestData?.nest_code || null });
    
    // Cargas paralelas para velocidad
    await Promise.all([
      get().fetchMembers(),
      get().fetchEvents()
    ]);
    
    get().subscribeToChanges();
    set({ loading: false });
  },

  fetchMembers: async () => {
    const { nestId } = get();
    if (!nestId) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('nest_id', nestId);
    set({ members: data || [] });
  },

  fetchEvents: async () => {
    const { nestId } = get();
    if (!nestId) return;
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('nest_id', nestId)
      .order('start_time', { ascending: true });
    set({ events: data || [] });
  },

  subscribeToChanges: () => {
    const { nestId } = get();
    if (!nestId) return;

    // Suscripción única multicanal
    supabase
      .channel('nest-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles', filter: `nest_id=eq.${nestId}` }, 
        () => get().fetchMembers()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events', filter: `nest_id=eq.${nestId}` }, 
        () => get().fetchEvents()
      )
      .subscribe();
  }
}));
