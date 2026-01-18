import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Users, ShieldCheck } from "lucide-react";
import { NestMember, EventData } from "@/types/kidus";
import MemberAvatar from "./MemberAvatar";
import { Button } from "./ui/button";

interface AssignResponsibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId: string) => void;
  members: NestMember[];
  eventData?: Partial<EventData>;
  isConflict?: boolean;
}

// Feedback háptico para la Tribu
const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

const AssignResponsibleDialog = ({
  isOpen,
  onClose,
  onConfirm,
  members,
  eventData,
  isConflict = false,
}: AssignResponsibleDialogProps) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedMemberId) {
      triggerHaptic('success'); // Vibración de éxito al asignar
      onConfirm(selectedMemberId);
      setSelectedMemberId(null);
      onClose();
    }
  };

  // Solo los adultos actúan como "Guías" del Nido
  const guides = members.filter((m) => m.role === "adult");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop Glassmorphism */}
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Card con Brisa Style (rounded-3.5rem) */}
          <motion.div
            className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[3.5rem] sm:rounded-[3.5rem] p-10 shadow-2xl border border-white/40 overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          >
            {/* Drag Handle para Mobile */}
            <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 sm:hidden" />

            {/* Header: Lenguaje de Nido */}
            <div className="text-center mb-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-[2.2rem] mb-6 shadow-xl rotate-2 transition-transform hover:rotate-0 ${
                isConflict ? 'bg-[#F97316]' : 'bg-[#0EA5E9]'
              }`}>
                {isConflict ? (
                  <AlertTriangle className="text-white" size={32} />
                ) : (
                  <ShieldCheck className="text-white" size={32} />
                )}
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter font-nunito">
                {isConflict ? "Alerta Naranja" : "Designar Guía"}
              </h3>
              <p className="text-[11px] font-bold text-slate-400 px-6 uppercase tracking-widest leading-relaxed">
                {isConflict 
                  ? "Sincronización interrumpida. Relevo de guía necesario para mantener la calma." 
                  : "Todo movimiento en el nido requiere un guía responsable asignado."}
              </p>
            </div>

            {/* Preview de la Misión */}
            {eventData?.title && (
              <div className="bg-slate-50/50 border border-white rounded-[2rem] p-6 mb-10 shadow-sm">
                <span className="text-[9px] font-black text-[#0EA5E9] uppercase tracking-[0.2em] mb-1 block">Misión Actual</span>
                <p className="text-base font-black text-slate-800 uppercase leading-tight">{eventData.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider italic">
                  {eventData.startTime} - {eventData.endTime}
                </p>
              </div>
            )}

            {/* Selector de Guías (Tribu) */}
            <div className="flex justify-center items-center gap-8 mb-12">
              {guides.map((member) => (
                <div key={member.id} className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <MemberAvatar
                      member={member}
                      size="xl"
                      isSelected={selectedMemberId === member.id}
                      onClick={() => {
                        triggerHaptic('soft');
                        setSelectedMemberId(member.id);
                      }}
                    />
                    {selectedMemberId === member.id && (
                      <motion.div 
                        layoutId="check"
                        className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white"
                      >
                        <Check size={14} strokeWidth={4} />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${selectedMemberId === member.id ? 'text-[#0EA5E9]' : 'text-slate-400'}`}>
                    {member.display_name.split(" ")[0]}
                  </span>
                </div>
              ))}
              
              {/* Opción de Nido Completo */}
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => {
                    triggerHaptic('soft');
                    setSelectedMemberId("family");
                  }}
                  className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center transition-all duration-400 shadow-lg ${
                    selectedMemberId === "family"
                      ? "bg-slate-800 text-white scale-110 rotate-3 shadow-slate-300"
                      : "bg-white text-slate-300 border border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <Users size={32} />
                </button>
                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${selectedMemberId === "family" ? 'text-slate-800' : 'text-slate-300'}`}>
                  Toda la Tribu
                </span>
              </div>
            </div>

            {/* Acciones Finales */}
            <div className="flex flex-col gap-4">
              <Button
                className={`w-full h-16 rounded-[1.8rem] text-sm font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 ${
                  selectedMemberId 
                    ? "bg-[#0EA5E9] text-white shadow-xl shadow-sky-100" 
                    : "bg-slate-100 text-slate-300 pointer-events-none"
                }`}
                onClick={handleConfirm}
              >
                {isConflict ? "EJECUTAR RELEVO" : "CONFIRMAR GUÍA"}
              </Button>
              
              <button
                className="w-full py-2 text-[10px] font-black text-slate-300 hover:text-slate-500 transition-colors uppercase tracking-[0.3em]"
                onClick={onClose}
              >
                VOLVER AL NIDO
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignResponsibleDialog;
