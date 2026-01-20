import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { triggerHaptic } from "@/utils/haptics";
import { Plus, Users, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const OnboardingView = () => {
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice');
  const [nestName, setNestName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchSession, profile } = useNestStore();

  // Función para generar código KID-XXXXX aleatorio
  const generateNestCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `KID-${code}`;
  };

  const handleCreateNest = async () => {
    if (!nestName.trim()) return;
    setLoading(true);
    triggerHaptic('success');

    try {
      const nestCode = generateNestCode();
      
      // 1. Crear el Nido
      const { data: newNest, error: nestError } = await supabase
        .from('nests')
        .insert({ name: nestName, nest_code: nestCode })
        .select()
        .single();

      if (nestError) throw nestError;

      // 2. Vincular al usuario actual como Guía
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nest_id: newNest.id, role: 'autonomous' })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      await fetchSession(); // Actualiza el estado global y nos mete en la app
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinNest = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    triggerHaptic('medium');

    try {
      // 1. Buscar el nido por código
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .select('id')
        .eq('nest_code', joinCode.toUpperCase().trim())
        .single();

      if (nestError || !nest) throw new Error("Código no válido");

      // 2. Vincular usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nest_id: nest.id, role: 'autonomous' })
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      await fetchSession();
    } catch (error) {
      alert("No encontramos ese código de Nido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {step === 'choice' && (
          <motion.div 
            key="choice"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md space-y-8 text-center"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-sky-200">
                <Sparkles size={40} />
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Bienvenido</h1>
              <p className="text-slate-400 font-medium italic">Para empezar, necesitamos situarte en un Nido.</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={() => { triggerHaptic('soft'); setStep('create'); }}
                className="group p-8 bg-white rounded-[3rem] border-4 border-transparent hover:border-sky-100 shadow-brisa transition-all text-left flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-800">Fundar un Nido</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Nuevo grupo familiar</p>
                </div>
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
              </button>

              <button 
                onClick={() => { triggerHaptic('soft'); setStep('join'); }}
                className="group p-8 bg-white rounded-[3rem] border-4 border-transparent hover:border-orange-100 shadow-brisa transition-all text-left flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-800">Unirse a uno</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ya tengo un código</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {(step === 'create' || step === 'join') && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white p-10 rounded-[4rem] shadow-2xl space-y-8 relative overflow-hidden"
          >
            <button 
              onClick={() => setStep('choice')}
              className="absolute top-8 left-8 text-slate-300 hover:text-slate-900 transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              ← Volver
            </button>

            <div className="pt-8 space-y-2 text-center">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                {step === 'create' ? "Nombra tu Nido" : "Introduce el Código"}
              </h2>
              <p className="text-sky-500 text-[10px] font-black uppercase tracking-[0.3em]">
                {step === 'create' ? "Identidad Digital" : "Acceso Directo"}
              </p>
            </div>

            <input 
              autoFocus
              value={step === 'create' ? nestName : joinCode}
              onChange={(e) => step === 'create' ? setNestName(e.target.value) : setJoinCode(e.target.value)}
              placeholder={step === 'create' ? "Ej: Los García..." : "KID-XXXXX"}
              className="w-full h-20 bg-slate-50 rounded-[2rem] px-8 text-2xl font-black text-slate-800 placeholder:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sky-500/5 transition-all text-center"
            />

            <Button 
              onClick={step === 'create' ? handleCreateNest : handleJoinNest}
              disabled={loading || (step === 'create' ? !nestName : !joinCode)}
              className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-slate-800 text-white font-black tracking-widest shadow-xl active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <div className="flex items-center gap-3">
                  {step === 'create' ? "COMENZAR AVENTURA" : "VINCULAR NIDO"}
                  <ArrowRight size={20} />
                </div>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
