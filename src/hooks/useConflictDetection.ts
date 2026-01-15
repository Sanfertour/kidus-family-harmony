import { useMemo } from "react";
import { EventData, ConflictInfo } from "@/types/kidus";
import { parse, isWithinInterval, areIntervalsOverlapping } from "date-fns";

// Parse time string "HH:mm" to Date object for comparison
const parseTimeToDate = (dateStr: string, timeStr: string): Date => {
  return parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", new Date());
};

export const useConflictDetection = (events: EventData[]) => {
  const eventsWithConflicts = useMemo(() => {
    const conflictMap = new Map<string, string[]>();

    // Compare each pair of events
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const eventA = events[i];
        const eventB = events[j];

        // Only check same date events
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
            // Mark both events as conflicting
            if (!conflictMap.has(eventA.id)) {
              conflictMap.set(eventA.id, []);
            }
            if (!conflictMap.has(eventB.id)) {
              conflictMap.set(eventB.id, []);
            }
            conflictMap.get(eventA.id)!.push(eventB.id);
            conflictMap.get(eventB.id)!.push(eventA.id);
          }
        } catch (e) {
          // Skip if date parsing fails
          console.warn("Could not parse dates for conflict detection", e);
        }
      }
    }

    // Return events with conflict info
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
        result.push({
          eventId: event.id,
          conflictingEventIds: event.conflictWith || [],
          message: `${event.title} tiene un conflicto horario`,
        });
        processed.add(event.id);
        event.conflictWith?.forEach((id) => processed.add(id));
      }
    });

    return result;
  }, [eventsWithConflicts]);

  return { eventsWithConflicts, conflicts };
};
