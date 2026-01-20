import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { NestMember, UserRole } from '@/types/kidus';

interface NestState {
  profile: NestMember | null;
  nestId: string | null;
  familyMembers: NestMember[];
  loading: boolean;
  fetchSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useNestStore = create<NestState>((set, get) => ({
  profile: null,
  nestId: null,
  familyMembers: [],
  loading: true,

  fetchSession: async () => {
    // Si ya estamos cargando, no duplicamos esfuerzo
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      set({ profile: null, nestId: null, familyMembers: [], loading: false });
      return;
    }

    try {
      // 1. Cargamos el perfil (Mapeando a los nombres de columna del SQL)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, role, avatar_url, nest_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData && profileData.nest_id) {
        // 2. Cargamos a toda la Tribu del Nido
        const { data: members, error: membersError } = await supabase
          .from('profiles')
          .select('id, display_name, role, avatar_url, nest_id')
          .eq('nest_id', profileData.nest_id)
          .order('role', { ascending: true });

        if (membersError) throw membersError;

        set({ 
          profile: profileData as NestMember, 
          nestId: profileData.nest_id, 
          familyMembers: (members || []) as NestMember[], 
          loading: false 
        });
      } else {
        set({ profile: (profileData as NestMember) || null, nestId: null, loading: false });
      }
    } catch (error) {
      console.error("Error en NestStore:", error);
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, familyMembers: [], loading: false });
    localStorage.clear();
    window.location.href = '/';
  },
}));
