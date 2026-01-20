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
    
    // Obtenemos sesión activa de Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    const loadProfileAndTribe = async (userId: string) => {
      // 1. Cargamos el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        // 2. Cargamos todos los miembros que compartan el mismo nest_id
        const { data: members, error: membersError } = await supabase
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
        console.log("✅ Sincronía de Nido activa:", profile.nest_id);
      } else {
        console.warn("⚠️ No se encontró perfil para el usuario");
        set({ loading: false });
      }
    };

    if (session?.user) {
      await loadProfileAndTribe(session.user.id);
    } else {
      set({ profile: null, nestId: null, familyMembers: [], loading: false });
    }

    // Listener para cambios en la autenticación (Login/Logout)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfileAndTribe(session.user.id);
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
