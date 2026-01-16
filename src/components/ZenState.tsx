import { motion } from "framer-motion";
import { Wind, Leaf } from "lucide-react";

const ZenState = () => {
  return (
    <motion.div
      className="zen-state flex flex-col items-center justify-center py-16 px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated breeze illustration */}
      <motion.div
        className="relative mb-8"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-secondary/30 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/15 to-secondary/40 flex items-center justify-center">
            <Wind className="w-10 h-10 text-primary/70" />
          </div>
        </div>
        
        {/* Floating leaves */}
        <motion.div
          className="absolute -top-3 right-0"
          animate={{ 
            x: [0, 15, 0], 
            y: [0, -10, 0],
            rotate: [0, 15, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="w-5 h-5 text-success/60" />
        </motion.div>
        <motion.div
          className="absolute bottom-2 -left-4"
          animate={{ 
            x: [0, -10, 0], 
            y: [0, 5, 0],
            rotate: [0, -20, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Leaf className="w-4 h-4 text-primary/50" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 -right-6"
          animate={{ 
            x: [0, 8, 0], 
            y: [0, -5, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Leaf className="w-3 h-3 text-accent/50" />
        </motion.div>
      </motion.div>

      {/* Zen message */}
      <motion.h2
        className="text-2xl font-bold text-foreground mb-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Tu Nido está en paz
      </motion.h2>
      
      <motion.p
        className="text-muted-foreground text-center max-w-[280px] leading-relaxed text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Disfruta del silencio. KidUs vigila por ti.
      </motion.p>

      {/* Subtle tip */}
      <motion.div
        className="mt-8 px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Toca + para añadir eventos
      </motion.div>
    </motion.div>
  );
};

export default ZenState;
