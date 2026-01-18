import { motion } from "framer-motion";
import { Home, Calendar, Users, FileText, Settings } from "lucide-react";

// Función háptica para navegación suave
const triggerNavHaptic = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
};

const navItems = [
  { id: "home", icon: Home, label: "Nido" }, // El hogar
  { id: "calendar", icon: Calendar, label: "Sincro" }, // Agenda -> Sincronización
  { id: "tribe", icon: Users, label: "Tribu" }, // Familia -> Tribu
  { id: "vault", icon: FileText, label: "Bóveda" }, // Docs -> Bóveda (más potente)
  { id: "settings", icon: Settings, label: "Radar" }, // Ajustes -> Radar
];

export const BottomNav = ({ activeTab, onTabChange }: any) => {
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-3xl border-t border-white/50 px-6 flex items-center justify-around z-50 pb-4"
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
            className="flex flex-col items-center gap-1 group relative outline-none"
          >
            {isActive && (
              <motion.div
                layoutId="navIndicator"
                className="absolute -top-4 w-12 h-1 bg-[#0EA5E9] rounded-full shadow-[0_0_12px_#0EA5E9]"
              />
            )}
            
            <div className={`p-2 transition-all duration-300 ${isActive ? "scale-110" : "opacity-40"}`}>
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "text-[#0EA5E9]" : "text-slate-600"}
              />
            </div>
            
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${
              isActive ? "text-slate-800" : "text-slate-400"
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
};
