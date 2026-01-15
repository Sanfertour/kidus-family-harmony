import { motion } from "framer-motion";
import { Clock, MapPin, User, ArrowRightLeft, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventData as BaseEventData } from "@/types/kidus";

// Re-export the type for backwards compatibility
export type EventData = BaseEventData;

interface EventCardProps {
  event: EventData;
  onDelegate?: (eventId: string) => void;
  onConflictResolve?: (eventId: string) => void;
}

const typeIcons = {
  school: "📚",
  activity: "⚽",
  medical: "🏥",
  family: "👨‍👩‍👧‍👦",
  work: "💼",
};

const EventCard = ({ event, onDelegate, onConflictResolve }: EventCardProps) => {
  const displayTime = event.startTime && event.endTime 
    ? `${event.startTime} - ${event.endTime}` 
    : `${event.startTime || ''} ${event.endTime || ''}`.trim();

  return (
    <motion.div
      className={`event-card ${event.hasConflict ? "conflict-glow" : ""}`}
      style={{ "--child-color": event.memberColor } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0 12px 40px hsl(211 100% 50% / 0.15)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      layout
    >
      {/* Conflict indicator */}
      {event.hasConflict && (
        <motion.button
          className="absolute top-3 right-3 flex items-center gap-1 text-accent text-xs font-medium bg-accent/10 px-2 py-1 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          onClick={() => onConflictResolve?.(event.id)}
        >
          <AlertTriangle size={14} />
          <span>Conflicto</span>
        </motion.button>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeIcons[event.type]}</span>
          <div>
            <h3 className="font-semibold text-foreground">{event.title}</h3>
            <div
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: event.memberColor }}
            >
              <User size={10} />
              {event.memberName}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>{event.date} • {displayTime}</span>
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
        {event.assignedToName && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            {event.assignedToId === "family" ? (
              <Users size={12} className="text-primary" />
            ) : (
              <User size={12} />
            )}
            <span>
              {event.assignedToId === "family" ? "Toda la familia" : `Asignado: ${event.assignedToName}`}
            </span>
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
