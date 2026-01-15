import { motion } from "framer-motion";
import EventCard, { EventData } from "./EventCard";
import { CalendarDays } from "lucide-react";

interface UpcomingEventsProps {
  events: EventData[];
  onDelegate?: (eventId: string) => void;
}

const UpcomingEvents = ({ events, onDelegate }: UpcomingEventsProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Group events by date
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h2 className="text-base font-semibold text-foreground">Próximos eventos</h2>
      </div>

      {/* Date header */}
      <div className="mb-3">
        <span className="text-sm font-medium text-muted-foreground capitalize">
          Hoy, {today}
        </span>
      </div>

      <motion.div
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} onDelegate={onDelegate} />
        ))}
      </motion.div>
    </section>
  );
};

export default UpcomingEvents;
