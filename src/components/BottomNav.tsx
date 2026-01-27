import { motion, AnimatePresence } from "framer-motion";
import { Home, Calendar, FileText, Settings, Plus, Camera, PenLine } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { useState } from "react";

const navItems = [
  { id: "home", icon: Home, label: "Nido" },
  { id: "agenda", icon: Calendar, label: "Sincro" },
  { id: "vault", icon: FileText, label: "Bóveda" },
  { id: "settings", icon: Settings, label: "Ajustes" }, // Nombre actualizado
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  onAction: (type: 'manual' | 'scan') => void;
}

export const BottomNav = ({ activeTab, onTabChange, onAction }: BottomNavProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    triggerHaptic('medium');
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]">
      {/* Menú Flotante de Acción (FAB Menu) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[-1]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
            />
            {/* mb-12 para que flote por encima del botón central sin taparlo */}
            <motion.div 
              className="flex flex-col gap-4 items-center mb-12" 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <ActionButton 
                icon={Camera} 
                label="Escanear" 
                onClick={() => { onAction('scan'); toggleMenu(); }} 
                color="bg-sky-500"
              />
              <ActionButton 
                icon={PenLine} 
                label="Manual" 
                onClick={() => { onAction('manual'); toggleMenu(); }} 
                color="bg-slate-800"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.nav
        className="h-28 bg-white/80 backdrop-blur-[30px] border-t border-white/50 px-6 flex items-center justify-between shadow-[0_-15px_50px_rgba(0,0,0,0.08)] rounded-t-[3.5rem]"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="flex flex-1 justify-around items-center">
          {navItems.slice(0, 2).map((item) => (
            <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => onTabChange(item.id)} />
          ))}
        </div>

        {/* FAB CENTRAL - EL CORAZÓN DE KIDUS */}
        <div className="flex px-4 -translate-y-8">
          <button 
            onClick={toggleMenu}
            className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl border-[6px] border-white active:scale-90 transition-all duration-500 ${isMenuOpen ? "bg-red-400 rotate-45" : "bg-slate-900 rotate-0"}`}
          >
            <Plus size={32} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-1 justify-around items-center">
          {navItems.slice(2, 4).map((item) => (
            <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => onTabChange(item.id)} />
          ))}
        </div>
      </motion.nav>
    </div>
  );
};

// --- SUBCOMPONENTES AUXILIARES (Restaurados) ---

const NavButton = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
  const Icon = item.icon;
  return (
    <button onClick={() => { triggerHaptic('soft'); onClick(); }} className="flex flex-col items-center gap-1.5 flex-1 group">
      <div className={`transition-all duration-300 ${isActive ? "text-sky-500 scale-110" : "text-slate-400"}`}>
        <Icon size={22} strokeWidth={isActive ? 3 : 2} />
      </div>
      <span className={`text-[7px] font-black uppercase tracking-[0.3em] ${isActive ? "text-slate-900" : "text-slate-400 opacity-50"}`}>
        {item.label}
      </span>
    </button>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, color }: any) => (
  <button 
    onClick={() => { triggerHaptic('medium'); onClick(); }}
    className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full shadow-xl border border-slate-100 active:scale-95 transition-all"
  >
    <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white`}>
      <Icon size={18} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{label}</span>
  </button>
);
