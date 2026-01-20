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
    // 1. Iniciamos carga
    set({ loading: true });

    // 2. Escuchador de Cambios de Auth (Vital para cuando vuelves a la pestaña/app)
    // Esto reacciona automáticamente si la sesión se recupera del localStorage
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Evento Auth: ${event}`);

      if (session?.user) {
        try {
          // Intentamos obtener el perfil con un pequeño reintento por si es login nuevo
          let { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          // Si no hay perfil (trigger SQL lento), esperamos 1 segundo y reintentamos
          if (!profile && !error) {
            await new Promise(res => setTimeout(res, 1200));
            const retry = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            profile = retry.data;
          }

          if (profile) {
            // Cargar miembros de la tribu si tiene nido
            let members: any[] = [];
            if (profile.nest_id) {
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('nest_id', profile.nest_id)
                .order('role', { ascending: true });
              members = data || [];
            }

            set({ 
              profile, 
              nestId: profile.nest_id, 
              familyMembers: members, 
              loading: false 
            });
          } else {
            // Caso borde: Sesión activa pero sin perfil en DB
            set({ profile: null, loading: false });
          }
        } catch (err) {
          console.error("❌ Error cargando perfil:", err);
          set({ loading: false });
        }
      } else {
        // No hay sesión
        set({ profile: null, nestId: null, familyMembers: [], loading: false });
      }
    });

    // 3. Verificación inicial de seguridad (Timeout)
    // Si en 5 segundos nada ha respondido, liberamos la UI
    setTimeout(() => {
      if (get().loading) {
        console.warn("⚠️ Timeout de seguridad: Desbloqueando UI");
        set({ loading: false });
      }
    }, 5000);
  },

  setNestId: (id: string) => set({ nestId: id }),

  signOut: async () => {
    try {
      set({ loading: true });
      await supabase.auth.signOut();
      // Limpieza profunda
      set({ profile: null, nestId: null, familyMembers: [], loading: false });
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error("Error al cerrar sesión", error);
      set({ loading: false });
    }
  },
}));
