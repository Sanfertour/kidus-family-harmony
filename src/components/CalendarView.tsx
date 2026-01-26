import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
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
import { triggerHaptic } from "@/utils/haptics";

export const CalendarView = ({
  events,
  members,
  selectedMemberId,
  onMemberFilter,
  onDateSelect,
}: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generación de la cuadrícula de días
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { locale: es });
    const calendarEnd = endOfWeek(monthEnd, { locale: es });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getEventsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return events.filter((e: any) => e.start_time?.startsWith(dateStr));
  };

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="mx-6 p-8 rounded-[3.5rem] bg-white/50 backdrop-blur-2xl border border-white/70 shadow-sm mb-10 overflow-hidden relative">
      
      {/* 1. FILTRO DE LA TRIBU (Solo Guías Autónomos) */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => { triggerHaptic('soft'); onMemberFilter(null); }}
          className={`flex items-center justify-center min-w-[4rem] h-10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
            !selectedMemberId 
            ? "bg-slate-900 text-white shadow-xl scale-105" 
            : "bg-white text-slate-400 border border-slate-100"
          }`}
        >
          Nido
        </button>
        {members.filter((m:any) => m.role === 'autonomous').map((member: any) => (
          <MemberAvatar
            key={member.id}
            member={member}
            size="sm"
            isSelected={selectedMemberId === member.id}
            onClick={() => {
              triggerHaptic('soft');
              onMemberFilter(member.id);
            }}
          />
        ))}
      </div>

      {/* 2. NAVEGACIÓN MENSUAL */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter font-nunito italic">
          {format(currentMonth, "MMMM", { locale: es })}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => { triggerHaptic('soft'); setCurrentMonth(subMonths(currentMonth, 1)); }}
            className="w-10 h-10 rounded-xl bg-white border border-slate-50 flex items-center justify-center text-slate-400 active:scale-90 shadow-sm transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => { triggerHaptic('soft'); setCurrentMonth(addMonths(currentMonth, 1)); }}
            className="w-10 h-10 rounded-xl bg-white border border-slate-50 flex items-center justify-center text-slate-400 active:scale-90 shadow-sm transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 3. GRID DE DÍAS SEMANA */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-300 pb-2 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      {/* 4. GRID DE DÍAS DEL MES */}
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
              whileTap={{ scale: 0.92 }}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border ${
                isCurrentMonth ? "text-slate-800" : "text-slate-200 border-transparent"
              } ${
                isTodayDay 
                ? "bg-sky-50 border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.1)]" 
                : "bg-transparent border-transparent hover:bg-slate-50/50"
              }`}
            >
              <span className={`text-xs font-black ${isTodayDay ? "text-sky-600" : ""}`}>
                {format(day, "d")}
              </span>

              {/* Dots de Sincronía por Guía */}
              <div className="flex gap-0.5 mt-1 h-1">
                {dayEvents.slice(0, 3).map((event: any, i: number) => {
                  const assignedGuia = members.find((m: any) => m.id === event.assigned_to);
                  return (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: assignedGuia?.color || '#0EA5E9' }}
                    />
                  );
                })}
              </div>

              {/* Alerta de Conflicto (Vital Orange) */}
              {hasConflict && (
                <div className="absolute top-1 right-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Glow ambiental decorativo */}
      <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-sky-100/30 blur-[60px] rounded-full pointer-events-none" />
    </div>
  );
};

export default CalendarView;
