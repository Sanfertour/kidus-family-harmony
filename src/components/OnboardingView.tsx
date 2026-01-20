import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

export const OnboardingView = () => {
  const [mode, setMode] = useState<'selection' | 'create' | 'join'>('selection');
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { fetchSession } = useNestStore();
  const { toast } = useToast();

  const handleCreateNest = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    triggerHaptic('medium');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sesión expirada");

      const generatedCode = `KID-${Math.random().toString(36).toUpperCase().substring(2, 7)}`;

      const { data: newNest, error: nestError } = await supabase
        .from('nests')
        .insert([{ name: inputValue.trim(), nest_code: generatedCode }])
        .select()
        .single();

      if (nestError) throw nestError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nest_id: newNest.id, role: 'autonomous' })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      triggerHaptic('success');
      toast({ title: "¡Nido Fundado!", description: `Código: ${generatedCode}` });
      await fetchSession(); 

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinNest = async () => {
    const code = inputValue.trim().toUpperCase();
    if (!code) return;
    setIsLoading(true);
    triggerHaptic('medium');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .select('id, name')
        .eq('nest_code', code)
        .maybeSingle();

      if (!nest) throw new Error("El código KID no existe.");

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nest_id: nest.id, role: 'autonomous' })
        .eq('id', session?.user.id);

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
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-sky-400/5 blur-[120px] rounded-full" />
      
      <AnimatePresence mode="wait">
        {mode === 'selection' ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm space-y-6 relative z-10"
          >
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none mb-4">KidUs</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500">Elite Family Sync</p>
            </div>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('create'); }}
              className="w-full p-10 bg-white border border-white rounded-[4rem] shadow-brisa flex flex-col items-center gap-4 transition-all active:scale-95 group"
            >
              <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg group-hover:bg-sky-500 transition-colors">
                <Plus size={32} />
              </div>
              <div className="text-center">
                <span className="block font-black text-2xl text-slate-800 tracking-tight">Fundar Nido</span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Crea un espacio nuevo</span>
              </div>
            </button>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('join'); }}
              className="w-full p-10 bg-slate-900 rounded-[4rem] shadow-2xl flex flex-col items-center gap-4 transition-all active:scale-95 group"
            >
              <div className="w-16 h-16 bg-white/10 rounded-[1.8rem] flex items-center justify-center text-white shadow-inner">
                <Users size={32} />
              </div>
              <div className="text-center">
                <span className="block font-black text-2xl text-white tracking-tight">Unirse a Nido</span>
                <span className="text-[9px] text-sky-400/60 font-black uppercase tracking-[0.2em] mt-1">Tengo un código KID-ID</span>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm bg-white p-12 rounded-[4rem] shadow-2xl relative z-10 border border-slate-50"
          >
            <button 
              onClick={() => { triggerHaptic('soft'); setMode('selection'); setInputValue(""); }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 flex items-center gap-2 hover:text-slate-600 transition-colors"
            >
              ← Volver
            </button>

            <h3 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tighter">
              {mode === 'create' ? 'Nombre del Nido' : 'Sincronizar Código'}
            </h3>

            <input 
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={mode === 'create' ? "Ej: Casa Kibo" : "KID-XXXXX"}
              className="w-full h-20 bg-slate-50 border-none rounded-[2rem] px-8 font-black text-slate-900 mb-10 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none text-xl placeholder:text-slate-300"
            />

            <button 
              disabled={isLoading || !inputValue}
              onClick={mode === 'create' ? handleCreateNest : handleJoinNest}
              className="w-full h-24 bg-slate-900 text-white rounded-[2.5rem] font-black tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-30"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  {mode === 'create' ? 'CONFIRMAR' : 'CONECTAR'}
                  <Sparkles size={20} className="text-sky-400" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
