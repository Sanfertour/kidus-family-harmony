import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Lock, ChevronRight, AlertTriangle, ShieldCheck, User, UserPlus } from "lucide-react";
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleInteraction}
      className={`relative overflow-hidden p-5 rounded-[2.5rem] border transition-all duration-500 ${
        isLocked 
        ? "bg-slate-50/50 border-slate-200/40 cursor-not-allowed opacity-80" 
        : "bg-white border-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.02)] hover:shadow-xl active:scale-[0.98] cursor-pointer"
      }`}
    >
      {hasConflict && !isLocked && (
        <div className="absolute top-0 right-8 bg-orange-500 text-white text-[7px] font-black px-3 py-1 rounded-b-lg flex items-center gap-1 shadow-lg z-10 animate-pulse">
          <AlertTriangle size={8} /> SOLAPE
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${
              isLocked 
              ? "bg-slate-200 text-slate-400 border-transparent" 
              : "bg-slate-50 text-slate-500 border-slate-100"
            }`}>
              {isLocked ? "Privado" : event.category || "Sincronía"}
            </span>
            {isLocked ? (
              <Lock size={10} className="text-slate-400" />
            ) : (
              event.is_private && <ShieldCheck size={12} className="text-sky-500" />
            )}
          </div>

          <h4 className={`text-xl font-black tracking-tighter leading-tight transition-all duration-700 ${
            isLocked ? "text-slate-300 blur-[4px] select-none" : "text-slate-800"
          }`}>
            {isLocked ? "Ocupado" : event.title}
          </h4>

          {!isLocked && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar con Acción de Delegación */}
                <div className="relative group">
                  <div 
                    className="w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black text-white shadow-md rotate-3 transition-transform group-hover:rotate-0"
                    style={{ backgroundColor: memberColor }}
                  >
                    {assignedMember?.display_name?.charAt(0) || <User size={14} />}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('medium');
                      // Lógica de apertura de delegación aquí
                    }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white scale-90 active:scale-125 transition-all"
                  >
                    <UserPlus size={10} />
                  </button>
                </div>

                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Responsable</span>
                  <span className="text-[10px] font-black text-slate-700 uppercase italic leading-none">
                    {assignedMember?.display_name || "La Tribu"}
                  </span>
                </div>
              </div>
              
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
