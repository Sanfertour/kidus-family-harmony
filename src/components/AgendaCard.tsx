import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Lock, ChevronRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";

interface AgendaCardProps {
  event: any;
  isCreator: boolean;
  hasConflict?: boolean;
  onClick: () => void;
}

export const AgendaCard = ({ event, isCreator, hasConflict, onClick }: AgendaCardProps) => {
  // Lógica de Privacidad KidUs
  const isLocked = event.is_private && !isCreator;
  const memberColor = event.profiles?.avatar_url || "#0EA5E9";

  const handleInteraction = () => {
    if (isLocked) {
      triggerHaptic('warning');
      // No ejecutamos onClick si está bloqueado
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
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={handleInteraction}
      className={`relative overflow-hidden p-6 rounded-[2.8rem] border transition-all duration-500 ${
        isLocked 
        ? "bg-slate-50/80 border-slate-200/50 cursor-not-allowed" 
        : "bg-white border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-xl active:scale-[0.98] cursor-pointer"
      }`}
    >
      {/* Alerta de Solape (Solo visible para eventos no bloqueados) */}
      {hasConflict && !isLocked && (
        <div className="absolute top-0 right-10 bg-rose-500 text-white text-[8px] font-black px-4 py-1.5 rounded-b-xl flex items-center gap-1.5 shadow-lg shadow-rose-100 animate-pulse z-10">
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

          <h4 className={`text-2xl font-black tracking-tighter leading-none transition-all duration-500 ${
            isLocked ? "text-slate-300 blur-[2px] select-none" : "text-slate-800"
          }`}>
            {isLocked ? "Ocupado" : event.title}
          </h4>

          {!isLocked ? (
            <>
              {event.description && (
                <p className="text-slate-400 text-xs font-medium mt-2 line-clamp-1 italic tracking-tight">
                  {event.description}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-2xl flex items-center justify-center text-[11px] font-black text-white shadow-lg rotate-2"
                    style={{ backgroundColor: memberColor }}
                  >
                    {event.profiles?.display_name?.charAt(0) || "T"}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {event.profiles?.display_name || "Toda la Tribu"}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <ChevronRight size={18} strokeWidth={3} />
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-300 text-[10px] font-bold mt-2 uppercase tracking-widest">
              Contenido Protegido
            </p>
          )}
        </div>
      </div>

      {/* Glow ambiental sutil */}
      {!isLocked && (
        <div 
          className="absolute -right-12 -bottom-12 w-32 h-32 opacity-[0.04] blur-[40px] rounded-full pointer-events-none"
          style={{ backgroundColor: memberColor }}
        />
      )}
    </motion.div>
  );
};
