import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface NestState {
  profile: any | null;
  nestId: string | null;
  familyMembers: any[];
  loading: boolean;
  fetchSession: () => Promise<void>;
  setNestId: (id: string) => void;
  signOut: () => Promise<void>;
}

export const useNestStore = create<NestState>((set) => ({
  profile: null,
  nestId: null,
  familyMembers: [],
  loading: true,

  fetchSession: async () => {
    set({ loading: true });
    
    // Obtenemos la sesión de auth
    const { data: { session } } = await supabase.auth.getSession();
    
    const loadTribeData = async (userId: string) => {
      // 1. Cargamos el perfil del Guía
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile && profile.nest_id) {
        // 2. Cargamos a todos los miembros del Nido (La Tribu)
        const { data: members } = await supabase
          .from('profiles')
          .select('*')
          .eq('nest_id', profile.nest_id)
          .order('role', { ascending: true });

        set({ 
          profile, 
          nestId: profile.nest_id, 
          familyMembers: members || [], 
          loading: false 
        });
      } else {
        // Si no hay perfil o nest_id, dejamos de cargar
        set({ profile: profile || null, loading: false });
      }
    };

    if (session?.user) {
      await loadTribeData(session.user.id);
    } else {
      set({ profile: null, nestId: null, familyMembers: [], loading: false });
    }

    // Escuchamos cambios en la sesión para mantener el frontend pegado al backend
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadTribeData(session.user.id);
      } else {
        set({ profile: null, nestId: null, familyMembers: [], loading: false });
      }
    });
  },

  setNestId: (id: string) => set({ nestId: id }),

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, familyMembers: [], loading: false });
    localStorage.clear();
    window.location.href = '/';
  },
}));
