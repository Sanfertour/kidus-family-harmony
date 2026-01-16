import { Calendar } from "lucide-react";

const UpcomingEvents = ({ events = [] }: { events?: any[] }) => {
  // Blindaje total: si no hay eventos o es undefined, mostramos el estado vacío
  if (!events || events.length === 0) {
    return (
      <div className="glass-card p-6 rounded-3xl text-center opacity-60">
        <Calendar className="w-10 h-10 mx-auto mb-2 text-kidus-blue/40" />
        <p className="text-sm font-medium">No hay eventos próximos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg px-2">Próximos en el Nido</h3>
      {events.map((event) => (
        <div key={event.id} className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-kidus-blue/10 flex items-center justify-center text-kidus-blue">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold">{event.title}</h4>
            <p className="text-xs text-muted-foreground">{event.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingEvents;
