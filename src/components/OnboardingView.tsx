import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

/**
 * KidUs - OnboardingView
 * Estética Brisa: Glassmorphism profundo y bordes ultra-redondeados.
 * Flujo: Selección -> (Crear Nido / Unirse a Nido) -> Sincronía.
 */
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
      if (!session?.user) throw new Error("Sesión expirada. Por favor, reidentifícate.");

      // 1. Creación del Nido (El nest_code se genera automáticamente en PostgreSQL)
      const { data: newNest, error: nestError } = await supabase
        .from('nests')
        .insert([{ name: inputValue.trim() }])
        .select()
        .single();

      if (nestError) throw nestError;

      // 2. Vinculación del Guía al Nido con rol 'autonomous'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nest_id: newNest.id, 
          role: 'autonomous' 
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      triggerHaptic('success');
      toast({ 
        title: "¡Nido Fundado! 🌿", 
        description: `Bienvenido a ${newNest.name}. Código: ${newNest.nest_code}` 
      });
      
      // Sincronización final y entrada al Dashboard
      await fetchSession(); 

    } catch (error: any) {
      console.error("Error al fundar nido:", error.message);
      toast({ 
        title: "Error", 
        description: error.message || "No se pudo fundar el nido.", 
        variant: "destructive" 
      });
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
      if (!session?.user) throw new Error("Sesión expirada.");

      // 1. Búsqueda del nido existente mediante el código KID-XXXXX
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .select('id, name')
        .eq('nest_code', code)
        .maybeSingle();

      if (nestError) throw nestError;
      if (!nest) throw new Error("El código KID no existe o es incorrecto.");

      // 2. Vinculación del perfil al nido encontrado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nest_id: nest.id, 
          role: 'autonomous' 
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      triggerHaptic('success');
      toast({ 
        title: "Sincronía completada", 
        description: `Te has unido al Nido: ${nest.name}` 
      });

      await fetchSession();

    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden">
      {/* Elementos decorativos de fondo (Efecto Brisa) */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-sky-400/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[30%] bg-indigo-400/5 blur-[100px] rounded-full" />
      
      <AnimatePresence mode="wait">
        {mode === 'selection' ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm space-y-6 relative z-10"
          >
            <div className="text-center mb-12">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none mb-4">KidUs</h2>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500">Elite Family Sync</p>
            </div>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('create'); }}
              className="w-full p-10 bg-white border border-white rounded-[4rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center gap-4 transition-all active:scale-95 group"
            >
              <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg group-hover:bg-sky-500 transition-colors">
                <Plus size={32} />
              </div>
              <div className="text-center">
                <span className="block font-black text-2xl text-slate-800 tracking-tight">Fundar Nido</span>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic">Crea un espacio nuevo</span>
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
                <span className="text-[9px] text-sky-400/60 font-black uppercase tracking-[0.2em] mt-1 italic">Tengo un código KID-ID</span>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm bg-white p-12 rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.08)] relative z-10 border border-slate-50"
          >
            <button 
              onClick={() => { triggerHaptic('soft'); setMode('selection'); setInputValue(""); }}
              className="group text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-10 flex items-center gap-2 hover:text-slate-900 transition-all"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver
            </button>

            <h3 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tighter leading-tight whitespace-pre-line">
              {mode === 'create' ? 'Nombre de tu\nNido' : 'Sincronizar\nCódigo KID'}
            </h3>

            <input 
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(mode === 'join' ? e.target.value.toUpperCase() : e.target.value)}
              placeholder={mode === 'create' ? "Ej: Casa Kibo" : "KID-XXXXX"}
              className="w-full h-20 bg-slate-50 border-none rounded-[2rem] px-8 font-black text-slate-900 mb-10 focus:ring-4 focus:ring-sky-500/10 transition-all outline-none text-xl placeholder:text-slate-200"
            />

            <button 
              disabled={isLoading || !inputValue}
              onClick={mode === 'create' ? handleCreateNest : handleJoinNest}
              className="w-full h-24 bg-slate-900 text-white rounded-[2.5rem] font-black tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
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
