import { useNavigate } from "react-router-dom";

// URL actualizada según tu solicitud
const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_141931.jpg";

const triggerHaptic = (type: 'soft' | 'success' = 'soft') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(type === 'soft' ? 10 : [20, 30, 20]);
  }
};

const Header = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    triggerHaptic('success');
    navigate('/'); 
  };

  return (
    <header className="flex flex-col items-center justify-center px-8 py-10 max-w-md mx-auto relative z-20">
      <div 
        onClick={handleGoHome}
        className="group cursor-pointer flex flex-col items-center gap-3 active:scale-95 transition-all duration-500"
      >
        {/* MARCO ZEN: Cristal con rotación suave y sombras profundas */}
        <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-sky-100/60 border border-white/50 rotate-3 group-hover:rotate-0 transition-all duration-700 overflow-hidden p-2">
          <img 
            src={LOGO_URL} 
            alt="KidUs" 
            className="w-full h-full object-contain rounded-xl" 
          />
        </div>

        {/* MARCA KIDUS */}
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic">
            Kid<span className="text-sky-500">Us</span>
          </h1>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">
              Sincronía Elite
            </span>
          </div>
        </div>
      </div>

      {/* Separador Brisa sutil */}
      <div className="w-8 h-[2px] bg-slate-100 rounded-full mt-6 opacity-60" />
    </header>
  );
};

export default Header;
