import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Clock, User, ShieldCheck, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AgendaView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        profiles!events_member_id_fkey (display_name, avatar_url),
        responsible:profiles!events_responsible_id_fkey (display_name)
      `)
      .order('start_time', { ascending: true });

    if (!error) setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizando nido...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="px-2 mb-8">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Agenda Compartida</h2>
        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2">Logística y coordinación</p>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto text-gray-300">
            <CalendarIcon size={32} />
          </div>
          <p className="text-gray-500 font-bold">No hay eventos próximos.<br/>¡Disfruta de la calma!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="relative group">
              {/* Indicador lateral del color del miembro (Sujeto) */}
              <div 
                className="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full shadow-sm z-10" 
                style={{ backgroundColor: event.profiles?.avatar_url || '#3B82F6' }}
              />
              
              <div className="glass-card p-6 pl-8 bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white/90 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-800 leading-tight">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                      <Clock size={14} className="text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {format(new Date(event.start_time), "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                      {format(new Date(event.start_time), "HH:mm")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                      <User size={12} className="text-gray-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[8px] font-black text-gray-400 uppercase">Para</p>
                      <p className="text-[11px] font-bold text-gray-700 truncate">{event.profiles?.display_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                      <ShieldCheck size={12} className="text-orange-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[8px] font-black text-gray-400 uppercase">Responsable</p>
                      <p className="text-[11px] font-bold text-gray-700 truncate">{event.responsible?.display_name || 'Sin asignar'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
