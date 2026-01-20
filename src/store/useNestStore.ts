import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface NestState {
  nestId: string | null;
  nestCode: string | null;
  members: any[];
  events: any[];
  loading: boolean;
  
  // Acciones
  initializeNest: (nestId: string) => Promise<void>;
  fetchMembers: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  subscribeToChanges: () => void;
}

export const useNestStore = create<NestState>((set, get) => ({
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: false,

  initializeNest: async (id) => {
    set({ nestId: id, loading: true });
    // Cargar código del nido
    const { data } = await supabase.from('nests').select('nest_code').eq('id', id).single();
    set({ nestCode: data?.nest_code || null });
    
    await get().fetchMembers();
    await get().fetchEvents();
    get().subscribeToChanges();
    set({ loading: false });
  },

  fetchMembers: async () => {
    const { nestId } = get();
    if (!nestId) return;
    const { data } = await supabase.from('profiles').select('*').eq('nest_id', nestId);
    set({ members: data || [] });
  },

  fetchEvents: async () => {
    const { nestId } = get();
    if (!nestId) return;
    const { data } = await supabase.from('events').select('*').eq('nest_id', nestId).order('start_time', { ascending: true });
    set({ events: data || [] });
  },

  subscribeToChanges: () => {
    const { nestId } = get();
    if (!nestId) return;

    // Suscripción Realtime para Miembros y Eventos
    supabase
      .channel('nest-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `nest_id=eq.${nestId}` }, () => get().fetchMembers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `nest_id=eq.${nestId}` }, () => get().fetchEvents())
      .subscribe();
  }
}));
