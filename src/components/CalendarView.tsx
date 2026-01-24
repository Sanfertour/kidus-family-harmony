import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { MemberAvatar } from "./MemberAvatar";

// Feedback háptico profesional
const triggerHaptic = (type: 'soft' | 'success' = 'soft') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

export const CalendarView = ({
  events,
  members,
  custodyBlocks = [],
  selectedMemberId,
  onMemberFilter,
  onDateSelect,
}: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Lógica de generación de días sincronizada
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: es });
    const calendarEnd = endOfWeek(monthEnd, { locale: es });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return events.filter((e: any) => e.date === dateStr || e.start_time?.startsWith(dateStr));
  };

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="mx-6 p-8 rounded-[3.5rem] bg-white/50 backdrop-blur-2xl border border-white/70 shadow-sm mb-10">
      
      {/* Filtro de la Tribu (Guías) */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => { triggerHaptic('soft'); onMemberFilter(null); }}
          className={`flex items-center justify-center min-w-[3.5rem] h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            !selectedMemberId ? "bg-[#0EA5E9] text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"
          }`}
        >
          Todos
        </button>
        {members.map((member: any) => (
          <MemberAvatar
            key={member.id}
            member={member}
            size="sm"
            isSelected={selectedMemberId === member.id}
            onClick={() => onMemberFilter(member.id)}
          />
        ))}
      </div>

      {/* Navegación del Mes con Nunito Black */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter font-nunito">
          {format(currentMonth, "MMMM", { locale: es })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => { triggerHaptic('soft'); setCurrentMonth(subMonths(currentMonth, 1)); }}
            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => { triggerHaptic('soft'); setCurrentMonth(addMonths(currentMonth, 1)); }}
            className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid de días (Días de la semana) */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-300 pb-2 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      {/* Grid de días del Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDay = isToday(day);
          const hasConflict = dayEvents.some((e: any) => e.hasConflict);

          return (
            <motion.button
              key={index}
              onClick={() => { triggerHaptic('soft'); onDateSelect(day); }}
              whileTap={{ scale: 0.9 }}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                isCurrentMonth ? "text-slate-800" : "text-slate-200"
              } ${isTodayDay ? "bg-[#0EA5E9]/10 border-2 border-[#0EA5E9]" : "hover:bg-slate-50"}`}
            >
              <span className={`text-xs font-black ${isTodayDay ? "text-[#0EA5E9]" : ""}`}>
                {format(day, "d")}
              </span>

              {/* Dots de Eventos sincronizados por Guía */}
              <div className="flex gap-0.5 mt-1">
                {dayEvents.slice(0, 3).map((event: any, i: number) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: event.memberColor || '#F97316' }}
                  />
                ))}
              </div>

              {/* Alerta de Conflicto - Vital Orange */}
              {hasConflict && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
