import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";

const ZenState = () => {
  return (
    <motion.div
      className="zen-state flex flex-col items-center justify-center min-h-[60vh]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Floating zen icon */}
      <motion.div
        className="relative mb-8"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-kidus-blue/20 to-kidus-teal/20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-kidus-blue/30 to-kidus-teal/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        {/* Decorative hearts */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="w-5 h-5 text-accent fill-accent" />
        </motion.div>
        <motion.div
          className="absolute -bottom-1 -left-3"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Heart className="w-4 h-4 text-kidus-teal fill-kidus-teal" />
        </motion.div>
      </motion.div>

      {/* Zen message */}
      <motion.h2
        className="text-2xl font-display font-bold text-foreground mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Todo despejado
      </motion.h2>
      
      <motion.p
        className="text-muted-foreground text-center max-w-xs leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        KidUs vigila por ti. Disfruta de este momento de paz familiar.
      </motion.p>

      {/* Subtle tip */}
      <motion.div
        className="mt-8 px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        💡 Toca + para añadir eventos
      </motion.div>
    </motion.div>
  );
};

export default ZenState;
