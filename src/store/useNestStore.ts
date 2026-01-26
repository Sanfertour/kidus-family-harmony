import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useNestStore = create<any>((set, get) => ({
  profile: null,
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: false,
  initialized: false,

  fetchSession: async () => {
    if (get().loading) return;
    try {
      set({ loading: true });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ profile: null, nestId: null, initialized: true, loading: false });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) throw error;

      set({ 
        profile, 
        nestId: profile.nest_id,
        initialized: true 
      });

      if (profile.nest_id) {
        await get().initializeNest(profile.nest_id);
      }
    } catch (e) {
      console.error("Error en sesión:", e);
    } finally {
      set({ loading: false });
    }
  },

  initializeNest: async (id: string) => {
    if (!id || id === 'undefined') return;
    try {
      const { data: nestData } = await supabase
        .from('nests')
        .select('nest_code')
        .eq('id', id)
        .single();
        
      set({ nestCode: nestData?.nest_code || null });
      await Promise.all([get().fetchMembers(), get().fetchEvents()]);
      console.log("Sincronía KidUs: Nido cargado con éxito.");
    } catch (e) {
      console.error("Error inicializando nido:", e);
    }
  },

  fetchMembers: async () => {
    const { nestId } = get();
    if (!nestId) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('nest_id', nestId);
    
    if (!error) set({ members: data || [] });
  },

  fetchEvents: async () => {
    const { nestId } = get();
    if (!nestId) return;

    try {
      // Intentamos query con Join (Optimizado)
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:assigned_to (
            id,
            display_name,
            avatar_url,
            color
          )
        `)
        .eq('nest_id', nestId)
        .order('start_time', { ascending: true });
      
      if (error) {
        // Fallback si la relación FK falla (Evita error 400)
        const { data: fallbackData } = await supabase
          .from('events')
          .select('*')
          .eq('nest_id', nestId)
          .order('start_time', { ascending: true });
        set({ events: fallbackData || [] });
      } else {
        set({ events: data || [] });
      }
    } catch (e) {
      console.error("Error en fetchEvents:", e);
    }
  }
}));
