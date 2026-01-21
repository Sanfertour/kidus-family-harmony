import { useNestStore } from "@/store/useNestStore";
import { triggerHaptic } from "@/utils/haptics";
import { LogOut, Shield, Bell, Users, ChevronRight, Share2 } from "lucide-react";

export const SettingsView = () => {
  // Extraemos solo lo que necesitamos del motor central (Store)
  const { profile, nestCode, signOut } = useNestStore();

  const handleLogout = async () => {
    triggerHaptic('medium');
    await signOut();
  };

  const copyNestCode = () => {
    if (nestCode) {
      navigator.clipboard.writeText(nestCode);
      triggerHaptic('success');
      // Podríamos añadir un toast aquí después
    }
  };

  return (
    <div className="p-8 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-md mx-auto">
      <header className="space-y-1">
        <h2 className="text-4xl font-black tracking-tight text-slate-900">Ajustes</h2>
        <p className="text-slate-500 font-medium">Configuración de tu Nido</p>
      </header>

      {/* Tarjeta de Perfil Elite */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-2xl shadow-slate-200/50">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-sky-600 rounded-[2rem] flex items-center justify-center text-white shadow-lg shadow-sky-100">
            <span className="font-black text-2xl">
              {profile?.display_name?.charAt(0) || 'G'}
            </span>
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900">{profile?.display_name || 'Guía'}</h3>
            <span className="inline-flex px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">
              {profile?.role || 'Guía'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={copyNestCode}
          className="w-full bg-slate-950 rounded-[1.8rem] p-5 flex justify-between items-center group active:scale-[0.98] transition-all"
        >
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Tu Código KID</span>
            <span className="font-mono font-bold text-white text-lg tracking-wider">{nestCode || 'KID-XXXXX'}</span>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl text-white group-hover:bg-white/20 transition-colors">
            <Share2 size={18} />
          </div>
        </button>
      </div>

      {/* Menú de Opciones */}
      <div className="space-y-4">
        {[
          { icon: Users, label: 'Gestionar Tribu', color: 'bg-orange-50', iconColor: 'text-orange-500' },
          { icon: Bell, label: 'Notificaciones', color: 'bg-sky-50', iconColor: 'text-sky-500' },
          { icon: Shield, label: 'Seguridad y Privacidad', color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => triggerHaptic('soft')}
            className="w-full flex items-center justify-between p-6 bg-white/40 hover:bg-white/80 transition-all rounded-[2rem] border border-white group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${item.color} ${item.iconColor} rounded-2xl`}>
                <item.icon size={22} />
              </div>
              <span className="font-bold text-slate-700 tracking-tight">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* Botón de Salida */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-7 bg-red-50 text-red-500 font-black uppercase tracking-widest text-[11px] rounded-[2.2rem] hover:bg-red-100 transition-all border border-red-100 mt-4 shadow-sm"
      >
        <LogOut size={18} strokeWidth={3} />
        Cerrar Sincronía
      </button>

      <div className="text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">KidUs v1.0.0 — Elite Family Management</p>
      </div>
    </div>
  );
};
