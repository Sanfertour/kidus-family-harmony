import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

export const AgendaView = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('start_time', { ascending: true });
      if (data) setEvents(data);
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-nunito">Agenda del Nido</h2>
      {events.length === 0 ? (
        <div className="glass-card p-8 text-center opacity-60">
          <Clock className="w-12 h-12 mx-auto mb-2 text-kidus-blue" />
          <p>No hay eventos programados para hoy.</p>
        </div>
      ) : (
        events.map((event: any) => (
          <div key={event.id} className={`glass-card p-4 rounded-2xl border-l-4 ${event.conflict ? 'border-l-kidus-orange conflict-glow' : 'border-l-kidus-teal'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
              {event.conflict && <AlertTriangle className="text-kidus-orange w-6 h-6" />}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
