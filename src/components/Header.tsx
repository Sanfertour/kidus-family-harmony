import { Bell } from "lucide-react";

// Ruta del logo desde GitHub (versión oficial KidUs)
const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/kidus-logo-C1AuyFb2.png";

// Función de vibración sutil integrada para la Sincronía del Nido
const triggerHaptic = (type: 'soft' | 'success' = 'soft') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

interface HeaderProps {
  onOpenNotifications: () => void;
}

const Header = ({ onOpenNotifications }: HeaderProps) => (
  <header className="flex items-center justify-between px-8 py-10 max-w-md mx-auto relative z-20 font-sans">
    <div className="flex items-center gap-4">
      {/* LOGOTIPO KIDUS: Geometría Zen con Brisa Visual */}
      <div 
        onClick={() => triggerHaptic('success')}
        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200/50 border border-white rotate-3 active:rotate-0 transition-all duration-500 cursor-pointer"
      >
        <img 
          src={LOGO_URL} 
          alt="KidUs" 
          className="w-8 h-8 object-contain" 
        />
      </div>
      
      <div className="flex flex-col">
        {/* Tipografía de alto impacto Nunito Black */}
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">
          Kid<span className="text-[#0EA5E9]">Us</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          {/* Indicador de Sincronía en Calma */}
          <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Sincro Tribu
          </span>
        </div>
      </div>
    </div>
    
    {/* NOTIFICACIONES: Feedback Háptico y Vital Orange */}
    <button 
      onClick={() => {
        triggerHaptic('soft');
        onOpenNotifications();
      }}
      className="w-14 h-14 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center relative shadow-sm active:scale-90 transition-all group"
    >
      <Bell className="w-6 h-6 text-slate-400 group-hover:text-[#0EA5E9] transition-colors" />
      
      {/* Indicador Vital Orange (#F97316) con animación de pulso */}
      <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F97316]"></span>
      </span>
    </button>
  </header>
);

export default Header;
