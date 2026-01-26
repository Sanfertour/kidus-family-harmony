import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useNestStore = create<any>((set, get) => ({
  profile: null,
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: false, // Empezamos en false para evitar parpadeos innecesarios
  initialized: false,

  fetchSession: async () => {
    // Evitar múltiples llamadas si ya se está cargando
    if (get().loading) return;

    try {
      set({ loading: true });
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ profile: null, nestId: null, nestCode: null, loading: false, initialized: true });
        return;
      }

      // Solo pedimos el perfil si no lo tenemos o si el ID ha cambiado
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error || !profile) {
        set({ profile: null, loading: false, initialized: true });
        return;
      }

      set({ 
        profile, 
        nestId: profile.nest_id, 
        initialized: true 
      });

      if (profile.nest_id) {
        // Ejecutamos la inicialización del nido solo si tenemos ID
        await get().initializeNest(profile.nest_id);
      }
    } catch (e) {
      console.error("Fallo crítico en fetchSession:", e);
    } finally {
      set({ loading: false });
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
      
      // Lanzamos las cargas en paralelo para mayor velocidad
      await Promise.all([get().fetchMembers(), get().fetchEvents()]);
      
      console.log("Sincronía KidUs: Nido listo.");
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
    const { data } = await supabase.from('events').select('*').eq('nest_id', nestId).order('start_time', { ascending: true });
    set({ events: data || [] });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, nestCode: null, members: [], events: [] });
  }
}));
