import { motion } from "framer-motion";
import ChildBadge, { Child } from "./ChildBadge";
import { ChevronRight, Plus } from "lucide-react";

interface ChildrenSelectorProps {
  children: Child[];
  selectedChildId?: string;
  onChildSelect: (childId: string) => void;
  onAddChild?: () => void;
}

const ChildrenSelector = ({
  children,
  selectedChildId,
  onChildSelect,
  onAddChild,
}: ChildrenSelectorProps) => {
  return (
    <motion.section
      className="px-4 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Tus hijos</h2>
        <button className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
          Ver todos <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {/* All option */}
        <motion.button
          className={`flex flex-col items-center gap-1 min-w-fit`}
          onClick={() => onChildSelect("all")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 ${
              !selectedChildId || selectedChildId === "all"
                ? "bg-primary text-primary-foreground shadow-fab"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            👨‍👩‍👧‍👦
          </div>
          <span className="text-xs font-medium text-foreground">Todos</span>
        </motion.button>

        {/* Children */}
        {children.map((child) => (
          <ChildBadge
            key={child.id}
            child={child}
            isSelected={selectedChildId === child.id}
            onClick={() => onChildSelect(child.id)}
          />
        ))}

        {/* Add child button */}
        {onAddChild && (
          <motion.button
            className="flex flex-col items-center gap-1 min-w-fit"
            onClick={onAddChild}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Añadir</span>
          </motion.button>
        )}
      </div>
    </motion.section>
  );
};

export default ChildrenSelector;
