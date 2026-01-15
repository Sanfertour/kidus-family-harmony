import { motion } from "framer-motion";
import { Home, Calendar, Users, FileText, Settings } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Inicio" },
  { id: "calendar", icon: Calendar, label: "Agenda" },
  { id: "family", icon: Users, label: "Familia" },
  { id: "docs", icon: FileText, label: "Docs" },
  { id: "settings", icon: Settings, label: "Ajustes" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <motion.nav
      className="bottom-nav z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`nav-item relative ${isActive ? "active" : ""}`}
          >
            {isActive && (
              <motion.div
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
                layoutId="navIndicator"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="p-2"
            >
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? "text-primary" : ""}
              />
            </motion.div>
            <span className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
};

export default BottomNav;
