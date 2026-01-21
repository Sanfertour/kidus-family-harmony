import { useMemo } from "react";
import { areIntervalsOverlapping } from "date-fns";

export const useConflictDetection = (events: any[]) => {
  const eventsWithConflicts = useMemo(() => {
    const conflictMap = new Map<string, string[]>();

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const eventA = events[i];
        const eventB = events[j];

        try {
          const startA = new Date(eventA.start_time);
          const endA = new Date(eventA.end_time || eventA.start_time);
          const startB = new Date(eventB.start_time);
          const endB = new Date(eventB.end_time || eventB.start_time);

          const hasOverlap = areIntervalsOverlapping(
            { start: startA, end: endA },
            { start: startB, end: endB }
          );

          if (hasOverlap && eventA.assigned_to === eventB.assigned_to && eventA.assigned_to !== null) {
            if (!conflictMap.has(eventA.id)) conflictMap.set(eventA.id, []);
            if (!conflictMap.has(eventB.id)) conflictMap.set(eventB.id, []);
            conflictMap.get(eventA.id)!.push(eventB.id);
            conflictMap.get(eventB.id)!.push(eventA.id);
          }
        } catch (e) {
          console.warn("Error detectando colisión", e);
        }
      }
    }

    return events.map((event) => ({
      ...event,
      hasConflict: conflictMap.has(event.id),
      conflictWith: conflictMap.get(event.id) || [],
    }));
  }, [events]);

  return { eventsWithConflicts };
};
