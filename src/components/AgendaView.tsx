import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, Bell, Lock, AlertTriangle, ShieldCheck, 
  Share2, Heart, Calendar as CalendarIcon, ChevronRight, Users
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { NotificationsDrawer } from './NotificationsDrawer';

// Función de vibración para feedback táctil
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
  const [nestId, setNestId] = useState<string | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const fetchUnreadCount = async (nid: string) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('nest_id', nid)
      .eq('status', 'pending');
    setUnreadCount(count || 0);
  };

  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('nest_id').eq('id', user.id).single();
    if (profile) {
      setNestId(profile.nest_id);
      fetchUnreadCount(profile.nest_id);
    }

    const { data: eventsData, error } = await supabase
      .from('events')
      .select(`*, profiles!events_assigned_to_fkey (display_name, avatar_url, id)`)
      .eq('nest_id', profile?.nest_id)
      .order('event_date', { ascending: true });

    if (!error && eventsData) {
      detectCollisions(eventsData);
      setEvents(eventsData);
    }
    setLoading(false);
  };

  const detectCollisions = (allEvents: any[]) => {
    const conflictIds: string[] = [];
    allEvents.forEach((e1, idx) => {
      allEvents.forEach((e2, idx2) => {
        if (idx !== idx2 && e1.assigned_to === e2.assigned_to) {
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
      message: `Petición de relevo: ${event.description}`
    });

    if (!error) {
      toast({ title: "Relevo en camino", description: "Notificando a la tribu..." });
      triggerHaptic('success');
    }
  };

  useEffect(() => { 
    fetchEvents(); 
    if (nestId) {
      const channel = supabase.channel('notif-count').on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `nest_id=eq.${nestId}` }, 
        () => fetchUnreadCount(nestId)
      ).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [nestId]);

  return (
    <div className="space-y-10 pb-32 animate-in fade-in duration-700 font-sans">
      {/* HEADER DE AGENDA */}
      <div className="flex justify-between items-end px-6">
        <div>
          <h2 className="text-5xl font-black text-slate-800 tracking-tight">Agenda</h2>
          <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mt-1">Sincro de la Tribu</p>
        </div>
        <button 
          onClick={() => { triggerHaptic('soft'); setIsNotifOpen(true); }}
          className={`w-16 h-16 rounded-5xl flex items-center justify-center transition-all duration-500 ${unreadCount > 0 ? 'bg-orange-50 text-secondary shadow-haptic animate-pulse' : 'bg-white text-slate-300 shadow-brisa'}`}
        >
          <Bell size={28} strokeWidth={2.5} />
          {unreadCount > 0 && <span className="absolute top-4 right-4 w-4 h-4 bg-secondary rounded-full border-4 border-white" />}
        </button>
      </div>

      {/* CALENDARIO SEMANAL FLUIDO */}
      <div className="px-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pb-4">
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            return (
              <button 
                key={i}
                onClick={() => { triggerHaptic('soft'); setSelectedDate(day); }}
                className={`flex-shrink-0 w-20 h-28 rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 ${isSelected ? 'bg-slate-800 text-white shadow-haptic scale-105' : 'bg-white/60 backdrop-blur-md text-slate-400 border border-white/50 shadow-brisa'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">{format(day, 'EEE', { locale: es })}</span>
                <span className="text-2xl font-black">{format(day, 'd')}</span>
                {events.some(e => isSameDay(new Date(e.event_date), day)) && 
                  <div className={`w-2 h-2 rounded-full mt-2 ${isSelected ? 'bg-primary' : 'bg-slate-200'}`} />
                }
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTADO DE ACTIVIDADES */}
      <div className="px-6 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Próximos Pasos</h3>
          <ChevronRight size={18} className="text-slate-300" />
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-[3.5rem] border-4 border-dashed border-white/60">
            <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4 opacity-50" />
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">Paz total en el nido</p>
          </div>
        ) : (
          events.filter(e => isSameDay(new Date(e.event_date), selectedDate)).map((event) => {
            const isConflict = conflicts.includes(event.id);
            return (
              <div key={event.id} className={`p-8 rounded-[3.5rem] backdrop-blur-2xl border transition-all duration-500 bg-white/80 border-white/60 shadow-tribu-card ${isConflict ? 'ring-4 ring-secondary/20 scale-[0.98]' : ''}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-3">
                    {isConflict && (
                      <div className="flex items-center gap-2 bg-secondary/10 px-4 py-1.5 rounded-full w-fit">
                        <AlertTriangle size={14} className="text-secondary" />
                        <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Solapamiento</span>
                      </div>
                    )}
                    <h4 className="text-2xl font-black text-slate-800 leading-tight">{event.description}</h4>
                  </div>
                  <div className="bg-slate-50 px-4 py-2.5 rounded-3xl border border-white shadow-inner">
                    <span className="text-sm font-black text-primary">{format(new Date(event.event_date), "HH:mm")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-haptic" style={{ backgroundColor: event.profiles?.avatar_url || '#0EA5E9' }}>
                      {event.profiles?.display_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">En cargo de</p>
                      <p className="text-sm font-black text-slate-700">{event.profiles?.display_name || 'Tribu'}</p>
                    </div>
                  </div>

                  {isConflict ? (
                    <div className="flex gap-3">
                      <button onClick={() => handleDelegarInterno(event)} className="p-4 bg-primary/10 text-primary rounded-2xl active:scale-90 transition-all">
                        <Share2 size={20} strokeWidth={3} />
                      </button>
                      <button className="p-4 bg-secondary/10 text-secondary rounded-2xl active:scale-90 transition-all">
                        <Heart size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-mint bg-mint/5 px-4 py-2 rounded-2xl">
                      <ShieldCheck size={16} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Fluyendo</span>
                    </div>
                  )}
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
