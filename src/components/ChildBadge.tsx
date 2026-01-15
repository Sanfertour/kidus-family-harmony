import { motion } from "framer-motion";

export interface Child {
  id: string;
  name: string;
  school: string;
  grade: string;
  class: string;
  color: string;
  avatar?: string;
}

interface ChildBadgeProps {
  child: Child;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const ChildBadge = ({ child, isSelected, onClick, size = "md" }: ChildBadgeProps) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-sm",
    lg: "w-20 h-20 text-base",
  };

  const initials = child.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <motion.button
      className={`relative flex flex-col items-center gap-1 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200`}
        style={{
          backgroundColor: child.color,
          boxShadow: isSelected
            ? `0 0 0 3px white, 0 0 0 5px ${child.color}`
            : `0 4px 12px ${child.color}40`,
        }}
      >
        {child.avatar ? (
          <img
            src={child.avatar}
            alt={child.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      {size !== "sm" && (
        <span className="text-xs font-medium text-foreground truncate max-w-16">
          {child.name.split(" ")[0]}
        </span>
      )}
      {isSelected && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"
          layoutId="childIndicator"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
};

export default ChildBadge;
