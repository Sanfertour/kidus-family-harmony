import { create } from 'zustand';
import { supabase } from '@/lib/supabase'; // Asegúrate de que esta ruta es la correcta

interface NestState {
  profile: any | null;
  nestId: string | null;
  familyMembers: any[];
  loading: boolean; // Cambiado de isLoading a loading para match con App.tsx
  
  fetchSession: () => Promise<void>;
  setNestId: (id: string) => void;
  signOut: () => Promise<void>;
}

export const useNestStore = create<NestState>((set) => ({
  profile: null,
  nestId: null,
  familyMembers: [],
  loading: true, // Cambiado para match con App.tsx

  fetchSession: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          // Actualizamos el estado con lo que viene de la DB
          set({ 
            profile, 
            nestId: profile.nest_id,
            loading: false 
          });
          
          if (profile.nest_id) {
            const { data: members } = await supabase
              .from('profiles')
              .select('*')
              .eq('nest_id', profile.nest_id)
              .order('role', { ascending: true });
            
            set({ familyMembers: members || [] });
          }
        } else {
          set({ loading: false });
        }
      } else {
        set({ profile: null, nestId: null, loading: false });
      }
    } catch (error) {
      console.error("Error en la sincronía del Nido:", error);
      set({ loading: false });
    }
  },

  setNestId: (id: string) => set({ nestId: id }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ profile: null, nestId: null, familyMembers: [], loading: false });
  },
}));
