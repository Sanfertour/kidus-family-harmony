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

export const useNestStore = create<NestState>((set, get) => ({
  profile: null,
  nestId: null,
  familyMembers: [],
  loading: true,

  fetchSession: async () => {
    set({ loading: true });
    
    // 1. Obtener sesión actual
    const { data: { session } } = await supabase.auth.getSession();
    
    const loadData = async (userId: string) => {
      // 2. Obtener Perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        // 3. Obtener Miembros del Nido automáticamente
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
        set({ loading: false });
      }
    };

    if (session?.user) {
      await loadData(session.user.id);
    } else {
      set({ profile: null, nestId: null, familyMembers: [], loading: false });
    }

    // Listener para cambios de estado
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadData(session.user.id);
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
