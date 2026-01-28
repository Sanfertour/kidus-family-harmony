import { useState, useMemo, useEffect, useRef } from "react";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Loader2, Calendar as CalendarIcon, 
  Clock, Plus, GraduationCap, Utensils, HeartPulse, Trophy, Star
} from "lucide-react";
import { 
  format, isToday, startOfWeek, addDays, 
  isSameDay, eachDayOfInterval, startOfDay, addHours, getHours 
} from "date-fns";
import { es } from "date-fns/locale";
import { triggerHaptic } from "@/utils/haptics";
import { AgendaCard } from "./AgendaCard";

export const CATEGORY_CONFIG: any = {
  school: { icon: <GraduationCap size={14} />, color: "#8B5CF6", bg: "#F5F3FF", label: "Escuela" },
  meal: { icon: <Utensils size={14} />, color: "#F59E0B", bg: "#FFFBEB", label: "Alimentación" },
  health: { icon: <HeartPulse size={14} />, color: "#EF4444", bg: "#FEF2F2", label: "Salud" },
  activity: { icon: <Trophy size={14} />, color: "#10B981", bg: "#ECFDF5", label: "Extraescolar" },
  other: { icon: <Star size={14} />, color: "#0EA5E9", bg: "#F0F9FF", label: "Sincronía" },
  custody: { icon: <HeartPulse size={14} />, color: "#EC4899", bg: "#FDF2F7", label: "Custodia" },
};

