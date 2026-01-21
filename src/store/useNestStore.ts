import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export const useNestStore = create<any>((set, get) => ({
  profile: null,
  nestId: null,
  nestCode: null,
  members: [],
  events: [],
  loading: true, // Empezamos en true para evitar parpadeos

  fetchSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        set({ profile: null, loading: false });
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
    } catch (error) {
      console.error("Error en sincronía:", error);
    } finally {
      set({ loading: false });
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
    get().subscribeToChanges();
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
