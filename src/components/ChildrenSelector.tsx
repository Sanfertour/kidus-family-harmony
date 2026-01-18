import { motion } from "framer-motion";
import { Plus, ChevronRight } from "lucide-react";
import { MemberAvatar } from "./MemberAvatar";

// Feedback háptico profesional para el Nido
const triggerHaptic = (type: 'soft' | 'success' = 'soft') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

interface ChildrenSelectorProps {
  children: any[];
  selectedChildId?: string;
  onChildSelect: (childId: string) => void;
  onAddChild?: () => void;
}

export const ChildrenSelector = ({
  children,
  selectedChildId,
  onChildSelect,
  onAddChild,
}: ChildrenSelectorProps) => {
  return (
    <motion.section 
      className="py-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Encabezado con lenguaje de Tribu */}
      <div className="px-8 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">
            Tu <span className="text-[#0EA5E9]">Tribu</span>
          </h2>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mt-2">
            Gestión de los peques
          </p>
        </div>
        <button 
          onClick={() => triggerHaptic('soft')}
          className="flex items-center gap-1 text-[10px] font-black text-[#0EA5E9] uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          Ver todos <ChevronRight size={14} />
        </button>
      </div>

      {/* Contenedor horizontal con 'Brisa' visual */}
      <div className="flex gap-6 overflow-x-auto px-8 pb-4 no-scrollbar items-start">
        
        {/* Opción Global: La Tribu Completa */}
        <motion.div 
          className="flex flex-col items-center gap-3"
          whileTap={{ scale: 0.9 }}
        >
          <button
            onClick={() => { 
              triggerHaptic('soft'); 
              onChildSelect("all"); 
            }}
            className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-2xl shadow-lg transition-all duration-500 ${
              !selectedChildId || selectedChildId === "all" 
                ? "bg-[#0EA5E9] text-white scale-110 rotate-3 shadow-[#0EA5E9]/20" 
                : "bg-white text-slate-300 border border-slate-100"
            }`}
          >
            🏠
          </button>
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            !selectedChildId || selectedChildId === "all" ? "text-[#0EA5E9]" : "text-slate-400"
          }`}>
            Todos
          </span>
        </motion.div>

        {/* Mapeo de Peques usando MemberAvatar sincronizado */}
        {children.map((child) => (
          <div key={child.id} className="flex flex-col items-center gap-3">
            <MemberAvatar 
              member={child} 
              size="lg" 
              isSelected={selectedChildId === child.id}
              onClick={() => {
                triggerHaptic('soft');
                onChildSelect(child.id);
              }}
              showName={true}
            />
          </div>
        ))}

        {/* Botón Añadir Miembro - Estilo Nido */}
        {onAddChild && (
          <motion.div 
            className="flex flex-col items-center gap-3"
            whileTap={{ scale: 0.9 }}
          >
            <button
              onClick={() => { 
                triggerHaptic('success'); 
                onAddChild(); 
              }}
              className="w-16 h-16 rounded-[1.8rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-[#F97316] hover:text-[#F97316] transition-all bg-white/50"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              Añadir
            </span>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default ChildrenSelector;
