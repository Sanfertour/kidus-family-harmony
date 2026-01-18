import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

type ReminderLeadTime = '30m' | '1h' | '24h' | 'none';

const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else if (type === 'warning') navigator.vibrate([40, 100, 40]);
    else navigator.vibrate([20, 30, 20]);
  }
};

export const AgendaView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [nestId, setNestId] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchSyncData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('nest_id').eq('id', user.id).maybeSingle();
      
      if (profile?.nest_id) {
        setNestId(profile.nest_id);
        
        const { data: eventsData } = await supabase
          .from('events')
          .select(`*, profiles!events_member_id_fkey (display_name, avatar_url, id)`)
          .eq('nest_id', profile.nest_id)
          .order('start_time', { ascending: true });

        if (eventsData) {
          setEvents(eventsData);
          const conflictIds = eventsData.filter((e1, i) => 
            eventsData.some((e2, j) => i !== j && e1.member_id === e2.member_id && 
            Math.abs(new Date(e1.start_time).getTime() - new Date(e2.start_time).getTime()) < 3600000)
          ).map(e => e.id);
          setConflicts(conflictIds);
        }

        const { count } = await supabase.from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id).eq('is_read', false);
        setUnreadCount(count || 0);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSyncData();
    if (!nestId) return;

    const channel = supabase.channel('nido-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `nest_id=eq.${nestId}` }, 
        () => { fetchSyncData(); }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        () => { triggerHaptic('warning'); fetchSyncData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [nestId]);

  const updateReminder = async (eventId: string, time: ReminderLeadTime) => {
    triggerHaptic('success');
    const { error } = await supabase.from('events').update({ reminder_setting: time }).eq('id', eventId);
    if (!error) {
      toast({ title: "Sincronía Editada", description: `Aviso para la tribu: ${time}.` });
      setEditingEventId(null);
      fetchSyncData();
    }
  };

  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pb-32 font-sans selection:bg-sky-100 overflow-x-hidden">
      
      {/* HEADER ZEN - Ajustado margen para la campana */}
      <header className="pt-20 pb-12 px-12">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-7xl font-black text-slate-800 tracking-tighter font-nunito leading-none">Agenda</h2>
            <div className="flex items-center gap-4">
              <span className="h-1.5 w-10 bg-[#F97316] rounded-full" />
              <p className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em]">Sincronía Realtime</p>
            </div>
          </div>

          <button 
            onClick={() => { triggerHaptic('soft'); setIsNotifOpen(true); }}
            className="relative w-20 h-20 rounded-[2.5rem] bg-slate-800 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all duration-400 ml-6"
          >
            <Bell size={28} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#F97316] text-white rounded-full border-4 border-slate-50 flex items-center justify-center text-xs font-black shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* CALENDARIO GLASSMORPHISM */}
      <section className="px-8 -mt-4">
        <div className="bg-white/40 backdrop-blur-3xl p-6 rounded-[3.5rem] border border-white/60 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center px-4 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
            </span>
            <div className="flex gap-1">
              <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(subWeeks(currentWeekStart, 1)); }} className="p-2 text-slate-300 active:scale-75 transition-all"><ChevronLeft size={20}/></button>
              <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(addWeeks(currentWeekStart, 1)); }} className="p-2 text-slate-300 active:scale-75 transition-all"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="flex justify-between">
            {weekDays.map((day, i) => {
              const active = isSameDay(day, selectedDate);
              return (
                <button
                  key={i}
                  onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                  className={`w-[13%] py-6 rounded-[2.2rem] flex flex-col items-center transition-all duration-500 ${active ? 'bg-slate-800 text-white shadow-2xl -translate-y-3' : 'text-slate-400 hover:bg-white/30'}`}
                >
                  <span className="text-[8px] font-black uppercase mb-2 opacity-60">{format(day, 'EEE', { locale: es })}</span>
                  <span className="text-xl font-black">{format(day, 'd')}</span>
                  {isToday(day) && !active && <div className="w-1.5 h-1.5 bg-[#F97316] rounded-full mt-2" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FLUJO DE LA TRIBU */}
      <main className="px-10 mt-12 space-y-6">
        <div className="flex items-center gap-4 opacity-40 mb-8">
          <Star size={14} className="text-slate-800 fill-slate-800" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">Flujo de la Tribu</h3>
        </div>

        <AnimatePresence mode="popLayout">
          {events.filter(e => isSameDay(new Date(e.start_time), selectedDate)).length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <Sparkles size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Paz en el Nido</p>
            </motion.div>
          ) : (
            events.filter(e => isSameDay(new Date(e.start_time), selectedDate)).map((event) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={event.id}
                onClick={() => { triggerHaptic('soft'); setEditingEventId(editingEventId === event.id ? null : event.id); }}
                className={`group relative p-8 rounded-[3.5rem] transition-all duration-500 border border-white/80 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 cursor-pointer overflow-hidden ${editingEventId === event.id ? 'ring-2 ring-sky-500/20' : ''}`}
              >
                {conflicts.includes(event.id) && (
                  <div className="absolute -top-1 left-12 bg-red-500 text-white text-[8px] font-black px-4 py-2 rounded-b-2xl shadow-lg flex items-center gap-2 animate-bounce">
                    <AlertTriangle size={10} /> SOLAPE EN TRIBU
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50/50 rounded-full">
                      <Clock size={12} className="text-sky-500" />
                      <span className="text-[10px] font-black text-slate-600 tracking-widest">{format(new Date(event.start_time), "HH:mm")}</span>
                    </div>
                    <h4 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{event.title}</h4>
                  </div>
                  <div className="p-5 rounded-[1.8rem] bg-slate-50/50 text-slate-400 group-hover:text-sky-500 transition-all">
                    {editingEventId === event.id ? <Settings2 size={20} className="animate-spin-slow" /> : <Edit3 size={20} />}
                  </div>
                </div>

                <AnimatePresence>
                  {editingEventId === event.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="mb-6 pt-4 border-t border-slate-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Aviso Prioritario</p>
                      <div className="flex gap-2">
                        {(['30m', '1h', '24h', 'none'] as ReminderLeadTime[]).map((time) => (
                          <button
                            key={time}
                            onClick={() => updateReminder(event.id, time)}
                            className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${event.reminder_setting === time ? 'bg-sky-500 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            {time === 'none' ? 'Off' : time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.4rem] bg-slate-100/50 flex items-center justify-center font-black text-slate-400 text-sm overflow-hidden border border-white">
                      {event.profiles?.avatar_url ? <img src={event.profiles.avatar_url} className="w-full h-full object-cover" /> : event.profiles?.display_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Responsable</p>
                      <p className="text-sm font-black text-slate-700">{event.profiles?.display_name || 'Tribu'}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-200 group-hover:text-sky-500 group-hover:translate-x-2 transition-all" />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </main>

      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => { setIsNotifOpen(false); fetchSyncData(); }} nestId={nestId} />
    </div>
  );
};
