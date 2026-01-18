import { motion } from "framer-motion";
import { Home, Calendar, Users, FileText, Settings } from "lucide-react";

const triggerNavHaptic = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
};

const navItems = [
  { id: "home", icon: Home, label: "Nido" },
  { id: "calendar", icon: Calendar, label: "Sincro" },
  { id: "tribe", icon: Users, label: "Tribu" },
  { id: "vault", icon: FileText, label: "Bóveda" },
  { id: "settings", icon: Settings, label: "Radar" },
];

export const BottomNav = ({ activeTab, onTabChange }: any) => {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-3xl border-t border-white/50 px-6 flex items-center justify-around z-50 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => {
              triggerNavHaptic();
              onTabChange(item.id);
            }}
            className="flex flex-col items-center gap-1.5 group relative outline-none flex-1"
          >
            {/* Indicador superior animado */}
            {isActive && (
              <motion.div
                layoutId="navIndicator"
                className="absolute -top-4 w-10 h-1 bg-[#0EA5E9] rounded-full shadow-[0_0_12px_#0EA5E9]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            
            {/* Contenedor del Icono con contraste ajustado */}
            <div className={`p-1.5 transition-all duration-300 ${isActive ? "scale-115" : "opacity-70"}`}>
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "text-[#0EA5E9]" : "text-slate-800"} 
              />
            </div>
            
            {/* Texto del Radar/Tribu */}
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
              isActive ? "text-slate-900" : "text-slate-500"
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
};
