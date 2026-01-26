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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={handleInteraction}
      className={`relative overflow-hidden p-6 rounded-[3rem] border transition-all duration-500 ${
        isLocked 
        ? "bg-slate-50/60 border-slate-200/50 cursor-not-allowed" 
        : "bg-white border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-2xl active:scale-[0.97] cursor-pointer"
      }`}
    >
      {hasConflict && !isLocked && (
        <div className="absolute top-0 right-10 bg-rose-500 text-white text-[8px] font-black px-4 py-1.5 rounded-b-xl flex items-center gap-1.5 shadow-lg z-10 animate-pulse uppercase tracking-tighter">
          <AlertTriangle size={10} /> Solape detectado
        </div>
      )}

      <div className="flex gap-6">
        <div className="flex flex-col items-center min-w-[55px]">
          <span className="text-sm font-black text-slate-900 tracking-tighter">
            {format(parseISO(event.start_time), "HH:mm")}
          </span>
          <div 
            className="w-1.5 flex-1 rounded-full my-3 transition-all duration-700 opacity-20"
            style={{ backgroundColor: isLocked ? '#CBD5E1' : memberColor }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl border ${
              isLocked 
              ? "bg-slate-200 text-slate-400 border-transparent" 
              : "bg-slate-50 text-slate-500 border-slate-100 shadow-sm"
            }`}>
              {isLocked ? "Evento Privado" : event.category || "Tribu"}
            </span>
            {isLocked ? (
              <Lock size={12} className="text-slate-400" />
            ) : (
              event.is_private && <ShieldCheck size={14} className="text-sky-500" />
            )}
          </div>

          <h4 className={`text-2xl font-black tracking-tighter leading-tight transition-all duration-500 ${
            isLocked ? "text-slate-300 blur-[4.5px] select-none" : "text-slate-800"
          }`}>
            {isLocked ? "Espacio Ocupado" : event.title}
          </h4>

          {!isLocked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {event.description && (
                <p className="text-slate-400 text-xs font-medium mt-2 line-clamp-2 italic leading-relaxed tracking-tight">
                  {event.description}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] font-black text-white shadow-lg rotate-3 transition-transform hover:rotate-0"
                    style={{ backgroundColor: memberColor }}
                  >
                    {assignedMember?.display_name?.charAt(0) || <User size={14} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">Guía a cargo</span>
                    <span className="text-[10px] font-black text-slate-700 uppercase">
                      {assignedMember?.display_name || "Sincronía Nido"}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100/50">
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
