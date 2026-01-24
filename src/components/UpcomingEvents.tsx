import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const UpcomingEvents = ({ events = [] }: { events?: any[] }) => {
  // 1. Blindaje total con estética "Brisa": Estado vacío
  if (!events || events.length === 0) {
    return (
      <div className="glass-card p-10 rounded-[3.5rem] text-center bg-white/40 border-dashed border-2 border-slate-200">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-sky-400/50" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Nido en calma
        </p>
        <p className="text-[10px] text-slate-300 uppercase tracking-tighter mt-1">
          No hay eventos próximos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Título con Nunito Black e impacto KidUs */}
      <h3 className="font-black text-xl px-2 text-slate-800 tracking-tight">
        Próximos en el Nido
      </h3>

      <div className="space-y-3">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="glass-card p-5 rounded-[2.5rem] flex items-center gap-5 border border-white/60 bg-white/50 shadow-sm active:scale-[0.98] transition-all duration-400"
          >
            {/* Contenedor del Icono - Vital Orange o Sky Blue para variar */}
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shadow-inner">
              <Calendar className="w-7 h-7" strokeWidth={2} />
            </div>

            <div className="flex-1">
              {/* Sincronización: Usamos description como título del evento */}
              <h4 className="font-black text-slate-800 leading-tight">
                {event.description || "Evento sin título"}
              </h4>
              
              {/* Formateo de fecha profesional */}
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {event.start_time 
                  ? format(new Date(event.start_time), "HH:mm '·' d MMM", { locale: es }) 
                  : 'Sincronizando...'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
