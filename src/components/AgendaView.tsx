import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, Bell, Lock, AlertTriangle, ShieldCheck, 
  Share2, Heart, Calendar as CalendarIcon, ChevronRight, 
  Users, ChevronLeft, MapPin, Sparkles
} from 'lucide-react';
import { 
  format, startOfWeek, addDays, isSameDay, 
  addWeeks, subWeeks, isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { NotificationsDrawer } from './NotificationsDrawer';

const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else if (type === 'warning') navigator.vibrate([40, 100, 40]);
    else navigator.vibrate([20, 30, 20]);
  }
};

// Mapeo de colores KidUs por tipo de evento
const getEventColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'escolar': case 'menú': return 'border-l-[#0EA5E9] text-[#0EA5E9] bg-sky-50/30';
    case 'deporte': case 'extraescolar': return 'border-l-[#F97316] text-[#F97316] bg-orange-50/30';
    case 'salud': return 'border-l-slate-800 text-slate-800 bg-slate-50';
    default: return 'border-l-slate-200 text-slate-400 bg-white';
  }
};

export const AgendaView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Forzamos que la semana empiece el Lunes (weekStartsOn: 1)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [nestId, setNestId] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Generamos siempre 7 días (La semana completa)
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
    }
    setLoading(false);
  };

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

  useEffect(() => { fetchEvents(); }, [nestId]);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700 font-sans bg-slate-50/50 min-h-screen">
      
      {/* HEADER DINÁMICO */}
      <div className="flex justify-between items-end px-8 pt-8">
        <div>
          <h2 className="text-6xl font-black text-slate-800 tracking-tighter font-nunito leading-none">Agenda</h2>
          <p className="text-[11px] font-black text-[#0EA5E9] uppercase tracking-[0.4em] mt-3 ml-1 flex items-center gap-2">
            <Sparkles size={12} /> Sincro de la Tribu
          </p>
        </div>
        <button 
          onClick={() => { triggerHaptic('soft'); setIsNotifOpen(true); }}
          className={`w-16 h-16 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 relative shadow-2xl active:scale-90 ${unreadCount > 0 ? 'bg-[#F97316] text-white animate-bounce' : 'bg-white text-slate-400'}`}
        >
          <Bell size={24} strokeWidth={2.5} />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-[#F97316] text-[10px] font-black rounded-full flex items-center justify-center shadow-md">{unreadCount}</span>}
        </button>
      </div>

      {/* CALENDARIO DE 7 DÍAS */}
      <div className="bg-white/40 backdrop-blur-md py-6 border-y border-white">
        <div className="flex justify-between items-center px-8 mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-slate-800">
            {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
          </span>
          <div className="flex gap-3">
            <button onClick={() => changeWeek('prev')} className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"><ChevronLeft size={20}/></button>
            <button onClick={() => changeWeek('next')} className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="px-6 flex justify-between gap-1">
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDay = isToday(day);
            const hasEvents = events.some(e => isSameDay(new Date(e.event_date), day));
            
            return (
              <button 
                key={i}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`relative flex flex-col items-center justify-center w-[13%] py-6 rounded-[2.2rem] transition-all duration-500 ${isSelected ? 'bg-slate-800 text-white shadow-2xl -translate-y-2' : isTodayDay ? 'bg-[#F97316]/10 text-[#F97316] border-2 border-[#F97316]/20' : 'bg-white/50 text-slate-400'}`}
              >
                <span className="text-[9px] font-black uppercase mb-2">{format(day, 'EEE', { locale: es })}</span>
                <span className="text-xl font-black leading-none">{format(day, 'd')}</span>
                {hasEvents && <div className={`absolute bottom-3 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#0EA5E9]' : 'bg-[#F97316]'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTADO DE ACTIVIDADES */}
      <div className="px-6 space-y-6">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">
          {isToday(selectedDate) ? 'Misiones de hoy' : format(selectedDate, "eeee d 'de' MMMM", { locale: es })}
        </h3>

        {events.filter(e => isSameDay(new Date(e.event_date), selectedDate)).length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3.5rem] border-4 border-dashed border-slate-100">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarIcon size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Nido en calma total</p>
          </div>
        ) : (
          events.filter(e => isSameDay(new Date(e.event_date), selectedDate)).map((event) => {
            const isConflict = conflicts.includes(event.id);
            const colorClass = getEventColor(event.event_type || 'tribu');

            return (
              <div key={event.id} className={`p-8 rounded-[3rem] bg-white border-l-[12px] shadow-xl shadow-slate-200/30 transition-all active:scale-[0.98] ${colorClass} ${isConflict ? 'animate-pulse border-red-500' : ''}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase tracking-tighter opacity-60 flex items-center gap-1">
                        <Clock size={12} /> {format(new Date(event.event_date), "HH:mm")}
                      </span>
                      {isConflict && <span className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-full font-black animate-pulse">¡SOLAPE!</span>}
                    </div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{event.description}</h4>
                    {event.location && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <MapPin size={10} />
                        <span className="text-[10px] font-bold">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg overflow-hidden bg-slate-200">
                      {event.profiles?.avatar_url ? (
                        <img src={event.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        event.profiles?.display_name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Protagonista</p>
                      <p className="text-xs font-black text-slate-700">{event.profiles?.display_name || 'Tribu'}</p>
                    </div>
                  </div>

                  <button onClick={() => handleDelegarInterno(event)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center active:bg-sky-50 active:text-sky-500 transition-all shadow-sm">
                    <Share2 size={18} strokeWidth={2.5} />
                  </button>
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
