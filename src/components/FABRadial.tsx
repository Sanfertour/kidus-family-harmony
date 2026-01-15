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

  // Calculate positions for 90° arc - increased radius for better spacing
  const getPosition = (index: number, total: number) => {
    const startAngle = -180; // Start from left
    const endAngle = -90; // End at top
    const angle = startAngle + ((endAngle - startAngle) / (total - 1)) * index;
    const radians = (angle * Math.PI) / 180;
    const radius = 110; // Increased from 80 to 110
    return {
      x: Math.cos(radians) * radius,
      y: Math.sin(radians) * radius,
    };
  };

  // Calculate label position based on button position
  const getLabelPosition = (index: number, total: number) => {
    const { x, y } = getPosition(index, total);
    // Position labels to the left of buttons on the left side, above for top buttons
    if (x < -50) {
      return { left: "-80px", top: "50%", transform: "translateY(-50%)" };
    } else if (y < -50) {
      return { left: "50%", top: "-36px", transform: "translateX(-50%)" };
    } else {
      return { left: "-75px", top: "50%", transform: "translateY(-50%)" };
    }
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

      {/* Radial options */}
      <AnimatePresence>
        {isOpen &&
          fabOptions.map((option, index) => {
            const position = getPosition(index, fabOptions.length);
            const labelStyle = getLabelPosition(index, fabOptions.length);
            const Icon = option.icon;
            return (
              <motion.button
                key={option.id}
                className="absolute w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white"
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
                  stiffness: 400,
                  damping: 20,
                  delay: index * 0.05,
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOptionClick(option.id)}
              >
                <Icon size={22} />
                <motion.span
                  className="absolute whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg"
                  style={{
                    ...labelStyle,
                    zIndex: 50,
                    backgroundColor: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.15 }}
                >
                  {option.label}
                </motion.span>
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
