import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, AlertTriangle, Share2, ChevronRight, ChevronLeft, 
  MapPin, Sparkles, Clock, Star, Loader2, Settings2 
} from 'lucide-react';
import { 
  format, startOfWeek, addDays, isSameDay, 
  addWeeks, subWeeks, isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { NotificationsDrawer } from './NotificationsDrawer';

type ReminderLeadTime = '30m' | '1h' | '24h';

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
  const [showSettings, setShowSettings] = useState(false);
  const [reminderTime, setReminderTime] = useState<ReminderLeadTime>('24h');

  const { toast } = useToast();
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('nest_id').eq('id', user.id).maybeSingle();
      
      if (profile?.nest_id) {
        setNestId(profile.nest_id);
        const { data: eventsData, error } = await supabase
          .from('events')
          .select(`*, profiles!events_assigned_to_fkey (display_name, avatar_url, id)`)
          .eq('nest_id', profile.nest_id)
          .order('event_date', { ascending: true });

        if (!error && eventsData) {
          setEvents(eventsData);
          // Detectar colisiones (zen logic)
          const conflictIds = eventsData.filter((e1, i) => 
            eventsData.some((e2, j) => i !== j && e1.assigned_to === e2.assigned_to && 
            Math.abs(new Date(e1.event_date).getTime() - new Date(e2.event_date).getTime()) < 3600000)
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
    fetchEvents();
    if (!nestId) return;
    const channel = supabase.channel('realtime-zen').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `receiver_id=eq.${nestId}` }, 
      () => { triggerHaptic('warning'); fetchEvents(); }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [nestId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-sky-100">
      
      {/* SECCIÓN AIRE (HEADER) */}
      <header className="pt-16 pb-12 px-10 bg-white rounded-b-[4rem] shadow-sm transition-all duration-700">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-7xl font-black text-slate-800 tracking-tighter font-nunito leading-none">Agenda</h2>
            <div className="flex items-center gap-4">
              <span className="h-1.5 w-10 bg-[#F97316] rounded-full" />
              <p className="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em]">Sincroniza tu Nido</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { triggerHaptic('soft'); setShowSettings(!showSettings); }}
              className={`p-4 rounded-[2rem] transition-all duration-400 active:scale-95 ${showSettings ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-400'}`}
            >
              <Settings2 size={24} />
            </button>
            <button 
              onClick={() => { triggerHaptic('soft'); setIsNotifOpen(true); }}
              className="relative w-20 h-20 rounded-[2.5rem] bg-slate-800 text-white flex items-center justify-center shadow-2xl shadow-slate-200 active:scale-90 transition-all duration-400"
            >
              <Bell size={28} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#F97316] text-white rounded-full border-4 border-white flex items-center justify-center text-xs font-black">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-8 flex gap-3">
              {(['30m', '1h', '24h'] as ReminderLeadTime[]).map((time) => (
                <button
                  key={time}
                  onClick={() => { triggerHaptic('success'); setReminderTime(time); setShowSettings(false); }}
                  className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${reminderTime === time ? 'bg-sky-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  Aviso {time}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* SELECTOR DE CALMA (CALENDARIO) */}
      <section className="px-8 -mt-8">
        <div className="bg-white/40 backdrop-blur-2xl p-6 rounded-[3.5rem] border border-white/60 shadow-xl shadow-slate-200/40">
          <div className="flex justify-between items-center px-4 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
            </span>
            <div className="flex gap-1">
              <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(subWeeks(currentWeekStart, 1)); }} className="p-2 text-slate-300 hover:text-sky-500 transition-colors"><ChevronLeft size={20}/></button>
              <button onClick={() => { triggerHaptic('soft'); setCurrentWeekStart(addWeeks(currentWeekStart, 1)); }} className="p-2 text-slate-300 hover:text-sky-500 transition-colors"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="flex justify-between">
            {weekDays.map((day, i) => {
              const active = isSameDay(day, selectedDate);
              return (
                <button
                  key={i}
                  onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                  className={`w-[13%] py-6 rounded-[2.2rem] flex flex-col items-center transition-all duration-500 ${active ? 'bg-slate-800 text-white shadow-2xl -translate-y-3' : 'text-slate-400 hover:bg-white/50'}`}
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

      {/* FLUJO DE LA TRIBU (EVENTOS) */}
      <main className="px-10 mt-12 space-y-8">
        <div className="flex items-center gap-4 opacity-40">
          <Star size={14} className="text-slate-800 fill-slate-800" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">
            {isToday(selectedDate) ? 'Hoy en el Nido' : format(selectedDate, "eeee d", { locale: es })}
          </h3>
        </div>

        <div className="space-y-6">
          {events.filter(e => isSameDay(new Date(e.event_date), selectedDate)).length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Sparkles size={40} className="mx-auto text-slate-200" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Paz en la Tribu</p>
            </div>
          ) : (
            events.filter(e => isSameDay(new Date(e.event_date), selectedDate)).map((event) => (
              <motion.div 
                layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                key={event.id}
                className={`group relative p-8 rounded-[3.5rem] transition-all duration-500 border border-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 bg-white`}
              >
                {conflicts.includes(event.id) && (
                  <div className="absolute -top-3 left-12 bg-red-500 text-white text-[8px] font-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <AlertTriangle size={10} /> SOLAPE
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
                      <Clock size={12} className="text-sky-500" />
                      <span className="text-[10px] font-black text-slate-600 tracking-widest">{format(new Date(event.event_date), "HH:mm")}</span>
                    </div>
                    <h4 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{event.description}</h4>
                  </div>
                  <button className="p-5 rounded-[1.8rem] bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-500 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.4rem] bg-slate-100 flex items-center justify-center font-black text-slate-400 text-sm overflow-hidden">
                      {event.profiles?.avatar_url ? <img src={event.profiles.avatar_url} className="w-full h-full object-cover" /> : event.profiles?.display_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Guía al mando</p>
                      <p className="text-sm font-black text-slate-700">{event.profiles?.display_name || 'Tribu'}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-200 group-hover:text-sky-500 group-hover:translate-x-2 transition-all" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => { setIsNotifOpen(false); fetchEvents(); }} nestId={nestId} />
    </div>
  );
};
