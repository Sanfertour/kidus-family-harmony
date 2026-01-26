import { useState, useMemo } from "react";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Lock, Sparkles, Utensils, GraduationCap, 
  HeartPulse, Trophy, Loader2, Bell
} from "lucide-react";
import { 
  format, isToday, startOfWeek, addDays, 
  isSameDay, eachDayOfInterval 
} from "date-fns";
import { es } from "date-fns/locale";
import { triggerHaptic } from "@/utils/haptics";
import { AgendaCard } from "./AgendaCard";

const CATEGORY_ICONS: any = {
  school: <GraduationCap size={18} />,
  meal: <Utensils size={18} />,
  health: <HeartPulse size={18} />,
  activity: <Trophy size={18} />,
  other: <Sparkles size={18} />,
};

export const AgendaView = () => {
  const { events, members, profile, loading } = useNestStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generar semana actual (Timeline Brisa)
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({
      start,
      end: addDays(start, 6),
    });
  }, []);

  // Filtrar eventos solo para el día seleccionado
  const dayEvents = useMemo(() => {
    return events
      .filter(event => isSameDay(new Date(event.start_time), selectedDate))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [events, selectedDate]);

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center opacity-40 animate-pulse">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sincronizando Nido...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32">
      {/* 1. HEADER LOGÍSTICO */}
      <div className="px-8 flex justify-between items-end pt-4">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 mb-1 italic">Sincronía Semanal</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter capitalize font-nunito">
            {format(selectedDate, "MMMM yyyy", { locale: es })}
          </h1>
        </div>
        <button 
          onClick={() => triggerHaptic('medium')}
          className="relative p-4 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-900 active:scale-90 transition-all"
        >
          <Bell size={22} strokeWidth={2.5} />
          <span className="absolute top-3 right-3 w-3 h-3 bg-orange-500 border-2 border-white rounded-full" />
        </button>
      </div>

      {/* 2. SELECTOR DE 7 DÍAS */}
      <div className="px-4">
        <div className="flex justify-between bg-white/40 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/60 shadow-lg overflow-x-auto no-scrollbar">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`flex flex-col items-center justify-center min-w-[50px] py-4 rounded-2xl transition-all ${
                  active ? 'bg-slate-900 text-white shadow-lg scale-110' : 'text-slate-400 hover:bg-slate-100'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest mb-1">
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className="text-lg font-black tracking-tighter">
                  {format(day, "d")}
                </span>
                {active && <motion.div layoutId="dot" className="w-1 h-1 bg-sky-400 rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LISTA DE EVENTOS */}
      <div className="px-6 space-y-6">
        <div className="flex items-center gap-4 px-2">
           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
             {isToday(selectedDate) ? "Hoy" : format(selectedDate, "EEEE d", { locale: es })}
           </h3>
           <div className="h-[1px] flex-1 bg-slate-200" />
        </div>

        <AnimatePresence mode="popLayout">
          {dayEvents.length > 0 ? (
            dayEvents.map((event) => {
              const isOwner = event.created_by === profile?.id;
              // Buscamos el guía responsable
              const assignedGuia = members.find(m => m.id === event.assigned_to);
              
              return (
                <AgendaCard 
                  key={event.id}
                  event={event}
                  isCreator={isOwner}
                  assignedMember={assignedGuia}
                  onClick={() => {
                    // Aquí puedes abrir un drawer de edición si quieres
                    console.log("Evento seleccionado:", event.title);
                  }}
                />
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                <Sparkles className="text-slate-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Nido en calma para este día</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
