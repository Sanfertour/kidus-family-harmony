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
  // Estado para la IA: Almacena el borrador detectado en la circular
  aiDraftEvent: null, 

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
        // ACTIVAMOS REALTIME: Escucha cambios en eventos del Nido
        get().subscribeToEvents(profile.nest_id);
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
    } catch (e) {
      console.error("Error inicializando nido:", e);
    }
  },

  // SUSCRIPCIÓN EN TIEMPO REAL
  subscribeToEvents: (nestId: string) => {
    const channel = supabase
      .channel(`nest_events_${nestId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events', filter: `nest_id=eq.${nestId}` },
        () => {
          console.log("🔄 Sincronía: Cambio detectado en el Nido...");
          get().fetchEvents();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
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

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:assigned_to (id, display_name, avatar_url, role, color)
      `)
      .eq('nest_id', nestId)
      .order('start_time', { ascending: true });
    
    if (error) {
      // Fallback si la relación falla (Error 400)
      const { data: fallback } = await supabase.from('events').select('*').eq('nest_id', nestId).order('start_time', { ascending: true });
      set({ events: fallback || [] });
    } else {
      set({ events: data || [] });
    }
  },

  // --- MÓDULO IA / BOVEDA ---
  setAiDraft: (data: any) => {
    // Aquí volcamos lo que la IA "entiende" para pasarlo al Drawer
    set({ aiDraftEvent: data });
  },

  clearAiDraft: () => set({ aiDraftEvent: null }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, nestCode: null, events: [], members: [] });
  }
}));
