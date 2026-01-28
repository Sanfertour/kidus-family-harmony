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

  // --- NUEVA LÓGICA DE SINCRONIZACIÓN A POSTERIORI ---
  updateNestId: async (code: string) => {
    try {
      set({ loading: true });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      // Llamada al backend (RPC) para vincular nuevo miembro
      const { data, error } = await supabase.rpc('link_member_to_nest_by_code', {
        target_code: code,
        user_uuid: session.user.id
      });

      if (error || !data) throw new Error(error?.message || "Código no válido");

      // Si tiene éxito, reiniciamos el estado con el nuevo nido
      set({ nestCode: code });
      await get().fetchSession(); // Esto recarga nestId, miembros y eventos automáticamente
      return true;
    } catch (e) {
      console.error("Error vinculando nido:", e);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  subscribeToEvents: (nestId: string) => {
    const channel = supabase
      .channel(`nest_events_${nestId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events', filter: `nest_id=eq.${nestId}` },
        () => {
          console.log("🔄 Sincronía Realtime activa");
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

    // Ajustado para evitar el error 400 si created_by no existe aún
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('nest_id', nestId)
      .order('start_time', { ascending: true });
    
    set({ events: data || [] });
  },

  setAiDraft: (data: any) => set({ aiDraftEvent: data }),
  clearAiDraft: () => set({ aiDraftEvent: null }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, nestCode: null, events: [], members: [] });
  }
}));
                                                                    
