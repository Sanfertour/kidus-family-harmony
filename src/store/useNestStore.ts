import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useNestStore = create<any>((set, get) => ({
  profile: null,
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: true, 
  initialized: false, // Nueva bandera para evitar re-ejecuciones innecesarias

  fetchSession: async () => {
    // Si ya está inicializado o cargando, no hacemos nada para evitar el bucle
    if (get().initialized && get().profile) {
      set({ loading: false });
      return;
    }

    set({ loading: true });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        set({ profile: null, nestId: null, loading: false, initialized: true });
        return;
      }

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
      
      set({ initialized: true });
    } catch (error) {
      console.error("Error en sincronía:", error);
    } finally {
      // Un solo cambio de estado al final para evitar parpadeos
      set({ loading: false });
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
      await Promise.all([get().fetchMembers(), get().fetchEvents()]);
      get().subscribeToChanges();
    } catch (error) {
      console.error("Error inicializando nido:", error);
    }
  },

  // ... resto de funciones (fetchMembers, fetchEvents, etc) iguales ...
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

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, nestCode: null, loading: false, initialized: false });
  }
}));
