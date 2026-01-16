import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera, Image, FileText, PenLine, X } from "lucide-react";

interface FABOption {
  id: string;
  icon: React.ElementType;
  color: string;
}

const fabOptions: FABOption[] = [
  { id: "camera", icon: Camera, color: "hsl(211 100% 50%)" },
  { id: "gallery", icon: Image, color: "hsl(180 50% 50%)" },
  { id: "pdf", icon: FileText, color: "hsl(36 100% 50%)" },
  { id: "manual", icon: PenLine, color: "hsl(270 70% 60%)" },
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

  // Calculate positions for 90° arc
  const getPosition = (index: number, total: number) => {
    const startAngle = -180;
    const endAngle = -90;
    const angle = startAngle + ((endAngle - startAngle) / (total - 1)) * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 90;
    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    };
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm"
            style={{ zIndex: 40 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Radial options - Icons only, no labels */}
      <AnimatePresence>
        {isOpen &&
          fabOptions.map((option, index) => {
            const position = getPosition(index, fabOptions.length);
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                className="absolute w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white"
                style={{ backgroundColor: option.color, zIndex: 45 }}
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
                  stiffness: 500,
                  damping: 25,
                  delay: index * 0.04,
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOptionClick(option.id)}
              >
                <Icon size={20} strokeWidth={2.5} />
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        className="fab-button relative"
        style={{ zIndex: 46 }}
        onClick={toggleOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Plus size={24} className="text-white" />
        )}
      </motion.button>
    </div>
  );
};

export default FABRadial;