export const AgendaView = () => {
  const { events, members, profile, loading } = useNestStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const currentHourRef = useRef<HTMLDivElement>(null);

  const dayHours = useMemo(() => {
    const start = startOfDay(selectedDate);
    return Array.from({ length: 24 }, (_, i) => addHours(start, i));
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, []);

  const hasUpcoming = useMemo(() => {
    const now = new Date();
    return events.some(e => {
      const start = new Date(e.start_time);
      const diff = (start.getTime() - now.getTime()) / (1000 * 60);
      return diff > 0 && diff < 180;
    });
  }, [events]);

  useEffect(() => {
    if (!loading && isToday(selectedDate)) {
      const timer = setTimeout(() => {
        currentHourRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [loading, selectedDate]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFF]">
      <div className="relative">
        <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
        <Loader2 className="animate-spin text-indigo-600 relative" size={40} strokeWidth={3} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-8 italic">Sincronizando Nido...</p>
    </div>
  );

  const currentHourNow = getHours(new Date());

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header Brisa - Glassmorphism Profundo */}
      <div className="sticky top-0 z-30 bg-white/70 backdrop-blur-3xl border-b border-white/40 px-8 pt-14 pb-8">
        <div className="flex justify-between items-end mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/50 block mb-2 italic">
              Logística KidUs
            </span>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter capitalize italic">
              {format(selectedDate, "EEEE", { locale: es })}
              <span className="text-indigo-600 ml-3">{format(selectedDate, "d")}</span>
            </h1>
          </motion.div>
          
          <button 
            onClick={() => { triggerHaptic('medium'); setSelectedDate(new Date()); }}
            className={`relative p-6 rounded-[2.5rem] transition-all duration-700 shadow-2xl ${
              hasUpcoming 
                ? 'bg-orange-500 text-white shadow-orange-200 animate-pulse' 
                : 'bg-white text-slate-400 border border-slate-100 hover:shadow-indigo-100 hover:scale-105'
            }`}
          >
            <Bell size={24} strokeWidth={hasUpcoming ? 3 : 2} />
            {hasUpcoming && (
              <span className="absolute top-5 right-5 w-4 h-4 bg-white rounded-full border-4 border-orange-500 shadow-sm" />
            )}
          </button>
        </div>

        {/* Selector Semanal Estilo Brisa */}
        <div className="flex justify-between gap-3 px-1">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const dayHasEvents = events.some(e => isSameDay(new Date(e.start_time), day));
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`flex-1 flex flex-col items-center py-5 rounded-[2.5rem] transition-all duration-500 relative ${
                  active 
                    ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-105 -translate-y-1' 
                    : 'bg-white/40 text-slate-400 border border-white hover:bg-white/80'
                }`}
              >
                <span className={`text-[9px] font-black uppercase mb-1.5 tracking-tighter ${active ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className="text-xl font-black tracking-tighter">{format(day, "d")}</span>
                
                {dayHasEvents && !active && (
                  <div className="absolute bottom-3 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-sm shadow-indigo-200" />
                )}
                {isTodayDate && !active && (
                  <div className="absolute -top-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parrilla Horaria */}
      <div className="px-8 mt-12 relative">
        <div className="absolute left-[4.2rem] top-0 bottom-0 w-[2px] bg-slate-100/60 rounded-full" />

        <div className="space-y-0">
          {dayHours.map((hour) => {
            const h = getHours(hour);
            const isItNow = isToday(selectedDate) && h === currentHourNow;
            const hourStr = format(hour, "HH:00");
            const hourEvents = events.filter(e => 
              isSameDay(new Date(e.start_time), selectedDate) && 
              format(new Date(e.start_time), "HH:00") === hourStr
            );

            return (
              <div 
                key={hourStr} 
                ref={isItNow ? currentHourRef : null}
                className={`flex gap-8 group min-h-[100px] transition-all duration-500 ${isItNow ? 'scale-[1.02] z-10' : ''}`}
              >
                <div className="w-12 pt-1 text-right relative">
                  <span className={`text-[11px] font-black tabular-nums transition-all duration-500 ${
                    isItNow ? 'text-indigo-600 scale-125 block translate-x-[-2px]' : 'text-slate-300'
                  }`}>
                    {hourStr}
                  </span>
                  {isItNow && (
                    <motion.div 
                      layoutId="current-hour-indicator"
                      className="absolute -right-[2.15rem] top-3 w-4 h-4 bg-indigo-600 rounded-full border-[5px] border-white z-20 shadow-xl shadow-indigo-300"
                    />
                  )}
                </div>

                <div className={`flex-1 border-t ${
                  isItNow 
                    ? 'border-indigo-100 bg-indigo-50/20 rounded-r-[3.5rem] shadow-inner shadow-indigo-50/50' 
                    : 'border-slate-50'
                } pt-3 pb-8 relative px-2 transition-all`}>
                  <AnimatePresence mode="popLayout">
                    {hourEvents.length > 0 ? (
                      <div className="space-y-4">
                        {hourEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <AgendaCard 
                              event={event}
                              isCreator={event.created_by === profile?.id}
                              assignedMember={members.find((m: any) => m.id === event.assigned_to)}
                              onClick={() => triggerHaptic('soft')}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                         <button 
                          onClick={() => { triggerHaptic('soft'); }}
                          className="text-[9px] font-black text-slate-300 hover:text-indigo-400 uppercase tracking-[0.3em] ml-6 flex items-center gap-2"
                        >
                          <Plus size={12} strokeWidth={3} /> Slot Libre
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicador de Custodia Flotante - Deep Glassmorphism */}
      <AnimatePresence>
        {events.some(e => e.category === 'custody' && isSameDay(new Date(e.start_time), selectedDate)) && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed bottom-32 left-8 right-32 bg-slate-900/90 backdrop-blur-2xl text-white p-6 rounded-[3rem] shadow-2xl flex items-center gap-5 z-40 border border-white/10"
          >
            <div className="w-12 h-12 bg-indigo-500 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <HeartPulse size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 italic mb-0.5">Custodia Activa</p>
              <p className="text-sm text-slate-300 font-bold tracking-tight">Sincronía con el otro Guía</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Estilo KidUs */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-32 right-8 w-20 h-20 bg-indigo-600 text-white rounded-[2.8rem] shadow-2xl shadow-indigo-300 flex items-center justify-center z-50 border-[6px] border-[#FDFDFF]"
      >
        <Plus size={32} strokeWidth={4} />
      </motion.button>
    </div>
  );
};
