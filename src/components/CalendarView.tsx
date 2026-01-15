import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { NestMember, EventData, CustodyBlock } from "@/types/kidus";
import MemberAvatar from "./MemberAvatar";

interface CalendarViewProps {
  events: EventData[];
  members: NestMember[];
  custodyBlocks?: CustodyBlock[];
  selectedMemberId?: string | null;
  onMemberFilter: (memberId: string | null) => void;
  onDateSelect: (date: Date) => void;
  onEventClick?: (event: EventData) => void;
}

const CalendarView = ({
  events,
  members,
  custodyBlocks = [],
  selectedMemberId,
  onMemberFilter,
  onDateSelect,
  onEventClick,
}: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: es });
    const calendarEnd = endOfWeek(monthEnd, { locale: es });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr);
  };

  const getCustodyForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return custodyBlocks.find((c) => c.date === dateStr);
  };

  const filteredEvents = useMemo(() => {
    if (!selectedMemberId) return events;
    return events.filter((e) => e.memberId === selectedMemberId);
  }, [events, selectedMemberId]);

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="glass-card rounded-2xl p-4 mx-4 mb-4">
      {/* Member filter bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => onMemberFilter(null)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !selectedMemberId
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Filter size={12} />
          Todos
        </button>
        {members.map((member) => (
          <MemberAvatar
            key={member.id}
            member={member}
            size="sm"
            isSelected={selectedMemberId === member.id}
            onClick={() => onMemberFilter(member.id)}
          />
        ))}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={20} />
        </motion.button>
        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <motion.button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-full hover:bg-muted transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const filteredDayEvents = selectedMemberId
            ? dayEvents.filter((e) => e.memberId === selectedMemberId)
            : dayEvents;
          const custody = getCustodyForDay(day);
          const hasConflict = dayEvents.some((e) => e.hasConflict);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <motion.button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`relative aspect-square p-1 rounded-xl flex flex-col items-center justify-start transition-all ${
                isCurrentMonth
                  ? "text-foreground"
                  : "text-muted-foreground/40"
              } ${
                isToday(day)
                  ? "bg-primary/10 border-2 border-primary"
                  : "hover:bg-muted"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {/* Custody strip at top */}
              {custody && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ backgroundColor: custody.memberColor }}
                />
              )}

              {/* Day number */}
              <span className="text-sm font-medium mt-1">
                {format(day, "d")}
              </span>

              {/* Event indicators */}
              <div className="flex flex-wrap gap-0.5 mt-1 justify-center max-w-full">
                {filteredDayEvents.slice(0, 3).map((event, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      event.hasConflict ? "animate-pulse" : ""
                    }`}
                    style={{
                      backgroundColor: event.hasConflict
                        ? "hsl(var(--accent))"
                        : event.memberColor,
                    }}
                  />
                ))}
                {filteredDayEvents.length > 3 && (
                  <span className="text-[8px] text-muted-foreground">
                    +{filteredDayEvents.length - 3}
                  </span>
                )}
              </div>

              {/* Conflict warning */}
              {hasConflict && (
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
