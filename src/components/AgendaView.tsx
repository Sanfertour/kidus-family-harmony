import { useState, useMemo } from "react";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Lock, Sparkles, Utensils, GraduationCap, 
  HeartPulse, Trophy, Calendar as CalendarIcon, Loader2, Bell
} from "lucide-react";
import { 
  format, isToday, isTomorrow, startOfDay, addDays, 
  startOfWeek, isSameDay, eachDayOfInterval 
} from "date-fns";
import { es } from "date-fns/locale";
import { triggerHaptic } from "@/utils/haptics";

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

  // Generar semana actual (7 días desde el inicio de la semana)
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
      {/* 1. HEADER LOGÍSTICO CON NOTIFICACIONES */}
      <div className="px-8 flex justify-between items-end pt-4">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 mb-1 italic">Sincronía Semanal</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter capitalize">
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

      {/* 2. SELECTOR DE 7 DÍAS (Timeline Brisa) */}
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

      {/* 3. LISTA DE EVENTOS DEL DÍA */}
      <div className="px-6 space-y-6">
        <div className="flex items-center gap-4 px-2">
           <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
             {isToday(selectedDate) ? "Hoy" : format(selectedDate, "EEEE d", { locale: es })}
           </h3>
           <div className="h-[1px] flex-1 bg-slate-200" />
        </div>

        <AnimatePresence mode="popLayout">
          {dayEvents.length > 0 ? (
            dayEvents.map((event) => {
              const isOwner = event.created_by === profile?.id;
              const isPrivateContent = event.is_private && !isOwner;
              // Aquí buscamos al miembro para obtener su COLOR de la Tribu
              const assignedMember = members.find(m => m.id === event.assigned_to);
              const memberColor = assignedMember?.color || '#0ea5e9';

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group bg-white/80 backdrop-blur-2xl rounded-[3rem] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white active:scale-[0.98] transition-all"
                >
                  {/* Indicador de Color de la Tribu */}
                  {assignedMember && !isPrivateContent && (
                    <div 
                      className="absolute left-0 top-8 bottom-8 w-1.5 rounded-r-full shadow-sm"
                      style={{ backgroundColor: memberColor }}
                    />
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div 
                        className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${
                          isPrivateContent ? 'bg-slate-900 text-orange-400' : 'bg-slate-50 text-slate-600'
                        }`}
                        style={!isPrivateContent ? { color: memberColor } : {}}
                      >
                        {isPrivateContent ? <Lock size={20} /> : (CATEGORY_ICONS[event.category] || <Sparkles size={20} />)}
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className={`font-black tracking-tight italic ${isPrivateContent ? 'text-slate-400' : 'text-slate-900 text-lg'}`}>
                          {isPrivateContent ? "Evento Privado" : event.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-400 flex items-center gap-1">
                            <Clock size={12} strokeWidth={3} className="text-sky-500" />
                            {format(new Date(event.start_time), "HH:mm")}
                          </span>
                          {assignedMember && !isPrivateContent && (
                            <span 
                              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${memberColor}15`, color: memberColor }}
                            >
                              {assignedMember.display_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Avatar de la inicial con Color de la Tribu */}
                    {!isPrivateContent && assignedMember && (
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-[10px] font-black shadow-lg border-2 border-white"
                        style={{ backgroundColor: memberColor }}
                      >
                        {assignedMember.display_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Nido en calma para este día</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
                            
