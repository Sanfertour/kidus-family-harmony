import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Check, Users, ShieldCheck } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { Button } from "./ui/button";
import { format } from "date-fns";

interface AssignResponsibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId: string) => void;
  members: any[];
  eventData?: any;
  isConflict?: boolean;
}

const AssignResponsibleDialog = ({
  isOpen, onClose, onConfirm, members, eventData, isConflict = false,
}: AssignResponsibleDialogProps) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedMemberId) {
      triggerHaptic('success');
      onConfirm(selectedMemberId);
      setSelectedMemberId(null);
      onClose();
    }
  };

  const guides = members.filter((m) => m.role === "autonomous");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <motion.div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={onClose} />
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="relative w-full max-w-md bg-white rounded-t-[3.5rem] p-10 shadow-2xl border border-white/40"
          >
            <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
            
            <div className="text-center mb-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-[2.2rem] mb-6 shadow-xl ${isConflict ? 'bg-orange-500' : 'bg-sky-500'}`}>
                {isConflict ? <AlertTriangle className="text-white" size={32} /> : <ShieldCheck className="text-white" size={32} />}
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tighter italic">
                {isConflict ? "Alerta de Solape" : "Designar Guía"}
              </h3>
            </div>

            {eventData?.title && (
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 mb-8 text-center">
                <p className="text-base font-black text-slate-800 uppercase italic">{eventData.title}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                  {eventData.start_time ? format(new Date(eventData.start_time), "HH:mm 'h'") : '--:--'}
                </p>
              </div>
            )}

            <div className="flex justify-center items-center gap-6 mb-10">
              {guides.map((member) => (
                <button 
                  key={member.id} 
                  onClick={() => { triggerHaptic('soft'); setSelectedMemberId(member.id); }}
                  className={`flex flex-col items-center gap-2 group transition-all ${selectedMemberId === member.id ? 'scale-110' : 'opacity-50'}`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${selectedMemberId === member.id ? 'ring-4 ring-sky-100' : ''}`} style={{ backgroundColor: member.avatar_url || '#cbd5e1' }}>
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">{member.display_name}</span>
                </button>
              ))}
            </div>

            <Button
              className={`w-full h-16 rounded-[1.8rem] font-black uppercase tracking-[0.2em] transition-all ${selectedMemberId ? "bg-slate-900 text-white shadow-xl" : "bg-slate-100 text-slate-300 pointer-events-none"}`}
              onClick={handleConfirm}
            >
              ASIGNAR RESPONSABLE
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignResponsibleDialog;
