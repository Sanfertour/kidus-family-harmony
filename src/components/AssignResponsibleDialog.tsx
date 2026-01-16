import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Check, Users } from "lucide-react";
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

  const adults = members.filter((m) => m.role === "adult");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            className="relative w-full max-w-sm glass-card rounded-3xl p-6 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              {isConflict ? (
                <>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-3">
                    <AlertTriangle className="text-accent" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    ¡Conflicto de Horarios!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Quieres delegar este evento a otro miembro del Nido?
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-3">
                    <Users className="text-primary" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    Asignar Responsable
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Selecciona quién será el responsable de este evento
                  </p>
                </>
              )}
            </div>

            {/* Event preview */}
            {eventData?.title && (
              <div className="bg-muted/50 rounded-xl p-3 mb-4">
                <p className="text-sm font-medium text-foreground">
                  {eventData.title}
                </p>
                {eventData.startTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {eventData.date} • {eventData.startTime} - {eventData.endTime}
                  </p>
                )}
              </div>
            )}

            {/* Member selection */}
            <div className="flex justify-center gap-4 mb-6">
              {adults.map((member) => (
                <motion.div
                  key={member.id}
                  className="flex flex-col items-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`relative ${
                      selectedMemberId === member.id
                        ? "ring-2 ring-primary ring-offset-2 rounded-full"
                        : ""
                    }`}
                  >
                    <MemberAvatar
                      member={member}
                      size="lg"
                      onClick={() => setSelectedMemberId(member.id)}
                    />
                    {selectedMemberId === member.id && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Check size={12} />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {member.name.split(" ")[0]}
                  </span>
                </motion.div>
              ))}
              
              {/* "Toda la Familia" option */}
              <motion.div
                className="flex flex-col items-center gap-2"
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer ${
                    selectedMemberId === "family"
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                  onClick={() => setSelectedMemberId("family")}
                >
                  <Users size={24} className="text-white" />
                  {selectedMemberId === "family" && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Check size={12} />
                    </motion.div>
                  )}
                </div>
                <span className="text-xs font-medium text-foreground">
                  Todo el Nido
                </span>
              </motion.div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={!selectedMemberId}
              >
                {isConflict ? "Delegar" : "Asignar"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignResponsibleDialog;
