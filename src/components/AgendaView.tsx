import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNestStore } from '@/store/useNestStore';
import { 
  ChevronRight, ChevronLeft, Sparkles, Loader2 
} from 'lucide-react';
import { 
  format, startOfWeek, addDays, isSameDay, 
  addWeeks, subWeeks, parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from "@/utils/haptics";
import { AgendaCard } from "./AgendaCard"; // Importación esencial

export const AgendaView = () => {
  // Usamos el Store global para evitar redundancia
  const { nestId, profile: myProfile } = useNestStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const fetchEvents = async () => {
    if (!nestId) return;
    const { data } = await supabase
      .from('events')
      .select(`*, profiles:assigned_to (display_name, avatar_url, id)`)
      .eq('nest_id', nestId)
      .order('start_time', { ascending: true });
    
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (nestId) fetchEvents();
    
    // Sincronía Realtime
    const channel = supabase.channel(`agenda-${nestId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'events', 
        filter: `nest_id=eq.${nestId}` 
      }, () => fetchEvents())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [nestId]);

  // Función para detectar conflictos de horario (Solapes)
  const checkConflict = (currentEvent: any) => {
    return events.some(e => 
      e.id !== currentEvent.id &&
      isSameDay(parseISO(e.start_time), parseISO(currentEvent.start_time)) &&
      // Detecta si están a menos de 1 hora de diferencia
      Math.abs(new Date(e.start_time).getTime() - new Date(currentEvent.start_time).getTime()) < 3600000
    );
  };

  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sincronizando Nido...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-40 px-4 pt-4">
      {/* HEADER COMPACTO */}
      <header className="flex justify-between items-end mb-8 px-2">
        <div>
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-1">
            {format(selectedDate, "eeee, d 'de' MMMM", { locale: es })}
          </p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Agenda</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(subWeeks(currentWeekStart, 1)); }} className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-90 transition-all"><ChevronLeft size={20}/></button>
           <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(addWeeks(currentWeekStart, 1)); }} className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-90 transition-all"><ChevronRight size={20}/></button>
        </div>
      </header>

      {/* SELECTOR DE DÍA */}
      <nav className="flex justify-between gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = events.some(e => isSameDay(parseISO(e.start_time), day));
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
              className={`flex-shrink-0 w-[13%] min-w-[50px] py-4 rounded-[2rem] flex flex-col items-center transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-2xl -translate-y-2' : 'bg-white/50 text-slate-400'}`}
            >
              <span className="text-[8px] font-black uppercase mb-1">{format(day, 'EEE', { locale: es })}</span>
              <span className="text-base font-black">{format(day, 'd')}</span>
              {hasEvents && !isSelected && <div className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-1" />}
            </motion.button>
          );
        })}
      </nav>

      {/* FEED DE EVENTOS USANDO AGENDACARD */}
      <main className="space-y-4">
        <AnimatePresence mode="popLayout">
          {events.filter(e => isSameDay(parseISO(e.start_time), selectedDate)).length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="py-20 flex flex-col items-center justify-center opacity-30 text-center"
            >
              <Sparkles size={40} className="mb-4 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nido en calma</p>
            </motion.div>
          ) : (
            events
              .filter(e => isSameDay(parseISO(e.start_time), selectedDate))
              .map((event) => (
                <AgendaCard 
                  key={event.id}
                  event={event}
                  isCreator={event.created_by === myProfile?.id}
                  hasConflict={checkConflict(event)}
                  onClick={() => triggerHaptic('medium')} // Aquí conectaremos el Drawer de detalles luego
                />
              ))
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
