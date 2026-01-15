import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import logo from "@/assets/kidus-logo.png";

interface HeaderProps {
  userName?: string;
  notificationCount?: number;
}

const Header = ({ userName = "Familia", notificationCount = 0 }: HeaderProps) => {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <motion.header
      className="sticky top-0 z-30 px-4 py-4 glass-card border-b"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo and greeting */}
        <div className="flex items-center gap-3">
          <motion.img
            src={logo}
            alt="KidUs"
            className="w-10 h-10 rounded-xl shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
          <div>
            <p className="text-sm text-muted-foreground">{greeting()}</p>
            <h1 className="text-lg font-display font-bold text-foreground">{userName}</h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={20} />
          </motion.button>
          
          <motion.button
            className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <motion.span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
