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
    // Evitamos dobles llamadas innecesarias si ya está cargando
    set({ loading: true });
    
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) throw authError;

      // Si no hay sesión, reseteamos todo y liberamos la UI
      if (!session?.user) {
        set({ profile: null, nestId: null, familyMembers: [], loading: false });
        return;
      }

      // 1. Obtener Perfil (Gracias al Trigger SQL, esto debería existir)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      // 2. Manejo de Usuario Nuevo (Sin perfil en DB todavía)
      if (!profile) {
        console.warn("⚠️ Perfil no encontrado. Reintenta o verifica Trigger SQL.");
        set({ profile: null, nestId: null, loading: false });
        return;
      }

      // 3. Carga de datos del Nido
      let members: any[] = [];
      if (profile.nest_id) {
        const { data, error: membersError } = await supabase
          .from('profiles')
          .select('*')
          .eq('nest_id', profile.nest_id)
          .order('role', { ascending: true });
        
        if (!membersError) members = data || [];
      }

      // 4. ACTUALIZACIÓN ÚNICA (Para evitar múltiples re-renders)
      set({ 
        profile, 
        nestId: profile.nest_id || null,
        familyMembers: members,
        loading: false 
      });

    } catch (error) {
      console.error("🚨 Error Crítico en NestStore:", error);
      set({ loading: false, profile: null, nestId: null });
    } finally {
      // Doble check de seguridad para liberar la pantalla de Sincronía
      setTimeout(() => set({ loading: false }), 100); 
    }
  },

  setNestId: (id: string) => set({ nestId: id }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ profile: null, nestId: null, familyMembers: [], loading: false });
      // Limpieza total para evitar fugas de memoria
      localStorage.clear();
      window.location.href = '/'; 
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  },
}));
