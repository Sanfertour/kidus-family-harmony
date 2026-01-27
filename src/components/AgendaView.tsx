import { useState, useMemo } from "react";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, Loader2, Clock } from "lucide-react";
import { 
  format, isToday, startOfWeek, addDays, 
  isSameDay, eachDayOfInterval, eachHourOfInterval, 
  startOfDay, addHours 
} from "date-fns";
import { es } from "date-fns/locale";
import { triggerHaptic } from "@/utils/haptics";
import { AgendaCard } from "./AgendaCard";

export const AgendaView = () => {
  const { events, members, profile, loading } = useNestStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Definimos el rango visual del día (07:00 a 22:00)
  const dayHours = useMemo(() => {
    const start = startOfDay(selectedDate);
    return Array.from({ length: 16 }, (_, i) => addHours(start, i + 7));
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, []);

  // Lógica de la Campana de Sincronía (Eventos en las próximas 3 horas)
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
      <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Nido...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-32 bg-slate-50/20 min-h-screen">
      {/* HEADER LOGÍSTICO */}
      <div className="px-8 flex justify-between items-end pt-8">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 mb-1 italic">KidUs Logística</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter capitalize italic">
            {format(selectedDate, "EEEE d", { locale: es })}
          </h1>
        </div>
        <button 
          onClick={() => triggerHaptic('medium')}
          className={`relative p-5 rounded-[2.2rem] transition-all duration-500 shadow-2xl ${
            hasUpcoming ? 'bg-orange-500 text-white animate-pulse' : 'bg-white text-slate-900 shadow-slate-200/40'
          }`}
        >
          <Bell size={24} strokeWidth={hasUpcoming ? 3 : 2} />
          {hasUpcoming && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full border-4 border-orange-500" />
          )}
        </button>
      </div>

      {/* SELECTOR SEMANAL TIPO PILL */}
      <div className="px-6">
        <div className="flex justify-between bg-white/70 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-sm border border-white">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`flex flex-col items-center justify-center min-w-[45px] py-4 rounded-[1.8rem] transition-all ${
                  active ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="text-[8px] font-black uppercase tracking-tighter mb-1">{format(day, "EE", { locale: es })}</span>
                <span className="text-base font-black">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PARRILLA HORARIA (STYLE GROUPCAL) */}
      <div className="px-4 relative mt-4">
        {/* Línea de tiempo vertical */}
        <div className="absolute left-16 top-0 bottom-0 w-[1px] bg-slate-200/50" />
        
        <div className="space-y-1">
          {dayHours.map((hour) => {
            const hourStr = format(hour, "HH:00");
            const hourEvents = events.filter(e => 
              isSameDay(new Date(e.start_time), selectedDate) && 
              format(new Date(e.start_time), "HH:00") === hourStr
            );

            return (
              <div key={hourStr} className="flex gap-4 group">
                {/* Indicador de Hora */}
                <div className="w-12 text-right pt-2">
                  <span className="text-[9px] font-black text-slate-300 group-hover:text-sky-500 transition-colors">
                    {hourStr}
                  </span>
                </div>

                {/* Slot de Eventos */}
                <div className={`flex-1 min-h-[90px] rounded-3xl transition-colors ${hourEvents.length === 0 ? 'border-b border-slate-100/40' : ''}`}>
                  <div className="space-y-3 pb-4">
                    <AnimatePresence>
                      {hourEvents.map((event) => (
                        <AgendaCard 
                          key={event.id}
                          event={event}
                          isCreator={event.created_by === profile?.id}
                          assignedMember={members.find((m: any) => m.id === event.assigned_to)}
                          onClick={() => console.log("Detalle", event.title)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
