import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, ArrowRight, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

export const OnboardingView = () => {
  const [mode, setMode] = useState<'selection' | 'create' | 'join'>('selection');
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { fetchSession } = useNestStore();
  const { toast } = useToast();

  // --- FUNCIÓN: FUNDAR NIDO (CREATE) ---
  const handleCreateNest = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    triggerHaptic('medium');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      // Generar código estilo KidUs: KID-XXXXX
      const generatedCode = `KID-${Math.random().toString(36).toUpperCase().substring(2, 7)}`;

      // 1. Insertar en la tabla 'nests' (usando share_code como definiste)
      const { data: newNest, error: nestError } = await supabase
        .from('nests')
        .insert([{ 
          name: inputValue.trim(), 
          share_code: generatedCode 
        }])
        .select()
        .single();

      if (nestError) throw nestError;

      // 2. Vincular el perfil del Guía al nuevo nido
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nest_id: newNest.id, role: 'autonomous' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      triggerHaptic('success');
      toast({ title: "¡Nido Fundado!", description: `Tu código es ${generatedCode}` });
      await fetchSession(); // Salto automático al Dashboard

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCIÓN: UNIRSE A NIDO (JOIN) ---
  const handleJoinNest = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    triggerHaptic('medium');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Buscar el nido por el share_code
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .select('id, name')
        .eq('share_code', inputValue.trim().toUpperCase())
        .maybeSingle();

      if (!nest) throw new Error("Código de Nido no encontrado");

      // 2. Vincular usuario al nido encontrado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nest_id: nest.id, role: 'autonomous' })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      triggerHaptic('success');
      toast({ title: "Sincronía completada", description: `Te has unido a: ${nest.name}` });
      await fetchSession();

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-20%] w-[100%] h-[50%] bg-sky-400/10 blur-[120px] rounded-full animate-wave-slow" />
      
      <AnimatePresence mode="wait">
        {mode === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm space-y-6 relative z-10"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Tu Nido</h2>
              <p className="text-slate-500 font-medium">Comienza la sincronía familiar</p>
            </div>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('create'); }}
              className="w-full p-8 bg-white/70 backdrop-blur-2xl border border-white rounded-[3rem] shadow-brisa flex flex-col items-center gap-4 transition-all active:scale-95 group hover:bg-white"
            >
              <div className="w-16 h-16 bg-sky-500 rounded-[1.8rem] flex items-center justify-center text-white shadow-haptic group-hover:scale-110 transition-transform">
                <Plus size={32} strokeWidth={3} />
              </div>
              <div className="text-center">
                <span className="block font-black text-xl text-slate-800">Fundar Nido</span>
                <span className="text-sm text-slate-400 font-medium">Crear un espacio nuevo</span>
              </div>
            </button>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('join'); }}
              className="w-full p-8 bg-white/70 backdrop-blur-2xl border border-white rounded-[3rem] shadow-brisa flex flex-col items-center gap-4 transition-all active:scale-95 group hover:bg-white"
            >
              <div className="w-16 h-16 bg-orange-500 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <div className="text-center">
                <span className="block font-black text-xl text-slate-800">Unirse a Nido</span>
                <span className="text-sm text-slate-400 font-medium">Tengo un código KID-XXXXX</span>
              </div>
            </button>
          </motion.div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm bg-white/80 backdrop-blur-3xl border border-white p-10 rounded-[3.5rem] shadow-brisa relative z-10"
          >
            <button 
              onClick={() => setMode('selection')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 block"
            >
              ← Volver
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-6">
              {mode === 'create' ? 'Nombre del Nido' : 'Introduce el Código'}
            </h3>

            <input 
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={mode === 'create' ? "Ej: Casa García" : "KID-XXXXX"}
              className="w-full h-16 bg-slate-100/50 border-none rounded-2xl px-6 font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 mb-8 transition-all"
            />

            <button 
              disabled={isLoading || !inputValue}
              onClick={mode === 'create' ? handleCreateNest : handleJoinNest}
              className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? 'SINCRONIZANDO...' : (
                <>
                  {mode === 'create' ? 'CONFIRMAR' : 'UNIRSE'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
