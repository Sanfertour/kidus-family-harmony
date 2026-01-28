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
  
  // Referencia para la hora actual (Autoscroll)
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

  // LÓGICA DE AUTOSCROLL QUIRÚRGICA
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Sincronizando Nido...</p>
    </div>
  );

  const currentHourNow = getHours(new Date());

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32">
      {/* Header Brisa - Sticky con Blur */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-white/80 px-8 pt-14 pb-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/60 block mb-1 italic">
              Logística KidUs
            </span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize italic">
              {format(selectedDate, "EEEE", { locale: es })}
              <span className="text-indigo-600 ml-2">{format(selectedDate, "d")}</span>
            </h1>
          </div>
          <button 
            onClick={() => { triggerHaptic('medium'); setSelectedDate(new Date()); }}
            className={`relative p-5 rounded-[2.2rem] transition-all duration-500 shadow-xl ${
              hasUpcoming ? 'bg-orange-500 text-white shadow-orange-200 animate-pulse' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            <Bell size={24} />
            {hasUpcoming && <span className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full border-4 border-orange-500" />}
          </button>
        </div>

        {/* Selector Semanal */}
        <div className="flex justify-between gap-2">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const dayHasEvents = events.some(e => isSameDay(new Date(e.start_time), day));
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`flex-1 flex flex-col items-center py-4 rounded-[2.2rem] transition-all relative ${
                  active ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'bg-white/50 text-slate-400'
                }`}
              >
                <span className={`text-[9px] font-bold uppercase mb-1 ${active ? 'text-indigo-300' : ''}`}>
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className="text-lg font-black">{format(day, "d")}</span>
                {dayHasEvents && !active && (
                  <div className="absolute bottom-3 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                )}
                {isTodayDate && !active && (
                  <div className="absolute -top-1 w-1 h-1 bg-orange-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parrilla Horaria con Autoscroll e Indicador "Ahora" */}
      <div className="px-6 mt-8 relative">
        <div className="absolute left-[4.2rem] top-0 bottom-0 w-[1px] bg-slate-100" />

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
                className={`flex gap-6 group min-h-[90px] transition-all ${isItNow ? 'scale-[1.01]' : ''}`}
              >
                {/* Hora e Indicador visual de posición actual */}
                <div className="w-12 pt-1 text-right relative">
                  <span className={`text-[10px] font-bold tabular-nums transition-colors ${
                    isItNow ? 'text-indigo-600 scale-110 block' : 'text-slate-300'
                  }`}>
                    {hourStr}
                  </span>
                  {isItNow && (
                    <motion.div 
                      layoutId="current-hour-indicator"
                      className="absolute -right-[1.85rem] top-3 w-3 h-3 bg-indigo-600 rounded-full border-4 border-white z-20 shadow-lg shadow-indigo-200"
                    />
                  )}
                </div>

                {/* Slot de Contenido */}
                <div className={`flex-1 border-t ${isItNow ? 'border-indigo-100 bg-indigo-50/20 rounded-r-[2.5rem]' : 'border-slate-50'} pt-2 pb-6 relative`}>
                  <AnimatePresence mode="popLayout">
                    {hourEvents.length > 0 ? (
                      <div className="space-y-3">
                        {hourEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
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
                      <div className="h-full w-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => triggerHaptic('soft')}
                          className="text-[9px] font-bold text-slate-200 uppercase tracking-[0.2em] ml-4"
                        >
                          Slot Libre
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

      {/* Indicador de Custodia Flotante (Lógica preservada) */}
      <AnimatePresence>
        {events.some(e => e.category === 'custody' && isSameDay(new Date(e.start_time), selectedDate)) && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-28 left-6 right-28 bg-slate-900/90 backdrop-blur-xl text-white p-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 z-40 border border-white/10"
          >
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-inner">
              <HeartPulse size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Custodia Activa</p>
              <p className="text-xs text-slate-300 font-medium">Sincronía con el otro Guía</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Añadir Evento (Estilo KidUs) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-8 w-16 h-16 bg-indigo-600 text-white rounded-[2.2rem] shadow-2xl shadow-indigo-200 flex items-center justify-center z-40 border-4 border-white"
      >
        <Plus size={28} strokeWidth={3} />
      </motion.button>
    </div>
  );
};
