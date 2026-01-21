import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useNestStore = create<any>((set, get) => ({
  profile: null,
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: true,

  fetchSession: async () => {
    set({ loading: true });
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        set({ profile: null, nestId: null, loading: false });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;

      if (profile) {
        set({ profile, nestId: profile.nest_id });
        if (profile.nest_id) {
          await get().initializeNest(profile.nest_id);
        }
      } else {
        set({ profile: null, nestId: null });
      }
    } catch (error) {
      console.error("Error en sincronía de sesión:", error);
    } finally {
      // Pequeño margen para asegurar que el estado se asiente
      setTimeout(() => {
        set({ loading: false });
      }, 500);
    }
  },

  initializeNest: async (id: string) => {
    try {
      const { data: nestData } = await supabase
        .from('nests')
        .select('nest_code')
        .eq('id', id)
        .maybeSingle();
        
      set({ nestCode: nestData?.nest_code || null });
      
      // Mantenemos la carga de datos que ya tenías
      await Promise.all([get().fetchMembers(), get().fetchEvents()]);
      get().subscribeToChanges();
    } catch (error) {
      console.error("Error inicializando nido:", error);
    }
  },

  fetchMembers: async () => {
    const { nestId } = get();
    if (!nestId) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('nest_id', nestId)
      .order('display_name', { ascending: true });
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

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, nestCode: null, members: [], events: [], loading: false });
  },

  subscribeToChanges: () => {
    const { nestId } = get();
    if (!nestId) return;
    supabase.removeAllChannels();
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
