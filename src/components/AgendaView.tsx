import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bell, AlertTriangle, ChevronRight, ChevronLeft, 
  Sparkles, Clock, Lock, Loader2, Calendar as CalendarIcon,
  Circle
} from 'lucide-react';
import { 
  format, startOfWeek, addDays, isSameDay, 
  addWeeks, subWeeks, isToday, parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from '@/hooks/use-toast';

export const AgendaView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [myProfile, setMyProfile] = useState<any>(null);
  const [nestId, setNestId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setMyProfile(profile);
        setNestId(profile.nest_id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (nestId) fetchEvents();
    
    // Realtime: Sincronía instantánea del Nido
    const channel = supabase.channel(`nest-${nestId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `nest_id=eq.${nestId}` }, 
      () => fetchEvents())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [nestId]);

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

  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
        <div className="absolute inset-0 bg-sky-500/20 blur-xl animate-pulse rounded-full" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sincronizando Tiempo...</p>
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

      {/* SELECTOR DE DÍA (Horizontal Scroll/Snap) */}
      <nav className="flex justify-between gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasEvents = events.some(e => isSameDay(parseISO(e.start_time), day));
          
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
              className={`flex-shrink-0 w-[13%] min-w-[50px] py-4 rounded-[2rem] flex flex-col items-center transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 -translate-y-2' : 'bg-white/50 text-slate-400'}`}
            >
              <span className="text-[8px] font-black uppercase mb-1">{format(day, 'EEE', { locale: es })}</span>
              <span className="text-base font-black">{format(day, 'd')}</span>
              {hasEvents && !isSelected && <div className="w-1 h-1 bg-sky-400 rounded-full mt-1" />}
            </motion.button>
          );
        })}
      </nav>

      {/* FEED DE EVENTOS */}
      <main className="space-y-4">
        <AnimatePresence mode="wait">
          {events.filter(e => isSameDay(parseISO(e.start_time), selectedDate)).length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="py-20 flex flex-col items-center justify-center opacity-30 text-center"
            >
              <Sparkles size={40} className="mb-4 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nido en calma</p>
            </motion.div>
          ) : (
            events.filter(e => isSameDay(parseISO(e.start_time), selectedDate)).map((event, idx) => {
              const isCreator = event.created_by === myProfile?.id;
              const isLocked = event.is_private && !isCreator;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative group p-6 rounded-[2.5rem] border transition-all ${isLocked ? 'bg-slate-100/50 border-slate-200' : 'bg-white border-white shadow-brisa'}`}
                >
                  <div className="flex gap-4">
                    {/* Línea de tiempo compacta */}
                    <div className="flex flex-col items-center pt-1">
                      <span className="text-[11px] font-black text-slate-900">{format(parseISO(event.start_time), "HH:mm")}</span>
                      <div className="w-[2px] flex-1 bg-slate-100 my-2 rounded-full" />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isLocked ? 'bg-slate-200 text-slate-400' : 'bg-sky-50 text-sky-500'}`}>
                          {isLocked ? 'Privado' : event.category || 'Tribu'}
                        </span>
                        {isLocked && <Lock size={12} className="text-slate-300" />}
                      </div>

                      <h4 className={`text-xl font-black tracking-tight leading-tight ${isLocked ? 'text-slate-300 blur-[2px] select-none' : 'text-slate-800'}`}>
                        {isLocked ? "Evento Confidencial" : event.title}
                      </h4>

                      {!isLocked && (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 border border-white overflow-hidden">
                                {event.profiles?.avatar_url && <img src={event.profiles.avatar_url} className="w-full h-full object-cover" />}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400">{event.profiles?.display_name || "Toda la tribu"}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-200" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
