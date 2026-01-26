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

// Recuperado: Iconos por categoría
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

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, []);

  const dayEvents = useMemo(() => {
    return events
      .filter((event: any) => isSameDay(new Date(event.start_time), selectedDate))
      .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [events, selectedDate]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center opacity-40 animate-pulse">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Sincronizando Nido...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 1. HEADER */}
      <div className="px-8 flex justify-between items-end pt-4">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 mb-1 italic">Sincronía Semanal</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter capitalize font-nunito">
            {format(selectedDate, "MMMM yyyy", { locale: es })}
          </h1>
        </div>
        <button 
          onClick={() => triggerHaptic('medium')}
          className="relative p-4 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 text-slate-900 active:scale-90 transition-all"
        >
          <Bell size={22} strokeWidth={2.5} />
          <span className="absolute top-3 right-3 w-3 h-3 bg-orange-500 border-2 border-white rounded-full" />
        </button>
      </div>

      {/* 2. SELECTOR SEMANAL */}
      <div className="px-4">
        <div className="flex justify-between bg-white/40 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/60 shadow-lg overflow-x-auto no-scrollbar">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`flex flex-col items-center justify-center min-w-[50px] py-4 rounded-2xl transition-all ${
                  active ? 'bg-slate-900 text-white shadow-xl scale-110' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest mb-1">{format(day, "EEE", { locale: es })}</span>
                <span className="text-lg font-black tracking-tighter">{format(day, "d")}</span>
                {active && <motion.div layoutId="activeDot" className="w-1 h-1 bg-sky-400 rounded-full mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. EVENTOS */}
      <div className="px-6 space-y-6">
        <div className="flex items-center gap-4 px-2">
           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
             {isToday(selectedDate) ? "Hoy" : format(selectedDate, "EEEE d", { locale: es })}
           </h3>
           <div className="h-[1px] flex-1 bg-slate-200" />
        </div>

        <AnimatePresence mode="popLayout">
          {dayEvents.length > 0 ? (
            dayEvents.map((event: any) => (
              <AgendaCard 
                key={event.id}
                event={event}
                isCreator={event.created_by === profile?.id}
                assignedMember={members.find((m: any) => m.id === event.assigned_to)}
                onClick={() => console.log("Detalles:", event.id)}
              />
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <Sparkles className="mx-auto text-slate-200 mb-4 opacity-50" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">El Nido descansa hoy</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
