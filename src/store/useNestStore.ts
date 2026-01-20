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
    // Iniciamos la sincronía
    set({ loading: true });
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) throw authError;

      if (!session?.user) {
        set({ profile: null, nestId: null, familyMembers: [], loading: false });
        return;
      }

      // 1. Obtener Perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // 2. Si no hay perfil aún (usuario nuevo), limpiamos y soltamos el loading
      if (!profile) {
        set({ profile: null, nestId: null, familyMembers: [], loading: false });
        return;
      }

      // 3. Si hay perfil, actualizamos datos básicos inmediatamente
      set({ 
        profile, 
        nestId: profile.nest_id,
      });

      // 4. Si tiene nido, cargamos la Tribu (Miembros)
      if (profile.nest_id) {
        const { data: members, error: membersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('nest_id', profile.nest_id)
          .order('role', { ascending: true });
        
        if (!membersError) {
          set({ familyMembers: members || [] });
        }
      }

    } catch (error) {
      console.error("🚨 Error Crítico en NestStore:", error);
    } finally {
      // Pase lo que pase, el loading DEBE terminar aquí para liberar la UI
      set({ loading: false });
    }
  },

  setNestId: (id: string) => set({ nestId: id }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      set({ profile: null, nestId: null, familyMembers: [], loading: false });
    }
  },
}));
