import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Check, Users, ShieldCheck } from "lucide-react";
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
      onConfirm(selectedMemberId);
      setSelectedMemberId(null);
      onClose();
    }
  };

  // Solo los adultos pueden ser "Responsables" de la logística
  const adults = members.filter((m) => m.role === "adult");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop con desenfoque premium */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Dialog / Drawer (Zero Scroll Policy) */}
          <motion.div
            className="relative w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl border border-white/20"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Indicador de arrastre para estética Mobile-First */}
            <div className="w-12 h-1.5 bg-muted/30 rounded-full mx-auto mb-6 sm:hidden" />

            {/* Header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${isConflict ? 'bg-orange-100' : 'bg-blue-100'}`}>
                {isConflict ? (
                  <AlertTriangle className="text-orange-500" size={28} />
                ) : (
                  <ShieldCheck className="text-blue-500" size={28} />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isConflict ? "Alerta Naranja" : "Gestión de Logística"}
              </h3>
              <p className="text-sm text-slate-500 px-6">
                {isConflict 
                  ? "Hay un solapamiento. ¿Quién se encargará de gestionar este cambio?" 
                  : "Todo evento requiere un responsable adulto asignado."}
              </p>
            </div>

            {/* Event Preview con Glassmorphism */}
            {eventData?.title && (
              <div className="bg-white/40 border border-white/60 rounded-2xl p-4 mb-8 shadow-sm">
                <p className="text-sm font-bold text-slate-800">{eventData.title}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">
                  {eventData.startTime} - {eventData.endTime}
                </p>
              </div>
            )}

            {/* Selector de Avatares (Obligatorio) */}
            <div className="flex justify-center items-end gap-6 mb-10">
              {adults.map((member) => (
                <div key={member.id} className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <MemberAvatar
                      member={member}
                      size="lg"
                      isSelected={selectedMemberId === member.id}
                      onClick={() => setSelectedMemberId(member.id)}
                    />
                    {selectedMemberId === member.id && (
                      <motion.div 
                        layoutId="check"
                        className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <Check size={14} strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedMemberId === member.id ? 'text-primary' : 'text-slate-400'}`}>
                    {member.name.split(" ")[0]}
                  </span>
                </div>
              ))}
              
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setSelectedMemberId("family")}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    selectedMemberId === "family"
                      ? "bg-slate-900 text-white scale-110 shadow-xl"
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <Users size={24} />
                </button>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedMemberId === "family" ? 'text-slate-900' : 'text-slate-400'}`}>
                  El Nido
                </span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="flex-1 text-slate-400 hover:text-slate-600 font-bold"
                onClick={onClose}
              >
                DESCARTAR
              </Button>
              <Button
                className={`flex-1 rounded-2xl h-12 font-bold transition-all ${
                  selectedMemberId 
                    ? "bg-primary shadow-lg shadow-primary/30" 
                    : "bg-slate-200 text-slate-400"
                }`}
                onClick={handleConfirm}
                disabled={!selectedMemberId}
              >
                {isConflict ? "DELEGAR" : "CONFIRMAR"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignResponsibleDialog;
