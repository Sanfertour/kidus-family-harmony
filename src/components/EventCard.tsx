import { motion } from "framer-motion";
import { Clock, MapPin, ArrowRightLeft, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventData as BaseEventData, NestMember } from "@/types/kidus";
import MemberAvatar from "./MemberAvatar";

export type EventData = BaseEventData;

interface EventCardProps {
  event: EventData;
  members?: NestMember[];
  onDelegate?: (eventId: string) => void;
  onConflictResolve?: (eventId: string) => void;
}

const typeIcons = {
  school: "📚",
  activity: "⚽",
  medical: "🏥",
  family: "👨‍👩‍👧‍👦",
  work: "💼",
  meal: "🍴",
};

const EventCard = ({ event, members = [], onDelegate, onConflictResolve }: EventCardProps) => {
  const displayTime = event.startTime && event.endTime 
    ? `${event.startTime} - ${event.endTime}` 
    : `${event.startTime || ''} ${event.endTime || ''}`.trim();

  // Find assigned member for mini avatar
  const assignedMember = members.find(m => m.id === event.assignedToId);

  // Check if event is private (show as "Ocupado")
  if (event.isPrivate) {
    return (
      <motion.div
        className="glass-card rounded-2xl p-4 relative overflow-hidden opacity-70"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.7, y: 0 }}
        layout
      >
        <div className="flex items-center gap-3">
          <Lock size={18} className="text-muted-foreground" />
          <div>
            <h3 className="font-medium text-muted-foreground">Ocupado (Evento Privado)</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock size={12} />
              <span>{event.date} • {displayTime}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`event-card ${event.hasConflict ? "conflict-glow" : ""}`}
      style={{ "--child-color": event.memberColor } as React.CSSProperties}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
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
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xl">{typeIcons[event.type]}</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight">{event.title}</h3>
            {/* Interesado badge with their color */}
            <div
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: event.memberColor }}
            >
              {event.memberName}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{event.date} • {displayTime}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={12} />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {/* Actions with mini avatar of responsible */}
      <div className="flex items-center justify-between pt-2 border-t border-border/30">
        <div className="flex items-center gap-2">
          {assignedMember ? (
            <>
              <MemberAvatar member={assignedMember} size="xs" />
              <span className="text-xs text-muted-foreground">
                {event.assignedToId === "family" ? "Todo el Nido" : assignedMember.name.split(" ")[0]}
              </span>
            </>
          ) : (
            <span className="text-xs text-accent font-medium">Sin asignar</span>
          )}
        </div>
        {onDelegate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelegate(event.id)}
            className="ml-auto text-primary hover:bg-primary/10 h-7 px-2 text-xs"
          >
            <ArrowRightLeft size={14} className="mr-1" />
            Delegar
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
