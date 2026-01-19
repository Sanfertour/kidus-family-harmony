import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Verifica que tu cliente de Supabase esté aquí
import { triggerHaptic } from '../utils/haptics';

export const NestOnboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [nestCode, setNestCode] = useState('');
  const [loading, setLoading] = useState(false);

  // FUNCIÓN: Crear Nido Nuevo
  const handleCreateNest = async () => {
    triggerHaptic('medium');
    setLoading(true);
    
    // 1. Genera el código KID-XXXXX en la DB
    const { data: newCode } = await supabase.rpc('generate_kid_code');
    
    if (newCode) {
      // 2. Registra el nuevo nido
      const { data: nest } = await supabase
        .from('nests')
        .insert([{ nest_code: newCode }])
        .select()
        .single();

      if (nest) {
        // 3. Vincula al usuario con el nido
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('profiles').update({ nest_id: nest.id }).eq('id', user?.id);
        onComplete(); // Avisa a la App que ya puede ir a la Agenda
      }
    }
    setLoading(false);
  };

  // FUNCIÓN: Unirse a Nido Existente
  const handleJoinNest = async () => {
    triggerHaptic('soft');
    setLoading(true);
    const { data: nest } = await supabase
      .from('nests')
      .select('id')
      .eq('nest_code', nestCode.toUpperCase().trim())
      .single();

    if (nest) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ nest_id: nest.id }).eq('id', user?.id);
      onComplete();
    } else {
      triggerHaptic('error');
      alert("Código no encontrado. Verifica que el KID-XXXXX sea correcto.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-10 rounded-[3.5rem] shadow-2xl border border-white">
        <h2 className="text-3xl font-black tracking-tighter text-slate-800 mb-6 text-center">Configura tu Nido</h2>
        
        <div className="space-y-6">
          <button 
            onClick={handleCreateNest}
            disabled={loading}
            className="w-full py-5 bg-sky-500 text-white rounded-[2.5rem] font-bold shadow-lg hover:bg-sky-600 transition-all active:scale-95"
          >
            CREAR MI NIDO
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="mx-4 text-[10px] font-black tracking-[0.3em] text-slate-400">O ÚNETE A UNO</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <input 
            type="text"
            placeholder="Introduce KID-XXXXX"
            value={nestCode}
            onChange={(e) => setNestCode(e.target.value)}
            className="w-full p-5 bg-slate-100/50 rounded-[2rem] text-center font-mono text-xl uppercase tracking-widest border-2 border-transparent focus:border-sky-300 outline-none transition-all"
          />

          <button 
            onClick={handleJoinNest}
            disabled={loading || !nestCode}
            className="w-full py-5 bg-slate-800 text-white rounded-[2.5rem] font-bold shadow-lg hover:bg-slate-900 transition-all active:scale-95"
          >
            VINCULAR CON PAREJA
          </button>
        </div>
      </div>
    </div>
  );
};
