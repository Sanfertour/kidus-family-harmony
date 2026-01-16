import { supabase } from "@/integrations/supabase/client";

export const NestService = {
  // Crear un Nido nuevo y vincular al usuario
  createNest: async (userId: string, nestName: string) => {
    const { data: nest, error: nestError } = await supabase
      .from('nests')
      .insert([{ name: nestName }])
      .select()
      .single();

    if (nestError) return { error: nestError };

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ nest_id: nest.id })
      .eq('id', userId);

    return { data: nest, error: profileError };
  },

  // Vincularse a un nido existente (Emparejamiento)
  joinNest: async (userId: string, nestId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ nest_id: nestId })
      .eq('id', userId);
    return { error };
  }
};
