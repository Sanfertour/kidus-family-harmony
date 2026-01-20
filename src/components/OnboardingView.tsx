import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, ArrowRight, Loader2 } from "lucide-react";
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No hay sesión activa");

      // Generar código estilo KidUs: KID-XXXXX (Verdad Única)
      const generatedCode = `KID-${Math.random().toString(36).toUpperCase().substring(2, 7)}`;

      // 1. Insertar en la tabla 'nests' (Usando nest_code para coincidir con el Backend)
      const { data: newNest, error: nestError } = await supabase
        .from('nests')
        .insert([{ 
          name: inputValue.trim(), 
          nest_code: generatedCode 
        }])
        .select()
        .single();

      if (nestError) throw nestError;

      // 2. Vincular el perfil del Guía al nuevo nido (nest_id)
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
        title: "¡Nido Fundado!", 
        description: `Código de sincronía: ${generatedCode}`,
      });

      // Forzar actualización del Store para saltar al Dashboard
      await fetchSession(); 

    } catch (error: any) {
      console.error("Error fundando nido:", error);
      toast({ title: "Error de Backend", description: error.message, variant: "destructive" });
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sesión no válida");
      
      // 1. Buscar el nido por el nest_code
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .select('id, name')
        .eq('nest_code', inputValue.trim().toUpperCase())
        .maybeSingle();

      if (!nest) throw new Error("El código KID no existe. Verifica con el otro Guía.");

      // 2. Vincular usuario al nido encontrado
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nest_id: nest.id, 
          role: 'autonomous' 
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      triggerHaptic('success');
      toast({ title: "Sincronía completada", description: `Te has unido a: ${nest.name}` });
      
      await fetchSession();

    } catch (error: any) {
      toast({ title: "Error al unirse", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decor Estética Brisa */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-sky-400/10 blur-[100px] rounded-full animate-pulse" />
      
      <AnimatePresence mode="wait">
        {mode === 'selection' && (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm space-y-6 relative z-10"
          >
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">KidUs</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Co-paternidad de Élite</p>
            </div>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('create'); }}
              className="w-full p-8 bg-white/70 backdrop-blur-2xl border border-white rounded-[3.5rem] shadow-xl flex flex-col items-center gap-4 transition-all active:scale-95 group"
            >
              <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-lg group-hover:bg-sky-500 transition-colors">
                <Plus size={32} strokeWidth={3} />
              </div>
              <div className="text-center">
                <span className="block font-black text-xl text-slate-800 tracking-tight">Fundar Nido</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Nuevo espacio familiar</span>
              </div>
            </button>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('join'); }}
              className="w-full p-8 bg-white/70 backdrop-blur-2xl border border-white rounded-[3.5rem] shadow-xl flex flex-col items-center gap-4 transition-all active:scale-95 group"
            >
              <div className="w-16 h-16 bg-white border-2 border-slate-100 rounded-[1.8rem] flex items-center justify-center text-slate-400 shadow-sm group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                <Users size={32} />
              </div>
              <div className="text-center">
                <span className="block font-black text-xl text-slate-800 tracking-tight">Unirse a Nido</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Tengo un código KID-XXXXX</span>
              </div>
            </button>
          </motion.div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm bg-white/90 backdrop-blur-3xl border border-white p-10 rounded-[3.5rem] shadow-2xl relative z-10"
          >
            <button 
              onClick={() => { triggerHaptic('soft'); setMode('selection'); setInputValue(""); }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-2 hover:text-slate-600 transition-colors"
            >
              ← Volver
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              {mode === 'create' ? 'Nombre del Nido' : 'Sincronizar Código'}
            </h3>
            <p className="text-xs text-slate-400 mb-8 font-medium">
              {mode === 'create' ? 'Identifica tu espacio familiar (Ej: Casa Madrid)' : 'Introduce el código KID proporcionado por el otro Guía'}
            </p>

            <input 
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={mode === 'create' ? "Ej: Casa García" : "KID-XXXXX"}
              className="w-full h-16 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white mb-8 transition-all placeholder:text-slate-300"
            />

            <button 
              disabled={isLoading || !inputValue}
              onClick={mode === 'create' ? handleCreateNest : handleJoinNest}
              className={`w-full h-20 rounded-[2.5rem] font-black tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all ${
                mode === 'create' ? 'bg-slate-900 text-white' : 'bg-orange-500 text-white'
              } disabled:opacity-30`}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  {mode === 'create' ? 'FUNDAR' : 'CONECTAR'}
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
