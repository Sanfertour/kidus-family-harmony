import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, AlertTriangle, Share2, Calendar as CalendarIcon, 
  ChevronRight, ChevronLeft, MapPin, Sparkles, Clock, Star
} from 'lucide-react';
import { 
  format, startOfWeek, addDays, isSameDay, 
  addWeeks, subWeeks, isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { NotificationsDrawer } from './NotificationsDrawer';

const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else if (type === 'warning') navigator.vibrate([40, 100, 40]);
    else navigator.vibrate([20, 30, 20]);
  }
};

const getEventStyles = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'escolar': case 'menú': 
      return "bg-gradient-to-br from-sky-400 to-sky-600 text-white border-sky-300 shadow-sky-200/50";
    case 'deporte': case 'extraescolar': 
      return "bg-gradient-to-br from-orange-400 to-orange-600 text-white border-orange-300 shadow-orange-200/50";
    case 'salud': 
      return "bg-slate-800 text-white border-slate-700 shadow-slate-300/50";
    default: 
      return "bg-white text-slate-800 border-slate-100 shadow-slate-200/40";
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
  const { toast } = useToast();

  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  const changeWeek = (direction: 'next' | 'prev') => {
    triggerHaptic('soft');
    setCurrentWeekStart(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
  };

  const fetchEvents = async () => {
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
        detectCollisions(eventsData);
        setEvents(eventsData);
      }
      
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false);
      setUnreadCount(count || 0);
    }
    setLoading(false);
  };

  // --- LOGICA TIEMPO REAL Y PUSH ---
  useEffect(() => {
    if (!nestId) return;

    // Solicitar permiso para notificaciones nativas
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `nest_id=eq.${nestId}`
        },
        async (payload) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (payload.new.receiver_id === user?.id) {
            triggerHaptic('warning');
            setUnreadCount(prev => prev + 1);
            
            // Notificación nativa del sistema
            if (Notification.permission === "granted") {
              new Notification("KidUs: Relevo en la Tribu", {
                body: payload.new.message,
                icon: "/favicon.ico"
              });
            }

            toast({
              title: "Sincronía Nido",
              description: payload.new.message,
            });
            fetchEvents(); // Refrescar para ver nuevos cambios
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nestId]);

  const detectCollisions = (allEvents: any[]) => {
    const conflictIds: string[] = [];
    allEvents.forEach((e1, idx) => {
      allEvents.forEach((e2, idx2) => {
        if (idx !== idx2 && e1.assigned_to === e2.assigned_to && e1.assigned_to !== null) {
          const d1 = new Date(e1.event_date).getTime();
          const d2 = new Date(e2.event_date).getTime();
          if (Math.abs(d1 - d2) < 3600000) conflictIds.push(e1.id);
        }
      });
    });
    setConflicts(conflictIds);
    if (conflictIds.length > 0) triggerHaptic('warning');
  };

  const handleDelegarInterno = async (event: any) => {
    triggerHaptic('soft');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !nestId) return;
    const { data: members } = await supabase.from('profiles').select('id').eq('nest_id', nestId).neq('id', user.id);
    const { error } = await supabase.from('notifications').insert({
      nest_id: nestId, sender_id: user.id, receiver_id: members?.[0]?.id || null,
      event_id: event.id, type: 'DELEGATION_REQUEST',
      message: `Relevo: ${event.description}`
    });
    if (!error) {
      toast({ title: "Petición enviada", description: "El otro Guía ha sido notificado." });
      triggerHaptic('success');
    }
  };

  useEffect(() => { fetchEvents(); }, [nestId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans overflow-x-hidden">
      
      <div className="relative pt-12 pb-8 px-8 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-sky-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl" />
        
        <div className="relative flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-6xl font-black text-slate-800 tracking-tighter font-nunito leading-tight">Agenda</h2>
            <div className="flex items-center gap-2">
              <span className="h-1 w-8 bg-orange-500 rounded-full" />
              <p className="text-[11px] font-black text-sky-500 uppercase tracking-[0.3em]">Nido Sincronizado</p>
            </div>
          </div>

          <button 
            onClick={() => { triggerHaptic('soft'); setIsNotifOpen(true); }}
            className={`relative w-16 h-16 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 group
              ${unreadCount > 0 
                ? 'bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white rotate-[-10deg]' 
                : 'bg-slate-800 text-white'}`}
          >
            {unreadCount > 0 && (
              <span className="absolute inset-0 rounded-[2.2rem] bg-[#F97316] animate-ping opacity-40" />
            )}
            
            <Bell 
              size={24} 
              strokeWidth={2.5} 
              className={`${unreadCount > 0 ? 'animate-[bounce_2s_infinite]' : ''} relative z-10`} 
            />
            
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-7 h-7 bg-white text-[#F97316] rounded-full border-[3px] border-[#F97316] flex items-center justify-center text-[10px] font-black shadow-lg z-20"
              >
                {unreadCount}
              </motion.span>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>
      </div>

      <div className="px-6 -mt-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-[3.5rem] shadow-xl border border-white/50">
          <div className="flex justify-between items-center px-6 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{format(currentWeekStart, 'MMMM yyyy', { locale: es })}</p>
            <div className="flex gap-2">
              <button onClick={() => changeWeek('prev')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft size={18} className="text-slate-400"/></button>
              <button onClick={() => changeWeek('next')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight size={18} className="text-slate-400"/></button>
            </div>
          </div>
          
          <div className="flex justify-between gap-1">
            {weekDays.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDay = isToday(day);
              return (
                <button 
                  key={i}
                  onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                  className={`w-[13.5%] py-5 rounded-[2.5rem] flex flex-col items-center transition-all duration-500 ${isSelected ? 'bg-slate-800 text-white shadow-xl -translate-y-2' : isTodayDay ? 'bg-orange-500/10 text-orange-600 border border-orange-200' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  <span className="text-[9px] font-black uppercase mb-1">{format(day, 'EEE', { locale: es })}</span>
                  <span className="text-lg font-black">{format(day, 'd')}</span>
                  {isSelected && <div className="w-1 h-1 bg-sky-400 rounded-full mt-1 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-8 space-y-6">
        <div className="flex items-center gap-3 ml-2">
          <Star size={16} className="text-orange-500 fill-orange-500" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {isToday(selectedDate) ? 'Hoy en el Nido' : format(selectedDate, "eeee d 'de' MMMM", { locale: es })}
          </h3>
        </div>

        {events.filter(e => isSameDay(new Date(e.event_date), selectedDate)).length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-24 h-24 bg-white rounded-[3rem] shadow-inner flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-slate-100" />
            </div>
            <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.4em]">Paz en la Tribu</p>
          </div>
        ) : (
          events.filter(e => isSameDay(new Date(e.event_date), selectedDate)).map((event) => {
            const isConflict = conflicts.includes(event.id);
            const style = getEventStyles(event.event_type || 'tribu');

            return (
              <div key={event.id} className={`group relative p-8 rounded-[3.5rem] border transition-all duration-500 active:scale-95 ${style}`}>
                {isConflict && (
                  <div className="absolute -top-3 left-10 bg-red-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                    <AlertTriangle size={10} /> SOLAPE DE ACTIVIDAD
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 opacity-80">
                      <Clock size={14} strokeWidth={3} />
                      <span className="text-xs font-black tracking-widest uppercase">{format(new Date(event.event_date), "HH:mm")}</span>
                    </div>
                    <h4 className="text-3xl font-black tracking-tight leading-none mb-1">{event.description}</h4>
                    {event.location && (
                      <div className="flex items-center gap-1.5 opacity-70">
                        <MapPin size={12} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-[2rem] border border-white/30" onClick={(e) => { e.stopPropagation(); handleDelegarInterno(event); }}>
                    <Share2 size={20} className="text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-white p-0.5 shadow-lg">
                      <div className="w-full h-full rounded-[1.1rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                        {event.profiles?.avatar_url ? (
                          <img src={event.profiles.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-800 font-black text-xs">{event.profiles?.display_name?.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Asignado a</p>
                      <p className="text-sm font-black">{event.profiles?.display_name || 'Tribu'}</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="opacity-40 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => { setIsNotifOpen(false); fetchEvents(); }} nestId={nestId} />
    </div>
  );
};
