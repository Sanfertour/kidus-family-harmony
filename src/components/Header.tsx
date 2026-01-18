import { Bell } from "lucide-react";

// Ruta del logo desde GitHub (versión raw para renderizado directo)
const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/kidus-logo-C1AuyFb2.png";

// Función de vibración sutil para feedback táctil
const triggerHaptic = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
};

const Header = () => (
  <header className="flex items-center justify-between px-6 py-10 max-w-md mx-auto relative z-20 font-sans">
    <div className="flex flex-col">
      <div className="flex items-center gap-4">
        {/* LOGOTIPO KIDUS CON GEOMETRÍA ZEN */}
        <div 
          onClick={triggerHaptic}
          className="w-12 h-12 bg-white/80 backdrop-blur-2xl rounded-3xl flex items-center justify-center shadow-brisa border border-white/50 rotate-3 active:rotate-0 transition-all duration-500 cursor-pointer"
        >
          <img 
            src={LOGO_URL} 
            alt="KidUs" 
            className="w-8 h-8 object-contain" 
          />
        </div>
        
        <div className="flex flex-col -space-y-1">
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
            Kid<span className="text-primary">Us</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              Sincro Tribu
            </span>
          </div>
        </div>
      </div>
    </div>
    
    {/* NOTIFICACIONES CON HAPTIC FEEDBACK */}
    <button 
      onClick={() => {
        triggerHaptic();
        // Aquí iría la lógica para abrir notificaciones
      }}
      className="w-16 h-16 rounded-5xl bg-white/70 backdrop-blur-2xl border border-white/60 flex items-center justify-center relative shadow-haptic active:scale-90 transition-all group"
    >
      <Bell className="w-7 h-7 text-slate-600 group-hover:text-primary transition-colors" />
      
      {/* INDICADOR VITAL ORANGE */}
      <span className="absolute top-4 right-4 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-secondary border-2 border-white shadow-sm"></span>
      </span>
    </button>
  </header>
);

export default Header;
