import { motion } from "framer-motion";
import { Home, Calendar, Users, FileText, Settings } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics"; // Unificamos con tu utilidad

const navItems = [
  { id: "home", icon: Home, label: "Nido" },
  { id: "agenda", icon: Calendar, label: "Sincro" }, // Cambiado a 'agenda' para coincidir con Index
  { id: "family", icon: Users, label: "Tribu" },    // Cambiado a 'family' para coincidir con Index
  { id: "vault", icon: FileText, label: "Bóveda" },
  { id: "settings", icon: Settings, label: "Radar" },
];

export const BottomNav = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) => {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 h-32 bg-white/70 backdrop-blur-[40px] border-t border-white/50 px-8 flex items-center justify-around z-50 pb-8 shadow-[0_-15px_50px_rgba(0,0,0,0.03)] rounded-t-[3.5rem]"
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => {
              triggerHaptic('soft');
              onTabChange(item.id);
            }}
            className="flex flex-col items-center gap-2 group relative outline-none flex-1 transition-all"
          >
            {/* Indicador de Activación Brisa */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute -top-4 w-12 h-1.5 bg-sky-500 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.4)]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                />
              )}
            </AnimatePresence>
            
            {/* Contenedor del Icono con escala dinámica */}
            <motion.div 
              animate={{ 
                scale: isActive ? 1.2 : 1,
                y: isActive ? -4 : 0 
              }}
              className={`p-1 transition-colors duration-300 ${isActive ? "text-sky-500" : "text-slate-400 group-hover:text-slate-600"}`}
            >
              <Icon 
                size={26} 
                strokeWidth={isActive ? 3 : 2}
              />
            </motion.div>
            
            {/* Texto de la Tribu / Radar */}
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${
              isActive ? "text-slate-900 opacity-100" : "text-slate-400 opacity-60"
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
};
