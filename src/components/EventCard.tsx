import { motion } from "framer-motion";
import { Clock, MapPin, ArrowRightLeft, AlertTriangle, Lock } from "lucide-react";
import { MemberAvatar } from "./MemberAvatar";

// Feedback háptico de la Tribu
const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

const typeIcons = {
  school: "📚",
  activity: "⚽",
  medical: "🏥",
  family: "👨‍👩",
  work: "💼",
  meal: "🍴",
};

export const EventCard = ({ event, members = [], onDelegate, onConflictResolve }: any) => {
  // Sincronización con los campos de la base de datos (assigned_to)
  const assignedMember = members.find((m: any) => m.id === event.assigned_to);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-[2.5rem] mb-4 border backdrop-blur-2xl transition-all duration-500 ${
        event.hasConflict 
          ? "bg-orange-50/50 border-orange-200 shadow-lg shadow-orange-100" 
          : "bg-white/60 border-white/80 shadow-sm"
      }`}
    >
      {/* Indicador de Conflicto - Vital Orange (#F97316) */}
      {event.hasConflict && (
        <button 
          onClick={() => { triggerHaptic('soft'); onConflictResolve?.(event.id); }}
          className="absolute -top-2 -right-2 bg-[#F97316] text-white p-2.5 rounded-full shadow-lg animate-bounce z-10"
        >
          <AlertTriangle size={18} />
        </button>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="text-3xl filter drop-shadow-sm select-none">
            {typeIcons[event.type as keyof typeof typeIcons] || '📅'}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 leading-tight uppercase tracking-tight">
              {event.isPrivate ? "Ocupado" : (event.description || event.title)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.memberColor || '#0EA5E9' }} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Tribu: {event.memberName || "General"}
              </span>
            </div>
          </div>
        </div>
        {event.isPrivate && <Lock size={16} className="text-slate-300" />}
      </div>

      {/* Horario y Ubicación con Brisa Visual */}
      <div className="space-y-2 mb-6 ml-1">
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-wider">
          <Clock size={14} className="text-[#0EA5E9]" />
          <span>{event.startTime || event.event_date?.split('T')[1]?.substring(0, 5)} {event.endTime ? `- ${event.endTime}` : ''}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <MapPin size={14} />
            <span className="truncate max-w-[200px]">{event.location}</span>
          </div>
        )}
      </div>

      {/* Footer de la Card: Relevo y Guía */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
        <div className="flex items-center gap-2">
          {assignedMember && <MemberAvatar member={assignedMember} size="xs" />}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter leading-none">Responsable</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
              {assignedMember ? `Guía: ${assignedMember.display_name.split(' ')[0]}` : "Sin Guía"}
            </span>
          </div>
        </div>

        {onDelegate && (
          <button
            onClick={() => { triggerHaptic('soft'); onDelegate?.(event.id); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-[#0EA5E9]/10 text-slate-400 hover:text-[#0EA5E9] rounded-2xl border border-slate-100 transition-all active:scale-95 group shadow-sm"
          >
            <ArrowRightLeft size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Relevo</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
