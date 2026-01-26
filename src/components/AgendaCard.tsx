import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Lock, ChevronRight, AlertTriangle, ShieldCheck, Clock, User } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";

interface AgendaCardProps {
  event: any;
  isCreator: boolean;
  assignedMember?: any; // El Guía que se encarga
  hasConflict?: boolean;
  onClick: () => void;
}

export const AgendaCard = ({ event, isCreator, assignedMember, hasConflict, onClick }: AgendaCardProps) => {
  const isLocked = event.is_private && !isCreator;
  const memberColor = assignedMember?.color || "#0EA5E9";

  const handleInteraction = () => {
    if (isLocked) {
      triggerHaptic('warning');
      return;
    }
    triggerHaptic('soft');
    onClick();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={handleInteraction}
      className={`relative overflow-hidden p-6 rounded-[2.8rem] border transition-all duration-500 ${
        isLocked 
        ? "bg-slate-50/80 border-slate-200/50 cursor-not-allowed" 
        : "bg-white border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-xl active:scale-[0.98] cursor-pointer"
      }`}
    >
      {hasConflict && !isLocked && (
        <div className="absolute top-0 right-10 bg-rose-500 text-white text-[8px] font-black px-4 py-1.5 rounded-b-xl flex items-center gap-1.5 shadow-lg z-10 animate-pulse">
          <AlertTriangle size={10} /> SOLAPE
        </div>
      )}

      <div className="flex gap-6">
        {/* LÍNEA DE TIEMPO */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-slate-900 tracking-tighter">
            {format(parseISO(event.start_time), "HH:mm")}
          </span>
          <div 
            className="w-1.5 flex-1 rounded-full my-3 transition-all duration-700"
            style={{ backgroundColor: isLocked ? '#CBD5E1' : memberColor }}
          />
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
              isLocked 
              ? "bg-slate-200 text-slate-400 border-transparent" 
              : "bg-white text-slate-500 border-slate-100 shadow-sm"
            }`}>
              {isLocked ? "Privado" : event.category || "Tribu"}
            </span>
            {isLocked ? (
              <Lock size={12} className="text-slate-400" />
            ) : (
              event.is_private && <ShieldCheck size={14} className="text-sky-500" />
            )}
          </div>

          <h4 className={`text-2xl font-black tracking-tighter leading-tight transition-all duration-500 ${
            isLocked ? "text-slate-300 blur-[3px] select-none" : "text-slate-800"
          }`}>
            {isLocked ? "Ocupado" : event.title}
          </h4>

          {!isLocked && (
            <>
              {event.description && (
                <p className="text-slate-400 text-xs font-medium mt-2 line-clamp-2 italic tracking-tight leading-relaxed">
                  {event.description}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-2xl flex items-center justify-center text-[11px] font-black text-white shadow-lg rotate-2"
                    style={{ backgroundColor: memberColor }}
                  >
                    {assignedMember?.display_name?.charAt(0) || <User size={14} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Guía a cargo</span>
                    <span className="text-[10px] font-black text-slate-700 uppercase">
                      {assignedMember?.display_name || "Toda la Tribu"}
                    </span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <ChevronRight size={18} strokeWidth={3} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
