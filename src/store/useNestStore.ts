import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useNestStore = create<any>((set, get) => ({
  profile: null,
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: true,
  initialized: false,

  fetchSession: async () => {
    // Evitamos re-ejecución si ya está inicializado
    if (get().initialized && get().profile) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ profile: null, loading: false, initialized: true });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profile) {
        set({ profile, nestId: profile.nest_id });
        if (profile.nest_id) {
          await get().initializeNest(profile.nest_id);
        }
      } else {
        // Usuario autenticado pero sin perfil en la tabla public (nuevo registro)
        set({ profile: null, nestId: null });
      }
    } catch (e) {
      console.error("Error en fetchSession:", e);
    } finally {
      // Garantizamos que la app "despierte"
      set({ loading: false, initialized: true });
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
      
      // Cargamos datos iniciales
      await Promise.all([get().fetchMembers(), get().fetchEvents()]);
      
      // ACTIVAMOS REALTIME (Vital para KidUs)
      get().subscribeToChanges();
    } catch (e) {
      console.error("Error inicializando nido:", e);
    }
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
    const { data } = await supabase.from('events').select('*').eq('nest_id', nestId);
    set({ events: data || [] });
  },

  // Suscripción Realtime para Sincronía total
  subscribeToChanges: () => {
    const { nestId } = get();
    if (!nestId) return;
    
    supabase.channel('nest-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `nest_id=eq.${nestId}` }, () => get().fetchEvents())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `nest_id=eq.${nestId}` }, () => get().fetchMembers())
      .subscribe();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, nestCode: null, members: [], events: [], loading: false, initialized: false });
  }
}));
