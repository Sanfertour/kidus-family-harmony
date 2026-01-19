import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { triggerHaptic } from '@/utils/haptics';

export const NestOnboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [nestCode, setNestCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateNest = async () => {
    triggerHaptic('medium');
    setLoading(true);
    const { data: newCode } = await supabase.rpc('generate_kid_code');
    
    if (newCode) {
      const { data: nest } = await supabase
        .from('nests')
        .insert([{ nest_code: newCode }])
        .select()
        .single();

      if (nest) {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('profiles').update({ nest_id: nest.id }).eq('id', user?.id);
        onComplete();
      }
    }
    setLoading(false);
  };

  const handleJoinNest = async () => {
    setLoading(true);
    const { data: nest } = await supabase
      .from('nests')
      .select('id')
      .eq('nest_code', nestCode.toUpperCase().trim())
      .single();

    if (nest) {
      triggerHaptic('medium');
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ nest_id: nest.id }).eq('id', user?.id);
      onComplete();
    } else {
      triggerHaptic('error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* Contenedor Principal con Glassmorphism Profundo */}
      <div className="w-full max-w-[440px] bg-white/40 backdrop-blur-[40px] border border-white/40 rounded-[4rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] relative z-10 transition-all duration-700">
        
        {/* Cabecera Elite */}
        <header className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 bg-sky-500/10 rounded-full mb-6">
            <span className="text-[10px] font-black tracking-[0.4em] text-sky-600 uppercase">Sincronía Familiar</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-[0.9]">
            Tu nuevo<br/><span className="text-sky-500">Nido.</span>
          </h1>
        </header>

        <div className="space-y-10">
          {/* Opción A: Crear */}
          <section>
            <button 
              onClick={handleCreateNest}
              disabled={loading}
              className="group relative w-full py-6 bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)] active:scale-[0.98]"
            >
              <span className="relative z-10 text-white font-bold text-lg tracking-tight">Comenzar un Nido nuevo</span>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </section>

          {/* Divisor Visual */}
          <div className="relative flex items-center justify-center">
            <div className="w-full h-[1px] bg-slate-200" />
            <span className="absolute px-4 bg-white/0 text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase backdrop-blur-sm">o</span>
          </div>

          {/* Opción B: Unirse */}
          <section className="space-y-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="CÓDIGO KID-XXXXX"
                value={nestCode}
                onChange={(e) => setNestCode(e.target.value)}
                className="w-full bg-white/60 border-2 border-transparent focus:border-sky-400/30 p-6 rounded-[2.5rem] text-center font-mono text-xl tracking-[0.2em] outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal"
              />
            </div>
            
            <button 
              onClick={handleJoinNest}
              disabled={loading || !nestCode}
              className="w-full py-6 bg-white border-2 border-slate-100 text-slate-900 rounded-[2.5rem] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Vincularme a un Nido
            </button>
          </section>
        </div>

        {/* Footer Motivador */}
        <footer className="mt-12 text-center">
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Elimina la carga mental.<br/>
            Sincroniza tu equipo hoy.
          </p>
        </footer>
      </div>
    </div>
  );
};
