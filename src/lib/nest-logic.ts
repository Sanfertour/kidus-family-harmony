import { supabase } from "@/lib/supabase";
import { areIntervalsOverlapping } from 'date-fns';

/**
 * checkConflicts: Busca colisiones de agenda para un miembro dentro de un Nido.
 * - Siempre requiere nestId (Verdad Única) para evitar fugas de eventos entre Nidos.
 * - Se espera que startTime/endTime sean ISO strings.
 * - Soporta varias columnas posibles para compatibilidad con esquemas (start_time / event_date / date).
 */
export const checkConflicts = async (
  memberId: string,
  nestId: string,
  startTime: string,
  endTime: string
) => {
  if (!nestId) {
    throw new Error('checkConflicts: nestId is required to avoid cross-nest data leaks');
  }

  try {
    // Traemos sólo los campos necesarios y limitamos por nest_id y por miembro (assigned_to OR member_id)
    const { data: events, error } = await supabase
      .from('events')
      .select('id, start_time, end_time, event_date, date, assigned_to, member_id')
      .eq('nest_id', nestId)
      .or(`assigned_to.eq.${memberId},member_id.eq.${memberId}`);

    if (error) {
      console.error('Error comprobando conflictos:', error);
      return [];
    }

    const requestedInterval = {
      start: new Date(startTime),
      end: new Date(endTime),
    };

    // Filtramos en el cliente para mantener la consulta simple y evitar strings complejos en PostgREST
    const conflicts = (events || []).filter((ev: any) => {
      try {
        const evStartStr = ev.start_time || ev.event_date || ev.date;
        const evEndStr = ev.end_time || ev.event_date || ev.date || ev.start_time;
        if (!evStartStr) return false;

        const evInterval = { start: new Date(evStartStr), end: new Date(evEndStr) };

        return areIntervalsOverlapping(requestedInterval, evInterval, { inclusive: true });
      } catch (e) {
        console.warn('checkConflicts: error parsing event dates', e);
        return false;
      }
    });

    return conflicts;
  } catch (e) {
    console.error('Error crítico comprobando conflictos:', e);
    return [];
  }
};