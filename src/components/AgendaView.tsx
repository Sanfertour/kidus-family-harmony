import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Lock, Sparkles, Utensils, GraduationCap, 
  HeartPulse, Trophy, Calendar as CalendarIcon 
} from "lucide-react";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

const CATEGORY_ICONS: any = {
  school: <GraduationCap size={16} />,
  meal: <Utensils size={16} />,
  health: <HeartPulse size={16} />,
  activity: <Trophy size={16} />,
  other: <Sparkles size={16} />,
};

export const AgendaView = () => {
  const { events, members, profile, loading } = useNestStore();

  // LÓGICA DE AGRUPACIÓN POR FECHA
  const groupEventsByDate = () => {
    const groups: { [key: string]: any[] } = {};
    
    events.forEach(event => {
      const dateKey = startOfDay(new Date(event.start_time)).toISOString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const groupedEvents = groupEventsByDate();

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center opacity-40">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Nido...</p>
    </div>
  );

  if (events.length === 0) return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 p-12 text-center rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200"
    >
      <CalendarIcon size={40} className="mx-auto mb-4 text-slate-300" />
      <h3 className="text-lg font-black text-slate-400 italic">El Nido está en calma</h3>
      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-2">No hay planes programados</p>
    </motion.div>
  );

  return (
    <div className="space-y-10 pb-20">
      {groupedEvents.map(([date, dayEvents]) => (
        <div key={date} className="space-y-4">
          {/* SEPARADOR DE DÍA */}
          <div className="px-6 flex items-center gap-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-600 whitespace-nowrap">
              {isToday(new Date(date)) ? "Hoy" : isTomorrow(new Date(date)) ? "Mañana" : format(new Date(date), "EEEE d", { locale: es })}
            </h3>
            <div className="h-[1px] w-full bg-gradient-to-r from-sky-100 to-transparent" />
          </div>

          <div className="space-y-3 px-4">
            <AnimatePresence mode="popLayout">
              {dayEvents.map((event) => {
                const isOwner = event.created_by === profile?.id;
                const isPrivate = event.is_private && !isOwner;
                const assignedMember = members.find(m => m.id === event.assigned_to);

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group overflow-hidden bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
                  >
                    {/* Barra lateral de color del miembro */}
                    {assignedMember && (
                      <div 
                        className="absolute left-0 top-6 bottom-6 w-1.5 rounded-r-full"
                        style={{ backgroundColor: assignedMember.avatar_url }}
                      />
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isPrivate ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-500'}`}>
                          {isPrivate ? <Lock size={18} /> : (CATEGORY_ICONS[event.category] || <Sparkles size={18} />)}
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900 tracking-tight italic">
                            {isPrivate ? "Plan Privado" : event.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-sky-400" />
                            <span className="text-[11px] font-bold text-slate-400">
                              {format(new Date(event.start_time), "HH:mm 'h'")}
                            </span>
                            {assignedMember && !isPrivate && (
                              <span className="text-[9px] font-black uppercase tracking-tighter text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                                {assignedMember.display_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Avatar del asignado */}
                      {!isPrivate && assignedMember && (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-inner"
                          style={{ backgroundColor: assignedMember.avatar_url }}
                        >
                          {assignedMember.display_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};

const Loader2 = ({ size, className }: { size: number, className: string }) => (
  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className={className}>
    <Sparkles size={size} />
  </motion.div>
);
