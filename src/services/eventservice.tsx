import { supabase } from "@/lib/supabase";

export const fetchNestEvents = async (nestId: string) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles (
        display_name,
        avatar_url
      )
    `)
    .eq('nest_id', nestId)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data;
};

// Función para el "Modo Privado" que mencionamos
export const filterPrivateEvents = (events: any[], currentUserId: string) => {
  return events.map(event => {
    if (event.is_private && event.created_by !== currentUserId) {
      return {
        ...event,
        title: "🔒 Evento Privado",
        description: "Contenido protegido",
        category: "private"
      };
    }
    return event;
  });
};
