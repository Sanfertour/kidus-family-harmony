import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg";

const triggerHaptic = (type: 'soft' | 'success' = 'soft') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

const Header = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    triggerHaptic('soft');
    navigate('/'); 
  };

  return (
    <header className="flex flex-col items-center justify-center px-8 pt-12 pb-8 max-w-md mx-auto relative z-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleGoHome}
        className="group cursor-pointer flex flex-col items-center gap-4 active:scale-95 transition-all duration-500"
      >
        {/* LOGO CON MARCO ZEN */}
        <div className="relative">
          <div className="absolute inset-0 bg-sky-400/15 blur-2xl rounded-full scale-50 group-hover:scale-100 transition-transform duration-700" />
          <div className="relative w-20 h-20 bg-white/80 backdrop-blur-xl rounded-[2.8rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white rotate-3 group-hover:rotate-0 transition-all duration-700 overflow-hidden p-2">
            <img 
              src={LOGO_URL} 
              alt="KidUs" 
              className="w-full h-full object-contain rounded-[1.8rem]" 
            />
          </div>
        </div>

        {/* TEXTO DE MARCA Y SUBTÍTULO AMABLE */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">
            Kid<span className="text-sky-500">Us</span>
          </h1>
          
          <div className="mt-3 flex flex-col items-center">
            {/* Subtítulo actualizado: Más humano y motivador */}
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
              Armonía en vuestra Tribu
            </span>
            
            <div className="flex items-center gap-1.5 mt-2 opacity-60">
              <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 italic">
                Sincronía activa
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Separador sutil */}
      <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent mt-8" />
    </header>
  );
};

export default Header;
