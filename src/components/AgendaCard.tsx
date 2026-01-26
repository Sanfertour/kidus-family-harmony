import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Lock, ChevronRight, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";

interface AgendaCardProps {
  event: any;
  isCreator: boolean;
  assignedMember?: any;
  hasConflict?: boolean;
  onClick: () => void;
}

export const AgendaCard = ({ event, isCreator, assignedMember, hasConflict, onClick }: AgendaCardProps) => {
  // Verdad Única: El modo privado bloquea si no eres el dueño
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={handleInteraction}
      className={`relative overflow-hidden p-6 rounded-[2.8rem] border transition-all duration-500 ${
        isLocked 
        ? "bg-slate-50/50 border-slate-200/40 cursor-not-allowed opacity-80" 
        : "bg-white border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-xl active:scale-[0.98] cursor-pointer"
      }`}
    >
      {hasConflict && !isLocked && (
        <div className="absolute top-0 right-12 bg-orange-500 text-white text-[8px] font-black px-4 py-1.5 rounded-b-xl flex items-center gap-1.5 shadow-lg z-10">
          <AlertTriangle size={10} /> SOLAPE
        </div>
      )}

      <div className="flex gap-6">
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-sm font-black text-slate-900 tracking-tighter">
            {format(parseISO(event.start_time), "HH:mm")}
          </span>
          <div 
            className="w-1.5 flex-1 rounded-full my-3 opacity-30 transition-all"
            style={{ backgroundColor: isLocked ? '#CBD5E1' : memberColor }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
              isLocked 
              ? "bg-slate-200 text-slate-400 border-transparent" 
              : "bg-slate-50 text-slate-500 border-slate-100"
            }`}>
              {isLocked ? "Privado" : event.category || "Sincronía"}
            </span>
            {isLocked ? (
              <Lock size={12} className="text-slate-400" />
            ) : (
              event.is_private && <ShieldCheck size={14} className="text-sky-500" />
            )}
          </div>

          <h4 className={`text-2xl font-black tracking-tighter leading-tight transition-all duration-700 ${
            isLocked ? "text-slate-300 blur-[4px] select-none" : "text-slate-800"
          }`}>
            {isLocked ? "Ocupado" : event.title}
          </h4>

          {!isLocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {event.description && (
                <p className="text-slate-400 text-xs font-medium mt-2 line-clamp-2 italic leading-relaxed">
                  {event.description}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] font-black text-white shadow-md rotate-3"
                    style={{ backgroundColor: memberColor }}
                  >
                    {assignedMember?.display_name?.charAt(0) || <User size={14} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Guía Responsable</span>
                    <span className="text-[10px] font-black text-slate-700 uppercase">
                      {assignedMember?.display_name || "Toda la Tribu"}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
