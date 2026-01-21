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
  const isNestReady = /^[0-9a-fA-F-]{36}$/.test(nestId || "");

  const handleMemberAdded = async () => {
    triggerHaptic('success');
    await fetchSession();
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 h-32 bg-white/80 backdrop-blur-[30px] border-t border-white/50 px-6 flex items-center justify-between z-50 pb-8 shadow-[0_-15px_50px_rgba(0,0,0,0.05)] rounded-t-[3.5rem]"
      initial={{ y: 120 }}
      animate={{ y: 0 }}
    >
      <div className="flex flex-1 justify-around items-center">
        {navItems.slice(0, 2).map((item) => (
          <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => onTabChange(item.id)} />
        ))}
      </div>

      <div className="flex px-4 -translate-y-6">
        {isNestReady ? (
          <AddMemberDialog onMemberAdded={handleMemberAdded}>
            <button onClick={() => triggerHaptic('medium')} className="w-20 h-20 bg-slate-900 rounded-[2.2rem] flex items-center justify-center text-white shadow-xl border-[6px] border-white active:scale-90 transition-all">
              <UserPlus size={28} strokeWidth={2.5} />
            </button>
          </AddMemberDialog>
        ) : (
          <div className="w-20 h-20 bg-slate-100 rounded-[2.2rem] flex items-center justify-center text-slate-300 border-[6px] border-white opacity-60">
            <UserPlus size={28} />
          </div>
        )}
      </div>

      <div className="flex flex-1 justify-around items-center">
        {navItems.slice(2, 4).map((item) => (
          <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => onTabChange(item.id)} />
        ))}
      </div>
    </motion.nav>
  );
};

const NavButton = ({ item, isActive, onClick }: { item: any, isActive: boolean, onClick: () => void }) => {
  const Icon = item.icon;
  return (
    <button onClick={() => { triggerHaptic('soft'); onClick(); }} className="flex flex-col items-center gap-1.5 flex-1 relative group">
      <AnimatePresence>
        {isActive && (
          <motion.div layoutId="activePill" className="absolute -top-6 w-8 h-1 bg-sky-500 rounded-full shadow-lg" />
        )}
      </AnimatePresence>
      <div className={`transition-all ${isActive ? "text-sky-500 scale-110" : "text-slate-400"}`}>
        <Icon size={22} strokeWidth={isActive ? 3 : 2} />
      </div>
      <span className={`text-[7px] font-black uppercase tracking-[0.3em] ${isActive ? "text-slate-900" : "text-slate-400 opacity-50"}`}>
        {item.label}
      </span>
    </button>
  );
};
