import { motion } from "framer-motion";
import { Wind, Leaf } from "lucide-react";

const ZenState = () => {
  return (
    <motion.div
      className="zen-state flex flex-col items-center justify-center py-20 px-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Ease-out suave (Brisa)
    >
      {/* Ilustración de Brisa Animada */}
      <motion.div
        className="relative mb-10"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-kidus-sky/10 to-kidus-vital/20 flex items-center justify-center backdrop-blur-sm border border-white/50 shadow-brisa">
          <div className="w-24 h-24 rounded-[2.5rem] bg-white/40 flex items-center justify-center">
            <Wind className="w-12 h-12 text-kidus-sky/60" />
          </div>
        </div>
        
        {/* Hojas flotantes sincronizadas */}
        <motion.div
          className="absolute -top-4 right-2"
          animate={{ x: [0, 15, 0], y: [0, -10, 0], rotate: [0, 25, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="w-6 h-6 text-kidus-mint/50" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-2 -left-6"
          animate={{ x: [0, -12, 0], y: [0, 8, 0], rotate: [0, -30, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Leaf className="w-5 h-5 text-kidus-sky/40" />
        </motion.div>
      </motion.div>

      {/* Mensaje de la Tribu */}
      <motion.h2
        className="text-3xl font-black text-slate-800 mb-4 text-center font-nunito tracking-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Sincronía total
      </motion.h2>
      
      <motion.p
        className="text-slate-500 text-center max-w-[300px] leading-relaxed text-base font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Tu equipo está cubierto. Disfruta de la calma en el Nido.
      </motion.p>

      {/* CTA con Feedback Visual */}
      <motion.div
        className="mt-12 px-8 py-3 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-kidus-vital text-xs font-black uppercase tracking-[0.2em] shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        Pulsa + para gestionar la tribu
      </motion.div>
    </motion.div>
  );
};

export default ZenState;
