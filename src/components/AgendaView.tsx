import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNestStore } from '@/store/useNestStore';
import { ChevronRight, ChevronLeft, Sparkles, Loader2, Calendar as CalendarIcon } from 'lucide-react';
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

  const fetchEvents = async () => {
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
  };

  useEffect(() => {
    if (nestId) {
      fetchEvents();
      
      // Sincronía Realtime: Escuchar cambios en el Nido
      const channel = supabase.channel(`nest-changes-${nestId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'events', 
          filter: `nest_id=eq.${nestId}` 
        }, () => {
          fetchEvents();
          triggerHaptic('soft');
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [nestId]);

  const checkConflict = (currentEvent: any) => {
    return events.some(e => 
      e.id !== currentEvent.id &&
      isSameDay(parseISO(e.start_time), parseISO(currentEvent.start_time)) &&
      Math.abs(new Date(e.start_time).getTime() - new Date(currentEvent.start_time).getTime()) < 3600000
    );
  };

  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  if (loading) return (
    <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Sincronizando...</p>
    </div>
  );

  const dailyEvents = events.filter(e => isSameDay(parseISO(e.start_time), selectedDate));

  return (
    <div className="pb-40">
      <header className="flex justify-between items-end mb-8 px-2 pt-4">
        <div>
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-1">
            {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })}
          </p>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Agenda</h2>
        </div>
        <div className="flex gap-2 mb-1">
           <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(subWeeks(currentWeekStart, 1)); }} className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-90 transition-all"><ChevronLeft size={20}/></button>
           <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(addWeeks(currentWeekStart, 1)); }} className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-90 transition-all"><ChevronRight size={20}/></button>
        </div>
      </header>

      {/* Selector de Fecha Estilo Mobile */}
      <nav className="flex justify-between gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = events.some(e => isSameDay(parseISO(e.start_time), day));
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
              className={`flex-shrink-0 w-14 py-5 rounded-[2.2rem] flex flex-col items-center transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-2xl -translate-y-2' : 'bg-white/70 text-slate-400 border border-white'}`}
            >
              <span className="text-[8px] font-black uppercase mb-1.5">{format(day, 'EEE', { locale: es })}</span>
              <span className="text-lg font-black">{format(day, 'd')}</span>
              {hasEvents && <div className={`w-1 h-1 rounded-full mt-1.5 ${isSelected ? 'bg-sky-400' : 'bg-slate-300'}`} />}
            </motion.button>
          );
        })}
      </nav>

      <main className="space-y-4 px-1">
        <AnimatePresence mode="popLayout">
          {dailyEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="py-24 flex flex-col items-center justify-center text-center bg-white/40 rounded-[3rem] border border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <CalendarIcon size={28} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Nido en calma</p>
            </motion.div>
          ) : (
            dailyEvents.map((event) => (
              <AgendaCard 
                key={event.id}
                event={event}
                isCreator={event.created_by === profile?.id}
                hasConflict={checkConflict(event)}
                onClick={() => triggerHaptic('medium')}
              />
            ))
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
