import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import logo from "@/assets/kidus-logo.png";

interface HeaderProps {
  nestName?: string;
  notificationCount?: number;
}

const Header = ({ nestName = "Tu Nido", notificationCount = 0 }: HeaderProps) => {
  return (
    <motion.header
      className="sticky top-0 z-30 px-4 py-3 glass-card border-b"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <motion.img
            src={logo}
            alt="KidUs"
            className="w-9 h-9 rounded-xl shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">Estado de Tu Nido</h1>
            <p className="text-xs text-muted-foreground">{nestName}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <motion.button
            className="relative w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <motion.span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </motion.span>
            )}
          </motion.button>
          
          <motion.button
            className="w-9 h-9 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={18} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
