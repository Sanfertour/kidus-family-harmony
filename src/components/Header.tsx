import { useNavigate } from "react-router-dom";

// Ruta del logo oficial KidUs
const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/kidus-logo-C1AuyFb2.png";

// Función de vibración para la Sincronía del Nido
const triggerHaptic = (type: 'soft' | 'success' = 'soft') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

const Header = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    triggerHaptic('success');
    navigate('/'); // Navegación directa al Nido (Inicio)
  };

  return (
    <header className="flex flex-col items-center justify-center px-8 py-12 max-w-md mx-auto relative z-20">
      {/* CONTENEDOR CENTRAL: Identidad de la Tribu */}
      <div 
        onClick={handleGoHome}
        className="group cursor-pointer flex flex-col items-center gap-4 active:scale-95 transition-all duration-400"
      >
        {/* LOGOTIPO: Geometría Zen con rotación sutil */}
        <div className="w-14 h-14 bg-white rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-slate-200/60 border border-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <img 
            src={LOGO_URL} 
            alt="KidUs Logo" 
            className="w-9 h-9 object-contain" 
          />
        </div>

        {/* NOMBRE Y ESLOGAN CENTRADOS */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
            Kid<span className="text-[#0EA5E9]">Us</span>
          </h1>
          
          <div className="flex items-center gap-2 mt-2">
            {/* Indicador de Sincronía: Tribu en Calma */}
            <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
              Tribu en calma
            </span>
          </div>
        </div>
      </div>

      {/* Brisa Visual: Separador minimalista */}
      <div className="w-12 h-[2px] bg-slate-100 rounded-full mt-6 opacity-50" />
    </header>
  );
};

export default Header;
