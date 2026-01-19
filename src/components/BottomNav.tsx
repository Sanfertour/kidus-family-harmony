import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, Users, FileText, Settings, UserPlus } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { AddMemberDialog } from "./AddMemberDialog"; // Importamos el diálogo
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
  const { fetchSession } = useNestStore();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 h-32 bg-white/70 backdrop-blur-[40px] border-t border-white/50 px-6 flex items-center justify-between z-50 pb-8 shadow-[0_-15px_50px_rgba(0,0,0,0.03)] rounded-t-[3.5rem]"
      initial={{ y: 120 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      {/* Botones de la izquierda */}
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

      {/* Botón Central: Add Member (Acceso Directo a la Tribu) */}
      <div className="flex px-2 -translate-y-4">
        <AddMemberDialog onMemberAdded={() => fetchSession()}>
          <button 
            onClick={() => triggerHaptic('medium')}
            className="w-20 h-20 bg-slate-900 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200 active:scale-90 transition-all border-4 border-white"
          >
            <UserPlus size={28} strokeWidth={2.5} />
          </button>
        </AddMemberDialog>
      </div>

      {/* Botones de la derecha */}
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

// Sub-componente para limpiar el código
const NavButton = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => {
        triggerHaptic('soft');
        onClick();
      }}
      className="flex flex-col items-center gap-2 group relative outline-none flex-1 transition-all"
    >
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="activePill"
            className="absolute -top-4 w-10 h-1 bg-sky-500 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.4)]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          />
        )}
      </AnimatePresence>
      
      <motion.div 
        animate={{ scale: isActive ? 1.2 : 1, y: isActive ? -2 : 0 }}
        className={`p-1 transition-colors duration-300 ${isActive ? "text-sky-500" : "text-slate-400"}`}
      >
        <Icon size={24} strokeWidth={isActive ? 3 : 2} />
      </motion.div>
      
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${
        isActive ? "text-slate-900" : "text-slate-400 opacity-60"
      }`}>
        {item.label}
      </span>
    </button>
  );
};
