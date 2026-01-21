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
    try {
      set({ loading: true });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No hay sesión activa");
        set({ profile: null, loading: false, initialized: true });
        return;
      }

      console.log("Sesión detectada para:", session.user.id);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error("Error al obtener perfil:", error.message);
        // Si hay sesión pero no perfil, es que el trigger falló o RLS bloquea
        set({ profile: null, loading: false, initialized: true });
        return;
      }

      console.log("Perfil cargado:", profile);
      set({ 
        profile, 
        nestId: profile.nest_id, 
        loading: false, 
        initialized: true 
      });

      if (profile.nest_id) {
        await get().initializeNest(profile.nest_id);
      }
    } catch (e) {
      console.error("Fallo crítico en fetchSession:", e);
      set({ loading: false, initialized: true });
    }
  },

  initializeNest: async (id: string) => {
    try {
      const { data: nestData } = await supabase
        .from('nests')
        .select('nest_code')
        .eq('id', id)
        .single();
        
      set({ nestCode: nestData?.nest_code || null });
      await Promise.all([get().fetchMembers(), get().fetchEvents()]);
      console.log("Nido sincronizado correctamente");
    } catch (e) {
      console.error("Error al inicializar nido:", e);
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
  }
}));
