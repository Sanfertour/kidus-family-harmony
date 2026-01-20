import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, FileText, Settings, UserPlus } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { AddMemberDialog } from "./AddMemberDialog";
import { useNestStore } from "@/store/useNestStore";

const navItems = [
  { id: "home", icon: Home, label: "Nido" },
  { id: "agenda", icon: Calendar, label: "Sincro" },
  { id: "vault", icon: FileText, label: "Bóveda" },
  { id: "settings", icon: Settings, label: "Radar" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { fetchSession, nestId } = useNestStore();

  // Validamos si el nestId es un UUID válido antes de permitir añadir miembros
  const isNestReady = /^[0-9a-fA-F-]{36}$/.test(nestId || "");

  const handleMemberAdded = async () => {
    triggerHaptic('success');
    await fetchSession(); // Recarga la tribu en el Store global
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 h-32 bg-white/80 backdrop-blur-[30px] border-t border-white/50 px-6 flex items-center justify-between z-50 pb-8 shadow-[0_-15px_50px_rgba(0,0,0,0.05)] rounded-t-[3.5rem]"
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Grupo Izquierda: Nido y Sincro */}
      <div className="flex flex-1 justify-around items-center">
        {navItems.slice(0, 2).map((item) => (
          <NavButton 
            key={item.id} 
            item={item} 
            isActive={activeTab === item.id} 
            onClick={() => onTabChange(item.id)} 
          />
        ))}
      </div>

      {/* Botón Central: Integrar Tribu */}
      <div className="flex px-4 -translate-y-6">
        {isNestReady ? (
          <AddMemberDialog onMemberAdded={handleMemberAdded}>
            <button 
              onClick={() => triggerHaptic('medium')}
              className="w-20 h-20 bg-slate-900 rounded-[2.2rem] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-90 transition-all border-[6px] border-white relative group"
            >
              <UserPlus size={28} strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-[1.8rem] bg-sky-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          </AddMemberDialog>
        ) : (
          <div className="w-20 h-20 bg-slate-100 rounded-[2.2rem] flex items-center justify-center text-slate-300 border-[6px] border-white cursor-not-allowed opacity-60">
            <UserPlus size={28} />
          </div>
        )}
      </div>

      {/* Grupo Derecha: Bóveda y Radar */}
      <div className="flex flex-1 justify-around items-center">
        {navItems.slice(2, 4).map((item) => (
          <NavButton 
            key={item.id} 
            item={item} 
            isActive={activeTab === item.id} 
            onClick={() => onTabChange(item.id)} 
          />
        ))}
      </div>
    </motion.nav>
  );
};

// Sub-componente NavButton con estética Brisa
const NavButton = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={() => {
        triggerHaptic('soft');
        onClick();
      }}
      className="flex flex-col items-center gap-1.5 group relative outline-none flex-1 transition-all"
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="activePill"
            className="absolute -top-6 w-8 h-1 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.6)]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          />
        )}
      </AnimatePresence>
      
      <div className={`transition-all duration-500 ${isActive ? "text-sky-500 scale-110" : "text-slate-400 group-hover:text-slate-600"}`}>
        <Icon size={22} strokeWidth={isActive ? 3 : 2} />
      </div>
      
      <span className={`text-[7px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${
        isActive ? "text-slate-900" : "text-slate-400 opacity-50"
      }`}>
        {item.label}
      </span>
    </button>
  );
};
