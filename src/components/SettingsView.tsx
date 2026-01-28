import React, { useState } from 'react';
import { Settings, Users, Shield, Bell, Share2, UserPlus, Heart, ChevronRight } from 'lucide-react';

// Tipado para mantener la integridad
interface SettingsViewProps {
  userProfile: any;
  nestData: any;
  onSyncNest: (code: string) => Promise<void>;
  onAddDependent: (data: any) => Promise<void>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  userProfile, 
  nestData, 
  onSyncNest, 
  onAddDependent 
}) => {
  const [syncCode, setSyncCode] = useState('');

  // Feedback Háptico Universal
  const hapticFeedback = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  const handleAction = async (actionFn: () => Promise<void>) => {
    hapticFeedback();
    await actionFn();
  };

  return (
    <div className="min-h-screen bg-transparent p-6 pb-24 space-y-8 animate-in fade-in duration-700">
      
      {/* Header Estilo Brisa */}
      <header className="mt-8 mb-10">
        <h1 className="text-4xl font-light text-slate-800 tracking-tight">
          Ajustes de <span className="font-semibold text-indigo-600">Sincronía</span>
        </h1>
        <p className="text-slate-500 mt-2">Gestiona tu Nido y la seguridad de tu Tribu</p>
      </header>

      {/* Card: Información del Nido Actual */}
      <section className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-100/50 rounded-3xl">
              <Shield className="text-indigo-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Código del Nido</p>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tighter italic">
                {nestData?.nest_code || 'KID-XXXXX'}
              </h2>
            </div>
          </div>
          <button 
            onClick={() => {
              hapticFeedback();
              navigator.clipboard.writeText(nestData?.nest_code);
            }}
            className="p-4 hover:bg-white/60 rounded-full transition-all active:scale-95"
          >
            <Share2 size={20} className="text-slate-600" />
          </button>
        </div>
      </section>

      {/* SECCIÓN: Sincronizar Nests (Unir a otro Guía) */}
      <section className="space-y-4">
        <h3 className="ml-6 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Users size={16} /> Sincronizar Nidos
        </h3>
        <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[3.5rem] p-8 space-y-4 shadow-xl shadow-indigo-500/5">
          <p className="text-slate-600 text-sm leading-relaxed px-2">
            Introduce el código de otro Nido para fusionar calendarios con otro **Guía**. Esta acción unifica la gestión pero mantiene la autonomía.
          </p>
          <div className="relative group">
            <input 
              type="text"
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value.toUpperCase())}
              placeholder="KID-00000"
              className="w-full bg-white/80 border-none rounded-[2rem] py-4 px-6 text-lg font-mono focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
            <button 
              onClick={() => handleAction(() => onSyncNest(syncCode))}
              className="absolute right-2 top-2 bg-indigo-600 text-white px-6 py-2.5 rounded-[1.5rem] font-medium hover:bg-indigo-700 transition-colors"
            >
              Vincular
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Añadir Miembros (Tribu / Peques) */}
      <section className="space-y-4">
        <h3 className="ml-6 text-sm font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Heart size={16} /> Gestión de la Tribu
        </h3>
        <div 
          onClick={() => handleAction(async () => {})} // Aquí se abriría tu modal de AddDependent
          className="group cursor-pointer bg-white/60 backdrop-blur-md border border-white/80 rounded-[3.5rem] p-8 flex items-center justify-between hover:bg-white/80 transition-all shadow-xl shadow-pink-500/5"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 bg-pink-100/50 rounded-3xl group-hover:scale-110 transition-transform">
              <UserPlus className="text-pink-600" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-800">Añadir Dependiente</h4>
              <p className="text-sm text-slate-500 text-balance">Registra a los Peques para asignarles eventos y tareas.</p>
            </div>
          </div>
          <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </section>

      {/* Preferencias de Notificaciones y Privacidad */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/40 shadow-sm">
          <Bell className="text-slate-400 mb-3" size={20} />
          <span className="block font-semibold text-slate-800">Alertas</span>
          <span className="text-xs text-slate-500">Sincronía en tiempo real</span>
        </div>
        <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/40 shadow-sm">
          <Shield className="text-slate-400 mb-3" size={20} />
          <span className="block font-semibold text-slate-800">Privacidad</span>
          <span className="text-xs text-slate-500">Modo Ocupado activo</span>
        </div>
      </section>

      {/* Footer Log Out - Discreto */}
      <footer className="pt-10 flex justify-center">
        <button className="text-slate-400 text-sm font-medium hover:text-red-400 transition-colors uppercase tracking-[0.2em]">
          Cerrar Sesión
        </button>
      </footer>

    </div>
  );
};

export { SettingsView };
