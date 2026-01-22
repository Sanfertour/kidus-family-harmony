import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { NestState, Profile, EventData } from "@/types/kidus";

type InternalState = NestState & { _fetchCounter?: number };

export const useNestStore = create<InternalState>((set, get) => {
  let fetchCounter = 0;

  return {
    profile: null,
    nestId: null,
    nestCode: null,
    members: [],
    events: [],
    loading: true,
    initialized: false,

    fetchSession: async () => {
      const myFetchId = ++fetchCounter;
      set({ loading: true });

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log("No hay sesión activa");
          set({ profile: null, loading: false, initialized: true });
          return;
        }

        // Ignorar respuestas viejas si se produce una nueva llamada
        if (myFetchId !== fetchCounter) return;

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error || !profile) {
          console.error("Error al obtener perfil:", error?.message);
          set({ profile: null, loading: false, initialized: true });
          return;
        }

        if (myFetchId !== fetchCounter) return;

        set({
          profile,
          nestId: profile.nest_id,
          loading: false,
          initialized: true,
        });

        if (profile.nest_id) {
          // Pasamos explicitamente el nestId para evitar usar valor stale del store
          await get().initializeNest(profile.nest_id);
        }
      } catch (e) {
        console.error("Fallo crítico en fetchSession:", e);
        set({ loading: false, initialized: true });
      }
    },

    initializeNest: async (id: string) => {
      try {
        const { data: nestData, error } = await supabase
          .from("nests")
          .select("nest_code")
          .eq("id", id)
          .single();

        if (error) throw error;

        set({ nestCode: nestData?.nest_code || null });
        await Promise.all([get().fetchMembers(id), get().fetchEvents(id)]);
        console.log("Nido sincronizado correctamente");
      } catch (e) {
        console.error("Error al inicializar nido:", e);
      }
    },

    fetchMembers: async (explicitNestId?: string) => {
      const nid = explicitNestId ?? get().nestId;
      if (!nid) return;
      const { data } = await supabase.from("profiles").select("*").eq("nest_id", nid);
      set({ members: (data || []) as Profile[] });
    },

    fetchEvents: async (explicitNestId?: string) => {
      const nid = explicitNestId ?? get().nestId;
      if (!nid) return;
      const { data } = await supabase.from("events").select("*").eq("nest_id", nid);
      set({ events: (data || []) as EventData[] });
    },

    subscribeToChanges: () => {
      const nid = get().nestId;
      if (!nid) return;
      const channel = supabase
        .channel(`nest-${nid}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "events", filter: `nest_id=eq.${nid}` }, () => get().fetchEvents(nid))
        .subscribe();
      return channel;
    },

    signOut: async () => {
      await supabase.auth.signOut();
      set({ profile: null, nestId: null, initialized: true });
    },

    setEvents: (events: EventData[]) => set({ events }),
  };
});
