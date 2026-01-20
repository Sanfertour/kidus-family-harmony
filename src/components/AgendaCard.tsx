import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { Clock, Lock, ChevronRight, AlertTriangle } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";

interface AgendaCardProps {
  event: any;
  isCreator: boolean;
  hasConflict?: boolean;
  onClick: () => void;
}

export const AgendaCard = ({ event, isCreator, hasConflict, onClick }: AgendaCardProps) => {
  // Lógica de Privacidad: Si es privado y no soy el creador, bloqueamos contenido.
  const isLocked = event.is_private && !isCreator;
  
  // El color viene del avatar_url (que en nuestra Tribu guarda el HEX)
  const memberColor = event.profiles?.avatar_url || "#0EA5E9";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => {
        triggerHaptic('soft');
        onClick();
      }}
      className={`relative group overflow-hidden p-6 rounded-[2.5rem] border transition-all duration-500 active:scale-[0.98] ${
        isLocked 
        ? "bg-slate-100/40 border-slate-200/50" 
        : "bg-white border-white shadow-brisa hover:shadow-xl"
      }`}
    >
      {/* Indicador de Conflicto (Solape de agenda) */}
      {hasConflict && !isLocked && (
        <div className="absolute top-0 right-12 bg-rose-500 text-white text-[8px] font-black px-4 py-1.5 rounded-b-xl flex items-center gap-1.5 animate-bounce">
          <AlertTriangle size={10} /> SOLAPE
        </div>
      )}

      <div className="flex gap-5">
        {/* COLUMNA TIEMPO & COLOR */}
        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-slate-900 tracking-tight">
            {format(parseISO(event.start_time), "HH:mm")}
          </span>
          <div 
            className="w-1.5 flex-1 rounded-full my-3 transition-colors duration-700"
            style={{ backgroundColor: isLocked ? '#CBD5E1' : memberColor }}
          />
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <span 
              className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${
                isLocked 
                ? "bg-slate-200 text-slate-400 border-transparent" 
                : "bg-white text-slate-500 border-slate-100 shadow-sm"
              }`}
            >
              {isLocked ? "Privado" : event.category || "Tribu"}
            </span>
            {isLocked && <Lock size={12} className="text-slate-300" />}
          </div>

          <h4 className={`text-2xl font-black tracking-tighter leading-tight transition-all duration-500 ${
            isLocked ? "text-slate-300 blur-sm select-none" : "text-slate-800"
          }`}>
            {isLocked ? "Ocupado" : event.title}
          </h4>

          {!isLocked && event.description && (
            <p className="text-slate-400 text-xs font-medium mt-2 line-clamp-1 italic">
              {event.description}
            </p>
          )}

          {/* AVATAR Y ASIGNADO */}
          {!isLocked && (
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform"
                  style={{ backgroundColor: memberColor }}
                >
                  {event.profiles?.display_name?.charAt(0) || "T"}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {event.profiles?.display_name || "Toda la Tribu"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EFECTO GLOW PARA EL COLOR DEL MIEMBRO */}
      {!isLocked && (
        <div 
          className="absolute -right-10 -bottom-10 w-32 h-32 opacity-[0.03] blur-3xl rounded-full pointer-events-none"
          style={{ backgroundColor: memberColor }}
        />
      )}
    </motion.div>
  );
};
