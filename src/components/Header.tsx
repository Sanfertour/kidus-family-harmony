import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import logo from "@/assets/kidus-logo.png";

interface HeaderProps {
  nestName?: string;
  notificationCount?: number;
  onSettingsClick?: () => void; // Nueva prop para abrir ajustes
}

const Header = ({ nestName = "Tu Nido", notificationCount = 0, onSettingsClick }: HeaderProps) => {
  return (
    <motion.header
      // Eliminamos glass-card y ponemos un blur ultra-suave y sin bordes laterales
      className="sticky top-0 z-50 px-6 py-4 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-sm"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Logo and title */}
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={logo}
              alt="KidUs"
              className="w-10 h-10 rounded-2xl shadow-lg ring-2 ring-white/20"
            />
          </motion.div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">
              Estado de Tu Nido
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-70">
              {nestName}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Botón Notificaciones */}
          <motion.button
            className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-700 hover:bg-white/40 transition-all border border-white/30"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell size={20} strokeWidth={2.5} />
            {notificationCount > 0 && (
              <motion.span
                className="absolute top-0 right-0 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {notificationCount > 9 ? "9+" : notificationCount}
              </motion.span>
            )}
          </motion.button>
          
          {/* Botón Ajustes - Preparado para la acción */}
          <motion.button
            onClick={onSettingsClick}
            className="w-10 h-10 rounded-full bg-slate-900/5 backdrop-blur-md flex items-center justify-center text-slate-700 hover:bg-white/40 transition-all border border-white/30"
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings size={20} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
