import { supabase } from "@/integrations/supabase/client";

export const checkConflicts = async (memberId: string, startTime: string, endTime: string) => {
  // Buscamos eventos que se solapen para el mismo miembro
  const { data: conflicts, error } = await supabase
    .from('events')
    .select('*')
    .eq('member_id', memberId)
    .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

  if (error) {
    console.error("Error comprobando conflictos:", error);
    return [];
  }

  return conflicts || [];
};
