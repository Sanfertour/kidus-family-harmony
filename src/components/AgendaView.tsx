import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, AlertTriangle, Share2, Calendar as CalendarIcon, 
  ChevronRight, ChevronLeft, MapPin, Sparkles, Clock, Star,
  Loader2, Settings2 
} from 'lucide-react';
import { 
  format, startOfWeek, addDays, isSameDay, 
  addWeeks, subWeeks, isToday, differenceInHours 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { NotificationsDrawer } from './NotificationsDrawer';

type ReminderLeadTime = '30m' | '1h' | '24h';

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
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

  const detectCollisions = (eventsData: any[]) => {
    // Lógica para detectar conflictos de horarios
    const collisionIds: string[] = [];
    // ... implementación de colisiones ...
    setConflicts(collisionIds);
  };

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
          detectCollisions(eventsData);
          setEvents(eventsData);
        }
        
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false); 
        
        setUnreadCount(count || 0);
      }
    } catch (e) {
      console.error("Error en la sincronización:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [nestId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans overflow-x-hidden">
      
      {/* HEADER DINÁMICO */}
      <div className="relative pt-12 pb-8 px-8 overflow-hidden bg-white">
        <div className="relative flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-6xl font-black text-slate-800 tracking-tighter font-nunito leading-tight">Agenda</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-orange-500 rounded-full" />
                <p className="text-[11px] font-black text-sky-500 uppercase tracking-[0.3em]">Nido Sincronizado</p>
              </div>
              
              <button 
                onClick={() => { triggerHaptic('soft'); setShowSettings(!showSettings); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${showSettings ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                <Settings2 size={12} />
                <span className="text-[9px] font-black uppercase tracking-tighter">{reminderTime}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
             <button 
                onClick={() => { triggerHaptic('soft'); setIsNotifOpen(true); }}
                className={`relative w-16 h-16 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 bg-slate-800 text-white`}
              >
                <Bell size={24} strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-7 h-7 bg-white text-[#F97316] rounded-full border-[3px] border-[#F97316] flex items-center justify-center text-[10px] font-black shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>
          </div>
        </div>

        {/* PANEL DE AJUSTES CORREGIDO */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 flex gap-2 overflow-hidden"
            >
              {(['30m', '1h', '24h'] as ReminderLeadTime[]).map((time) => (
                <button
                  key={time}
                  onClick={() => { triggerHaptic('success'); setReminderTime(time); setShowSettings(false); }}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${reminderTime === time ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' : 'bg-slate-50 text-slate-400'}`}
                >
                  Aviso {time}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RESTO DEL COMPONENTE SE MANTIENE... */}
      <NotificationsDrawer isOpen={isNotifOpen} onClose={() => { setIsNotifOpen(false); fetchEvents(); }} nestId={nestId} />
    </div>
  );
};
