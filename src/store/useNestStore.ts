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
      
      // Ejecutamos en paralelo para mayor velocidad
      await Promise.all([get().fetchMembers(), get().fetchEvents()]);
      
      console.log("Sincronía KidUs: Nido y Miembros cargados.");
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
    
    if (error) {
      console.error("Error cargando miembros:", error);
      return;
    }
    set({ members: data || [] });
  },

  fetchEvents: async () => {
    const { nestId } = get();
    if (!nestId) return;

    // CORRECCIÓN: Añadimos el select con join para traer los perfiles
    // Esto evita el error 400 y permite que AgendaCard lea event.profiles
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:assigned_to (
          id,
          display_name,
          avatar_url,
          role,
          color
        )
      `)
      .eq('nest_id', nestId)
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error("Error cargando eventos:", error);
      // Si el error persiste, puede ser que la FK no esté configurada. 
      // En ese caso, hacemos fallback a un select simple para no romper la app:
      const { data: fallbackData } = await supabase.from('events').select('*').eq('nest_id', nestId);
      set({ events: fallbackData || [] });
      return;
    }

    set({ events: data || [] });
  }
}));
