import { useState, useMemo } from "react";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Loader2, Clock, 
  GraduationCap, Utensils, HeartPulse, Trophy, Star,
  Calendar as CalendarIcon, ChevronRight
} from "lucide-react";
import { 
  format, isToday, startOfWeek, addDays, 
  isSameDay, eachDayOfInterval, startOfDay, addHours 
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

  const dayHours = useMemo(() => {
    const start = startOfDay(selectedDate);
    // Expandimos a 18 horas para cubrir mejor el día familiar (6am a 12pm)
    return Array.from({ length: 18 }, (_, i) => addHours(start, i + 6));
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

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center opacity-40">
      <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Nido...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-32 bg-[#F8FAFC] min-h-screen">
      {/* Header con Estética Brisa */}
      <div className="px-8 flex justify-between items-center pt-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-600/60">Sincronía KidUs</h2>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">
            {format(selectedDate, "EEEE", { locale: es })}
            <span className="text-indigo-600 ml-2">{format(selectedDate, "d")}</span>
          </h1>
        </div>
        <button 
          onClick={() => triggerHaptic('medium')}
          className={`relative p-5 rounded-[2.5rem] transition-all duration-500 shadow-xl ${
            hasUpcoming ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white text-slate-400 border border-slate-100'
          }`}
        >
          <Bell size={24} />
          {hasUpcoming && <span className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full border-4 border-orange-500" />}
        </button>
      </div>

      {/* Selector de Fecha Mejorado (Modo Visual) */}
      <div className="px-4">
        <div className="flex justify-between bg-white/60 backdrop-blur-3xl p-3 rounded-[3rem] shadow-sm border border-white/80">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const hasEvents = events.some(e => isSameDay(new Date(e.start_time), day));
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`flex flex-col items-center justify-center min-w-[50px] py-5 rounded-[2.2rem] transition-all relative ${
                  active ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-400 hover:bg-white'
                }`}
              >
                <span className={`text-[9px] font-bold uppercase mb-1 ${active ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {format(day, "EE", { locale: es })}
                </span>
                <span className="text-lg font-black">{format(day, "d")}</span>
                
                {hasEvents && !active && (
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

      {/* Parrilla Horaria Estilo Timeline Élite */}
      <div className="px-6 relative mt-8">
        {/* Línea de tiempo vertical decorativa */}
        <div className="absolute left-[4.5rem] top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />
        
        <div className="space-y-2">
          {dayHours.map((hour) => {
            const hourStr = format(hour, "HH:00");
            const hourEvents = events.filter(e => 
              isSameDay(new Date(e.start_time), selectedDate) && 
              format(new Date(e.start_time), "HH:00") === hourStr
            );

            return (
              <div key={hourStr} className="flex gap-6 group">
                {/* Hora */}
                <div className="w-12 pt-2 text-right">
                  <span className={`text-[11px] font-bold tabular-nums transition-colors ${
                    hourEvents.length > 0 ? 'text-indigo-600' : 'text-slate-300'
                  }`}>
                    {hourStr}
                  </span>
                </div>

                {/* Slot de Contenido */}
                <div className={`flex-1 min-h-[100px] relative rounded-[2.5rem] transition-all ${
                  hourEvents.length > 0 ? 'py-2' : 'border-b border-slate-50'
                }`}>
                  <AnimatePresence mode="popLayout">
                    {hourEvents.length > 0 ? (
                      <div className="space-y-3">
                        {hourEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                          >
                            <AgendaCard 
                              event={event}
                              isCreator={event.created_by === profile?.id}
                              assignedMember={members.find((m: any) => m.id === event.assigned_to)}
                              onClick={() => {
                                triggerHaptic('soft'); // CORRECCIÓN: 'light' cambiado a 'soft' para el Build
                                console.log("Detalle", event.title);
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => triggerHaptic('soft')}
                          className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 ml-4"
                        >
                          <div className="w-4 h-[1px] bg-slate-200" />
                          Libre
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

      {/* Indicador flotante de "Día de Custodia" si aplica */}
      <AnimatePresence>
        {events.some(e => e.category === 'custody' && isSameDay(new Date(e.start_time), selectedDate)) && (
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-white/10"
          >
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Hoy: Turno de Custodia</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
