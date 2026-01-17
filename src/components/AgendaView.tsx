import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, User, Bell, Lock, AlertTriangle, ShieldCheck, Share2, Heart, Calendar as CalendarIcon, ChevronRight } from 'lucide-center';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { NotificationsDrawer } from './NotificationsDrawer'; // Asegúrate de que el nombre del archivo coincida

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

  // Función para contar notificaciones pendientes
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
      .select(`
        *,
        profiles!events_assigned_to_fkey (display_name, avatar_url, id)
      `)
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
  };

  const handleDelegarInterno = async (event: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !nestId) return;

    const { data: members } = await supabase
      .from('profiles')
      .select('id')
      .eq('nest_id', nestId)
      .neq('id', user.id);

    const { error } = await supabase.from('notifications').insert({
      nest_id: nestId,
      sender_id: user.id,
      receiver_id: members?.[0]?.id || null,
      event_id: event.id,
      type: 'DELEGATION_REQUEST',
      message: `Petición de relevo para: ${event.description}`
    });

    if (!error) {
      toast({ title: "Solicitud de Relevo", description: "Enviando notificación al equipo del Nido..." });
    }
  };

  const handleRedApoyo = async (event: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !nestId) return;

    const nombreApoyo = prompt("¿Quién de la Red de Apoyo se encarga? (Ej: Abuela Carmen)");
    if (!nombreApoyo) return;

    const { error } = await supabase.from('notifications').insert({
      nest_id: nestId,
      sender_id: user.id,
      event_id: event.id,
      type: 'EXTERNAL_SUPPORT_NOTICE',
      message: `${nombreApoyo} se encargará de: ${event.description}`,
      metadata: { externo: nombreApoyo }
    });

    if (!error) {
      toast({ 
        title: "Red de Apoyo Activada", 
        description: `Se ha avisado al nido que ${nombreApoyo} se encarga.`,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200"
      });
    }
  };

  useEffect(() => { 
    fetchEvents(); 
    
    // Suscripción para que el puntito de la campana se actualice solo
    if (nestId) {
      const channel = supabase
        .channel('notif-count')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'notifications', filter: `nest_id=eq.${nestId}` }, 
          () => fetchUnreadCount(nestId)
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [nestId]);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700 font-nunito">
      {/* HEADER Y CAMPANA */}
      <div className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Agenda</h2>
          <p className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.3em]">Sincronización Familiar</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(true)}
            className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all ${unreadCount > 0 ? 'bg-orange-50 text-orange-500 shadow-lg shadow-orange-100 animate-pulse' : 'bg-white text-slate-300 shadow-sm border border-slate-100'}`}
          >
            <Bell size={24} strokeWidth={2.5} />
            {unreadCount > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-orange-600 rounded-full border-2 border-white" />}
          </button>
        </div>
      </div>

      {/* MINI CALENDARIO SEMANAL */}
      <div className="px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 pb-2">
          {weekDays.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const hasEvents = events.some(e => isSameDay(new Date(e.event_date), day));
            return (
              <button 
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-16 h-24 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-50'}`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest mb-2">{format(day, 'EEE', { locale: es })}</span>
                <span className="text-xl font-black">{format(day, 'd')}</span>
                {hasEvents && <div className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTADO DE EVENTOS */}
      <div className="px-4 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tareas Próximas</h3>
          <ChevronRight size={16} className="text-slate-300" />
        </div>

        {events.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <CalendarIcon size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">No hay planes para hoy</p>
          </div>
        ) : (
          events.map((event) => {
            const isConflict = conflicts.includes(event.id);
            const isPrivate = event.is_private;
            return (
              <div key={event.id} className="relative group">
                <div className={`p-8 rounded-[3rem] backdrop-blur-md border transition-all duration-500 ${isPrivate ? 'bg-slate-900/5 border-slate-200' : 'bg-white/80 border-white/50 shadow-xl shadow-slate-200/40'} ${isConflict ? 'ring-2 ring-orange-400 ring-offset-4' : ''}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {isPrivate && <Badge icon={<Lock size={10} />} label="Privado" color="bg-slate-800" />}
                        {isConflict && <Badge icon={<AlertTriangle size={10} />} label="Alerta Naranja" color="bg-orange-600" />}
                      </div>
                      <h4 className={`text-2xl font-black leading-tight ${isPrivate ? 'text-slate-400 blur-[3px]' : 'text-slate-800'}`}>
                        {isPrivate ? 'Ocupado' : event.description}
                      </h4>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-50 text-center">
                      <span className="block text-sm font-black text-[#0EA5E9]">{format(new Date(event.event_date), "HH:mm")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0EA5E9] flex items-center justify-center text-white font-black text-xs">
                        {event.profiles?.display_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-slate-300 uppercase">Miembro</p>
                        <p className="text-xs font-black text-slate-700">{event.profiles?.display_name}</p>
                      </div>
                    </div>

                    {isConflict ? (
                      <div className="flex gap-2">
                        <ActionButton icon={<Share2 size={16} />} onClick={() => handleDelegarInterno(event)} label="Delegar" color="hover:text-[#0EA5E9]" />
                        <ActionButton icon={<Heart size={16} />} onClick={() => handleRedApoyo(event)} label="Apoyo" color="hover:text-emerald-500" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-300">
                        <ShieldCheck size={16} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Ok</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* COMPONENTE DRAWER DE NOTIFICACIONES */}
      <NotificationsDrawer 
        isOpen={isNotifOpen} 
        onClose={() => {
          setIsNotifOpen(false);
          fetchEvents(); // Refrescar por si se aceptó algún relevo
        }} 
        nestId={nestId} 
      />
    </div>
  );
};

// ... Helpers Badge y ActionButton se mantienen igual
