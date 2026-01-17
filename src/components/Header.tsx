import { Bell } from "lucide-react";

const Header = () => (
  <header className="flex items-center justify-between px-6 py-10 max-w-md mx-auto relative z-20 font-nunito">
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        {/* LOGOTIPO CON EFECTO DE ELEVACIÓN */}
        <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/50 rotate-3">
          <img 
            src="/kidus-logo-C1AuyFb2.png" 
            alt="KidUs" 
            className="w-7 h-7 object-contain" 
          />
        </div>
        
        <div className="flex flex-col -space-y-1">
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
            Kid<span className="text-[#0EA5E9]">Us</span>
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Control Center
            </span>
          </div>
        </div>
      </div>
    </div>
    
    {/* BOTÓN DE NOTIFICACIONES ESTILO KIDUS */}
    <button className="w-14 h-14 rounded-[1.5rem] bg-white/70 backdrop-blur-xl border border-white flex items-center justify-center relative shadow-xl shadow-slate-200/40 hover:scale-110 active:scale-90 transition-all group">
      <Bell className="w-6 h-6 text-slate-600 group-hover:text-[#0EA5E9] transition-colors" />
      
      {/* INDICADOR DE NOTIFICACIÓN VIBRANTE */}
      <span className="absolute top-3 right-3 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F97316] border-2 border-white"></span>
      </span>
    </button>
  </header>
);

export default Header;
