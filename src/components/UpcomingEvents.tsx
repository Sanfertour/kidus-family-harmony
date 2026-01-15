import { motion } from "framer-motion";
import EventCard from "./EventCard";
import { EventData } from "@/types/kidus";
import { CalendarDays } from "lucide-react";

interface UpcomingEventsProps {
  events: EventData[];
  onDelegate?: (eventId: string) => void;
  onConflictResolve?: (eventId: string) => void;
}

const UpcomingEvents = ({ events, onDelegate, onConflictResolve }: UpcomingEventsProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const today = new Date().toLocaleDateString("es-ES", {
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
          <EventCard 
            key={event.id} 
            event={event} 
            onDelegate={onDelegate}
            onConflictResolve={onConflictResolve}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default UpcomingEvents;
