import { motion } from "framer-motion";
import { Clock, MapPin, User, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  childName: string;
  childColor: string;
  type: "school" | "activity" | "medical" | "family";
  hasConflict?: boolean;
  assignedTo?: string;
}

interface EventCardProps {
  event: EventData;
  onDelegate?: (eventId: string) => void;
}

const typeIcons = {
  school: "📚",
  activity: "⚽",
  medical: "🏥",
  family: "👨‍👩‍👧‍👦",
};

const EventCard = ({ event, onDelegate }: EventCardProps) => {
  return (
    <motion.div
      className={`event-card ${event.hasConflict ? "conflict-glow" : ""}`}
      style={{ "--child-color": event.childColor } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0 12px 40px hsl(211 100% 50% / 0.15)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      layout
    >
      {/* Conflict indicator */}
      {event.hasConflict && (
        <motion.div
          className="absolute top-3 right-3 flex items-center gap-1 text-accent text-xs font-medium"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <AlertTriangle size={14} />
          <span>Conflicto</span>
        </motion.div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeIcons[event.type]}</span>
          <div>
            <h3 className="font-semibold text-foreground">{event.title}</h3>
            <div
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: event.childColor }}
            >
              <User size={10} />
              {event.childName}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>{event.date} • {event.time}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        {event.assignedTo && (
          <span className="text-xs text-muted-foreground">
            Asignado a: <span className="font-medium text-foreground">{event.assignedTo}</span>
          </span>
        )}
        {onDelegate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelegate(event.id)}
            className="ml-auto text-primary hover:bg-primary/10"
          >
            <ArrowRightLeft size={16} className="mr-1" />
            Delegar
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
