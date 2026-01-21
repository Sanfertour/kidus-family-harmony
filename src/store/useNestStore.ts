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
    // Si ya sabemos quién es el usuario, no volvemos a mostrar la pantalla de carga
    if (get().initialized) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ profile: null, loading: false, initialized: true });
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
    } catch (e) {
      console.error(e);
    } finally {
      // Solo aquí apagamos el loading y marcamos como inicializado
      set({ loading: false, initialized: true });
    }
  },

  initializeNest: async (id: string) => {
    const { data: nestData } = await supabase
      .from('nests')
      .select('nest_code')
      .eq('id', id)
      .maybeSingle();
      
    set({ nestCode: nestData?.nest_code || null });
    await Promise.all([get().fetchMembers(), get().fetchEvents()]);
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
