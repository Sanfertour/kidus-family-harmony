import { useMemo } from "react";
import { EventData, ConflictInfo } from "@/types/kidus";
import { parse, areIntervalsOverlapping } from "date-fns";

const parseTimeToDate = (dateStr: string, timeStr: string): Date => {
  return parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", new Date());
};

export const useConflictDetection = (events: EventData[]) => {
  const eventsWithConflicts = useMemo(() => {
    const conflictMap = new Map<string, string[]>();

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const eventA = events[i];
        const eventB = events[j];

        if (eventA.date !== eventB.date) continue;

        try {
          const startA = parseTimeToDate(eventA.date, eventA.startTime);
          const endA = parseTimeToDate(eventA.date, eventA.endTime);
          const startB = parseTimeToDate(eventB.date, eventB.startTime);
          const endB = parseTimeToDate(eventB.date, eventB.endTime);

          const hasOverlap = areIntervalsOverlapping(
            { start: startA, end: endA },
            { start: startB, end: endB }
          );

          if (hasOverlap) {
            if (!conflictMap.has(eventA.id)) conflictMap.set(eventA.id, []);
            if (!conflictMap.has(eventB.id)) conflictMap.set(eventB.id, []);
            conflictMap.get(eventA.id)!.push(eventB.id);
            conflictMap.get(eventB.id)!.push(eventA.id);
          }
        } catch (e) {
          console.warn("Error en detección de colisión", e);
        }
      }
    }

    return events.map((event) => ({
      ...event,
      hasConflict: conflictMap.has(event.id),
      conflictWith: conflictMap.get(event.id) || [],
    }));
  }, [events]);

  const conflicts = useMemo((): ConflictInfo[] => {
    const result: ConflictInfo[] = [];
    const processed = new Set<string>();

    eventsWithConflicts.forEach((event) => {
      if (event.hasConflict && !processed.has(event.id)) {
        // Lógica de Alerta Naranja Silenciosa
        const otherEvents = eventsWithConflicts.filter(e => 
          event.conflictWith?.includes(e.id)
        );

        const hasPrivateConflict = otherEvents.some(e => e.isPrivate);
        
        // Si el choque es con algo privado, el mensaje es genérico para proteger la privacidad
        const message = hasPrivateConflict 
          ? `Conflicto: ${event.memberName} ya tiene un compromiso (Evento Privado)`
          : `Conflicto: ${event.title} se solapa con otro evento.`;

        result.push({
          eventId: event.id,
          conflictingEventIds: event.conflictWith || [],
          message,
          isPrivateConflict: hasPrivateConflict
        });
        
        processed.add(event.id);
      }
    });

    return result;
  }, [eventsWithConflicts]);

  return { eventsWithConflicts, conflicts };
};
