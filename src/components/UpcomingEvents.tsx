import { motion } from "framer-motion";
import EventCard from "./EventCard";
import { EventData, NestMember } from "@/types/kidus";
import { CalendarDays } from "lucide-react";

interface UpcomingEventsProps {
  events: EventData[];
  members?: NestMember[];
  onDelegate?: (eventId: string) => void;
  onConflictResolve?: (eventId: string) => void;
}

const UpcomingEvents = ({ events, members = [], onDelegate, onConflictResolve }: UpcomingEventsProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Próximos eventos</h2>
      </div>

      <div className="mb-2">
        <span className="text-xs font-medium text-muted-foreground capitalize">
          {today}
        </span>
      </div>

      <motion.div
        className="space-y-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            members={members}
            onDelegate={onDelegate}
            onConflictResolve={onConflictResolve}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default UpcomingEvents;
