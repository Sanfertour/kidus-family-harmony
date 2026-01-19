import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface NestState {
  profile: any | null;
  nestId: string | null;
  familyMembers: any[];
  isLoading: boolean;
  
  // Acciones
  fetchSession: () => Promise<void>;
  setNestId: (id: string) => void;
  signOut: () => Promise<void>;
}

export const useNestStore = create<NestState>((set, get) => ({
  profile: null,
  nestId: null,
  familyMembers: [],
  isLoading: true,

  fetchSession: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          set({ profile, nestId: profile.nest_id });
          
          if (profile.nest_id) {
            const { data: members } = await supabase
              .from('profiles')
              .select('*')
              .eq('nest_id', profile.nest_id)
              .order('role', { ascending: true });
            
            set({ familyMembers: members || [] });
          }
        }
      }
    } catch (error) {
      console.error("Error en la bóveda de datos:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setNestId: (id: string) => set({ nestId: id }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, familyMembers: [], isLoading: false });
  },
}));
