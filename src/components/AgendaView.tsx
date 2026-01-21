import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Lock, Sparkles, Utensils, GraduationCap, 
  HeartPulse, Trophy, Calendar as CalendarIcon, Loader2
} from "lucide-react";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
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

  // Agrupación cronológica inteligente
  const groupEventsByDate = () => {
    const groups: { [key: string]: any[] } = {};
    
    // Filtramos y ordenamos antes de agrupar
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    sortedEvents.forEach(event => {
      const dateKey = startOfDay(new Date(event.start_time)).toISOString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const groupedEvents = groupEventsByDate();

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center opacity-40 animate-pulse">
      <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sincronizando Nido...</p>
    </div>
  );

  if (events.length === 0) return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-6 mt-10 p-16 text-center rounded-[4rem] bg-white/40 backdrop-blur-xl border-2 border-dashed border-slate-200"
    >
      <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
        <CalendarIcon size={40} />
      </div>
      <h3 className="text-xl font-black text-slate-400 italic tracking-tighter">Paz en el Nido</h3>
      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-300 mt-2">No hay planes detectados</p>
    </motion.div>
  );

  return (
    <div className="space-y-12 pb-32 pt-4">
      {groupedEvents.map(([date, dayEvents]) => (
        <div key={date} className="space-y-6">
          {/* Header de Día Estilo Brisa */}
          <div className="px-8 flex items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-sky-600">
                {isToday(new Date(date)) ? "Hoy" : isTomorrow(new Date(date)) ? "Mañana" : format(new Date(date), "EEEE", { locale: es })}
              </h3>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                {format(new Date(date), "d 'de' MMMM", { locale: es })}
              </span>
            </div>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-sky-100 to-transparent self-end mb-2" />
          </div>

          <div className="space-y-4 px-6">
            <AnimatePresence mode="popLayout">
              {dayEvents.map((event) => {
                // Lógica de Privacidad: Si es privado y NO soy el creador, se oculta el contenido
                const isOwner = event.created_by === profile?.id;
                const isPrivateContent = event.is_private && !isOwner;
                const assignedMember = members.find(m => m.id === event.assigned_to);

                return (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => triggerHaptic('soft')}
                    className="relative group bg-white/70 backdrop-blur-2xl rounded-[3rem] p-7 shadow-xl shadow-slate-200/40 border border-white active:scale-[0.97] transition-all cursor-pointer"
                  >
                    {/* Indicador lateral de Miembro */}
                    {assignedMember && !isPrivateContent && (
                      <div 
                        className="absolute left-0 top-10 bottom-10 w-2 rounded-r-full shadow-lg"
                        style={{ backgroundColor: assignedMember.avatar_url || '#0ea5e9' }}
                      />
                    )}

                    <div className="flex justify-between items-center gap-4">
                      <div className="flex gap-5 items-center">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${isPrivateContent ? 'bg-slate-900 text-orange-400' : 'bg-slate-50 text-slate-600 group-hover:bg-sky-500 group-hover:text-white group-hover:rotate-3'}`}>
                          {isPrivateContent ? <Lock size={20} strokeWidth={2.5} /> : (CATEGORY_ICONS[event.category] || <Sparkles size={20} />)}
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className={`font-black tracking-tight leading-tight italic ${isPrivateContent ? 'text-slate-400 text-lg' : 'text-slate-900 text-xl'}`}>
                            {isPrivateContent ? "Plan Privado" : event.title}
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                              <Clock size={12} className="text-sky-500" strokeWidth={3} />
                              <span className="text-[11px] font-black text-slate-600">
                                {format(new Date(event.start_time), "HH:mm")}
                              </span>
                            </div>
                            
                            {assignedMember && !isPrivateContent && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-sky-600 italic">
                                {assignedMember.display_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Avatar dinámico del miembro */}
                      {!isPrivateContent && assignedMember && (
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-xl border-4 border-white"
                          style={{ backgroundColor: assignedMember.avatar_url || '#0ea5e9' }}
                        >
                          {assignedMember.display_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Descripción sutil si existe y no es privado */}
                    {!isPrivateContent && event.description && (
                      <p className="mt-4 ml-[4.5rem] text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    )}
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
