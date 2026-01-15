import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera, Image, FileText, PenLine, X } from "lucide-react";

interface FABOption {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

const fabOptions: FABOption[] = [
  { id: "camera", icon: Camera, label: "Cámara", color: "hsl(211 100% 50%)" },
  { id: "gallery", icon: Image, label: "Galería", color: "hsl(180 50% 50%)" },
  { id: "pdf", icon: FileText, label: "PDF", color: "hsl(36 100% 50%)" },
  { id: "manual", icon: PenLine, label: "Manual", color: "hsl(270 70% 60%)" },
];

interface FABRadialProps {
  onOptionSelect: (optionId: string) => void;
}

const FABRadial = ({ onOptionSelect }: FABRadialProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleOptionClick = (optionId: string) => {
    onOptionSelect(optionId);
    setIsOpen(false);
  };

  // Calculate positions for 90° arc (bottom-right to top-right)
  const getPosition = (index: number, total: number) => {
    const startAngle = -180; // Start from left
    const endAngle = -90; // End at top
    const angle = startAngle + ((endAngle - startAngle) / (total - 1)) * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 80;
    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    };
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Radial options */}
      <AnimatePresence>
        {isOpen &&
          fabOptions.map((option, index) => {
            const position = getPosition(index, fabOptions.length);
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                className="absolute w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white"
                style={{ backgroundColor: option.color }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  x: position.x,
                  y: position.y,
                  opacity: 1,
                }}
                exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                  delay: index * 0.05,
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOptionClick(option.id)}
              >
                <Icon size={20} />
                <motion.span
                  className="absolute -top-8 whitespace-nowrap text-xs font-medium text-foreground bg-card px-2 py-1 rounded-lg shadow-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  {option.label}
                </motion.span>
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        className="fab-button relative z-10"
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {isOpen ? (
          <X size={26} className="text-white" />
        ) : (
          <Plus size={26} className="text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default FABRadial;
