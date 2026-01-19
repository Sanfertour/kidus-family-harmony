import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNestStore } from '@/store/useNestStore'; // Integración con el Cerebro Global
import { 
  Bell, AlertTriangle, ChevronRight, ChevronLeft, 
  Sparkles, Clock, Star, Loader2, Edit3, Settings2 
} from 'lucide-react';
import { 
  format, startOfWeek, addDays, isSameDay, 
  addWeeks, subWeeks, isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { NotificationsDrawer } from './NotificationsDrawer';
import { triggerHaptic } from "@/utils/haptics";

type ReminderLeadTime = '30m' | '1h' | '24h' | 'none';

export const AgendaView = () => {
  // --- STORE & STATE ---
  const { nestId, profile } = useNestStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const { toast } = useToast();

  // --- LÓGICA DE DATOS ---
  const fetchAgendaData = async () => {
    if (!nestId) return;
    
    try {
      // 1. Cargar Eventos con relación al perfil
      const { data: eventsData } = await supabase
        .from('events')
        .select(`*, profiles (display_name, avatar_url, id)`) // Simplificado según tu esquema
        .eq('nest_id', nestId)
        .order('start_time', { ascending: true });

      if (eventsData) {
        setEvents(eventsData);
        // Lógica de detección de colisiones (Conflictos en la Tribu)
        const conflictIds = eventsData.filter((e1, i) => 
          eventsData.some((e2, j) => 
            i !== j && 
            isSameDay(new Date(e1.start_time), new Date(e2.start_time)) &&
            Math.abs(new Date(e1.start_time).getTime() - new Date(e2.start_time).getTime()) < 3600000
          )
        ).map(e => e.id);
        setConflicts(conflictIds);
      }

      // 2. Notificaciones pendientes
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', profile?.id)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
    } catch (e) {
      console.error("Error en sincronía de agenda:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- REALTIME ---
  useEffect(() => {
    fetchAgendaData();

    if (!nestId) return;

    const channel = supabase.channel(`agenda-${nestId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'events', 
        filter: `nest_id=eq.${nestId}` 
      }, () => fetchAgendaData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [nestId, selectedDate]); // Recarga si cambia el nido o la fecha de enfoque

  const updateReminder = async (eventId: string, time: ReminderLeadTime) => {
    triggerHaptic('success');
    const { error } = await supabase
      .from('events')
      .update({ reminder_setting: time })
      .eq('id', eventId);
    
    if (!error) {
      toast({ title: "Sincronía Editada", description: `Aviso para la tribu: ${time}.` });
      setEditingEventId(null);
      fetchAgendaData();
    }
  };

  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent gap-4">
      <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leyendo el tiempo...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-32 font-sans selection:bg-sky-100 overflow-x-hidden">
      
      {/* HEADER ZEN */}
      <header className="pt-10 pb-12 px-2">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">Agenda</h2>
            <div className="flex items-center gap-3">
              <span className="h-1 w-8 bg-orange-500 rounded-full" />
              <p className="text-[9px] font-black text-sky-500 uppercase tracking-[0.4em]">Sincronía Realtime</p>
            </div>
          </div>

          <button 
            onClick={() => { triggerHaptic('soft'); setIsNotifOpen(true); }}
            className="relative w-16 h-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
          >
            <Bell size={24} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 text-white rounded-full border-4 border-slate-50 flex items-center justify-center text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CALENDARIO GLASSMORPHISM */}
      <section className="mb-10">
        <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/60 shadow-brisa">
          <div className="flex justify-between items-center px-4 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} className="p-2 text-slate-400"><ChevronLeft size={18}/></button>
              <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} className="p-2 text-slate-400"><ChevronRight size={18}/></button>
            </div>
          </div>
          <div className="flex justify-between">
            {weekDays.map((day, i) => {
              const active = isSameDay(day, selectedDate);
              return (
                <button
                  key={i}
                  onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                  className={`w-[13%] py-5 rounded-[1.8rem] flex flex-col items-center transition-all ${active ? 'bg-slate-900 text-white shadow-xl -translate-y-2' : 'text-slate-400 hover:bg-white/50'}`}
                >
                  <span className="text-[7px] font-black uppercase mb-1">{format(day, 'EEE', { locale: es })}</span>
                  <span className="text-lg font-black">{format(day, 'd')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* LISTA DE EVENTOS */}
      <main className="space-y-6">
        <AnimatePresence mode="popLayout">
          {events.filter(e => isSameDay(new Date(e.start_time), selectedDate)).length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center space-y-4">
              <Sparkles size={48} className="mx-auto text-slate-200" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Paz en el Nido</p>
            </motion.div>
          ) : (
            events.filter(e => isSameDay(new Date(e.start_time), selectedDate)).map((event) => (
              <motion.div 
                layout
                key={event.id}
                onClick={() => { triggerHaptic('soft'); setEditingEventId(editingEventId === event.id ? null : event.id); }}
                className="p-8 rounded-[3rem] bg-white border border-white shadow-sm hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                {conflicts.includes(event.id) && (
                  <div className="absolute top-0 right-10 bg-rose-500 text-white text-[8px] font-black px-4 py-2 rounded-b-xl flex items-center gap-2">
                    <AlertTriangle size={10} /> SOLAPE
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sky-500">
                      <Clock size={14} strokeWidth={3} />
                      <span className="text-xs font-black tracking-widest">{format(new Date(event.start_time), "HH:mm")}</span>
                    </div>
                    <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{event.title}</h4>
                  </div>
                </div>

                {/* Edición de Avisos */}
                <AnimatePresence>
                  {editingEventId === event.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="pt-4 mt-4 border-t border-slate-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-2">
                        {(['30m', '1h', '24h', 'none'] as ReminderLeadTime[]).map((time) => (
                          <button
                            key={time}
                            onClick={() => updateReminder(event.id, time)}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase ${event.reminder_setting === time ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 border border-white overflow-hidden">
                       {event.profiles?.avatar_url?.startsWith('#') ? (
                         <div className="w-full h-full" style={{ backgroundColor: event.profiles.avatar_url }} />
                       ) : (
                         <img src={event.profiles?.avatar_url} className="w-full h-full object-cover" />
                       )}
                    </div>
                    <span className="text-xs font-black text-slate-600">{event.profiles?.display_name}</span>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      <NotificationsDrawer 
        isOpen={isNotifOpen} 
        onClose={() => { setIsNotifOpen(false); fetchAgendaData(); }} 
        nestId={nestId || ""} 
      />
    </div>
  );
};
                                                 
