import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNestStore } from '@/store/useNestStore';
import { ChevronRight, ChevronLeft, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from "@/utils/haptics";
import { AgendaCard } from "./AgendaCard";

export const AgendaView = () => {
  const { nestId, profile } = useNestStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Memorizamos fetchEvents para evitar recreaciones en el useEffect
  const fetchEvents = useCallback(async () => {
    if (!nestId) return;
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles:assigned_to (id, display_name, avatar_url)
      `)
      .eq('nest_id', nestId)
      .order('start_time', { ascending: true });
    
    if (!error) setEvents(data || []);
    setLoading(false);
  }, [nestId]);

  useEffect(() => {
    if (nestId) {
      fetchEvents();
      
      // Sincronía Realtime Blindada: Escuchar cambios específicos del Nido
      const channel = supabase.channel(`nest-changes-${nestId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'events', 
          filter: `nest_id=eq.${nestId}` 
        }, (payload) => {
          console.log("🔄 Sincronía en tiempo real:", payload.eventType);
          fetchEvents();
          // Solo vibramos si el cambio lo hizo el otro Guía (evita vibración doble)
          if (payload.new && (payload.new as any).created_by !== profile?.id) {
            triggerHaptic('success');
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [nestId, fetchEvents, profile?.id]);

  // Pilar: Neutralidad Logística - Detectar solapamientos de agenda
  const checkConflict = (currentEvent: any) => {
    return events.some(e => 
      e.id !== currentEvent.id &&
      isSameDay(parseISO(e.start_time), parseISO(currentEvent.start_time)) &&
      Math.abs(new Date(e.start_time).getTime() - new Date(currentEvent.start_time).getTime()) < 3600000
    );
  };

  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));
  const dailyEvents = events.filter(e => isSameDay(parseISO(e.start_time), selectedDate));

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-12 h-12 text-sky-500 opacity-20" />
      </motion.div>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Sincronizando Nido</p>
    </div>
  );

  return (
    <div className="pb-40 animate-in fade-in duration-700">
      <header className="flex justify-between items-end mb-8 px-2 pt-6">
        <div>
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-1">
            {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })}
          </p>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Agenda</h2>
        </div>
        <div className="flex gap-2 mb-1">
           <button 
             onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(subWeeks(currentWeekStart, 1)); }} 
             className="p-4 rounded-[1.5rem] bg-white shadow-sm border border-slate-100 active:scale-90 active:bg-slate-50 transition-all"
           >
             <ChevronLeft size={20} className="text-slate-400" />
           </button>
           <button 
             onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(addWeeks(currentWeekStart, 1)); }} 
             className="p-4 rounded-[1.5rem] bg-white shadow-sm border border-slate-100 active:scale-90 active:bg-slate-50 transition-all"
           >
             <ChevronRight size={20} className="text-slate-400" />
           </button>
        </div>
      </header>

      {/* Selector de Fecha Estilo Mobile - Estética Brisa */}
      <nav className="flex justify-between gap-2 mb-10 overflow-x-auto pb-6 no-scrollbar px-1">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = events.some(e => isSameDay(parseISO(e.start_time), day));
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
              className={`flex-shrink-0 w-16 py-6 rounded-[2.5rem] flex flex-col items-center transition-all duration-500 ${
                isSelected 
                  ? 'bg-slate-900 text-white shadow-2xl -translate-y-2' 
                  : 'bg-white/70 text-slate-400 border border-white hover:bg-white'
              }`}
            >
              <span className="text-[9px] font-black uppercase mb-2 tracking-tighter">
                {format(day, 'EEE', { locale: es })}
              </span>
              <span className="text-xl font-black">{format(day, 'd')}</span>
              {hasEvents && (
                <div className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-sky-400' : 'bg-slate-200'}`} />
              )}
            </motion.button>
          );
        })}
      </nav>

      <main className="space-y-4 px-1">
        <AnimatePresence mode="popLayout">
          {dailyEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-24 flex flex-col items-center justify-center text-center bg-white/30 backdrop-blur-sm rounded-[3.5rem] border border-dashed border-slate-200 shadow-inner"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200 shadow-sm">
                <CalendarIcon size={32} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Nido en sincronía</p>
              <p className="text-[10px] font-bold text-slate-300 mt-2 italic px-8">Disfruta de la calma, hoy no hay logística pendiente.</p>
            </motion.div>
          ) : (
            dailyEvents.map((event) => (
              <AgendaCard 
                key={event.id}
                event={event}
                currentUserId={profile?.id} // Pasamos el ID para la lógica de Modo Privado
                hasConflict={checkConflict(event)}
              />
            ))
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
