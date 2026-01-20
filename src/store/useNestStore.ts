export const useNestStore = create<NestState>((set, get) => ({
  profile: null,
  nestId: null,
  familyMembers: [],
  loading: true,

  fetchSession: async () => {
    set({ loading: true });
    
    // Obtenemos la sesión actual de forma inmediata
    const { data: { session } } = await supabase.auth.getSession();
    
    const loadProfileData = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        // CARGA DE MIEMBROS: Punto 1 corregido (Filtro por nest_id)
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
      await loadProfileData(session.user.id);
    } else {
      set({ loading: false, profile: null, nestId: null, familyMembers: [] });
    }

    // Mantenemos el listener para cambios de sesión
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfileData(session.user.id);
      } else {
        set({ profile: null, nestId: null, familyMembers: [], loading: false });
      }
    });
  },
  // ... resto de funciones (setNestId, signOut) se mantienen igual
}));
