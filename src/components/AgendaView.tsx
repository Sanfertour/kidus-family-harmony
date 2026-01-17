import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, User, Bell, Lock, AlertTriangle, ShieldCheck, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AgendaView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<string[]>([]); // IDs de eventos con colisión

  const fetchEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Traer perfil para saber el nest_id
    const { data: profile } = await supabase.from('profiles').select('nest_id').eq('id', user.id).single();

    // 2. Traer eventos (mapeo real de tu DB)
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

  // --- SILENT COLLISION DETECTION ---
  // Audita si un mismo miembro tiene dos cosas a la vez
  const detectCollisions = (allEvents: any[]) => {
    const conflictIds: string[] = [];
    allEvents.forEach((e1, idx) => {
      allEvents.forEach((e2, idx2) => {
        if (idx !== idx2 && e1.assigned_to === e2.assigned_to) {
          const d1 = new Date(e1.event_date).getTime();
          const d2 = new Date(e2.event_date).getTime();
          // Margen de 1 hora para considerar colisión
          if (Math.abs(d1 - d2) < 3600000) {
            conflictIds.push(e1.id);
          }
        }
      });
    });
    setConflicts(conflictIds);
  };

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      {/* HEADER DE AGENDA */}
      <div className="flex justify-between items-start px-2">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Agenda</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Logística Zen</p>
        </div>
        {/* CAMPANA DE NOTIFICACIONES (ALERTA NARANJA) */}
        <div className="relative">
          <button className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${conflicts.length > 0 ? 'bg-orange-50 text-orange-500 animate-pulse' : 'bg-white text-slate-300'}`}>
            <Bell size={24} strokeWidth={conflicts.length > 0 ? 3 : 2} />
            {conflicts.length > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-orange-600 rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {events.map((event) => {
          const isConflict = conflicts.includes(event.id);
          const isPrivate = event.is_private; // Asumimos esta columna en tu DB
          const isMyEvent = true; // Aquí iría lógica de si el user actual es el dueño

          return (
            <div key={event.id} className="relative group">
              <div className={`
                p-8 rounded-[3.5rem] backdrop-blur-md border transition-all duration-500
                ${isPrivate ? 'bg-slate-900/5 border-slate-200' : 'bg-white/70 border-white/50 shadow-xl shadow-slate-200/40'}
                ${isConflict ? 'ring-2 ring-orange-400 ring-offset-4 ring-offset-[#F8FAFC]' : ''}
              `}>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    {/* INDICADORES DE ESTADO */}
                    <div className="flex gap-2">
                      {isPrivate && (
                        <div className="px-3 py-1 bg-slate-800 rounded-full flex items-center gap-2">
                          <Lock size={10} className="text-white" />
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">Privado</span>
                        </div>
                      )}
                      {isConflict && (
                        <div className="px-3 py-1 bg-orange-600 rounded-full flex items-center gap-2">
                          <AlertTriangle size={10} className="text-white" />
                          <span className="text-[8px] font-black text-white uppercase tracking-widest">Alerta Naranja</span>
                        </div>
                      )}
                    </div>

                    {/* TÍTULO CON PRIVACIDAD INTELIGENTE */}
                    <h4 className={`text-2xl font-black leading-tight ${isPrivate ? 'text-slate-400 blur-[2px] select-none' : 'text-slate-800'}`}>
                      {isPrivate ? 'Ocupado (Evento Privado)' : event.description}
                    </h4>
                  </div>

                  <div className="bg-white px-4 py-3 rounded-[1.5rem] shadow-sm text-center min-w-[70px]">
                    <span className="block text-sm font-black text-[#0EA5E9]">{format(new Date(event.event_date), "HH:mm")}</span>
                    <span className="block text-[8px] font-black text-slate-300 uppercase">{format(new Date(event.event_date), "EEE", { locale: es })}</span>
                  </div>
                </div>

                {/* FILA DE GESTIÓN Y RELEVO */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0EA5E9] flex items-center justify-center text-white font-black text-xs shadow-lg">
                      {event.profiles?.display_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-300 uppercase">Para</p>
                      <p className="text-xs font-black text-slate-700">{event.profiles?.display_name}</p>
                    </div>
                  </div>

                  {/* ACCIÓN DE DELEGAR (EL SALVADOR) */}
                  <button className="flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 hover:text-[#0EA5E9] hover:border-[#0EA5E9] transition-all active:scale-95">
                    <Share2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Delegar</span>
                  </button>
                </div>

                {/* MENSAJE DE COLISIÓN */}
                {isConflict && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-xl text-white">
                      <AlertTriangle size={14} />
                    </div>
                    <p className="text-[10px] font-black text-orange-800 uppercase leading-relaxed tracking-tight">
                      Conflicto: {event.profiles?.display_name} ya tiene un compromiso en esta franja.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
