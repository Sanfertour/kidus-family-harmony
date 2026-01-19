import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Plus, Users, Sparkles, LogIn, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  membersCount: number;
  onNavigate: (tab: string) => void;
  nextEvent: string;
  nestId: string | null;
}

export const DashboardView = ({ membersCount, onNavigate, nextEvent, nestId }: DashboardProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [view, setView] = useState<'selection' | 'join'>('selection');
  const [joinCode, setJoinCode] = useState("");

  // --- ACCIÓN: CREAR NIDO NUEVO ---
  const createNest = async () => {
    setIsProcessing(true);
    triggerHaptic('medium');
    const randomCode = `KID-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .insert([{ nest_code: randomCode, name: `Nido de ${user.email?.split('@')[0]}` }])
        .select().single();

      if (nestError) throw nestError;

      await supabase.from('profiles').update({ nest_id: nest.id }).eq('id', user.id);
      
      toast({ title: "Nido Fundado", description: `Código: ${randomCode}` });
      window.location.reload();
    } catch (error) {
      toast({ title: "Error", description: "Fallo al crear nido", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  // --- ACCIÓN: UNIRSE A NIDO EXISTENTE ---
  const joinNest = async () => {
    if (joinCode.length < 5) return;
    setIsProcessing(true);
    triggerHaptic('medium');

    try {
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .select('id')
        .eq('nest_code', joinCode.toUpperCase().trim())
        .maybeSingle();

      if (!nest) {
        toast({ title: "Código inválido", description: "No encontramos ese Nido.", variant: "destructive" });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ nest_id: nest.id }).eq('id', user.id);

      toast({ title: "Sincronía Éxito", description: "Te has unido a la tribu." });
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally { setIsProcessing(false); }
  };

  // --- VISTA: SIN NIDO (Onboarding) ---
  if (!nestId) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div 
              key="selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm space-y-6"
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-sky-100">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Tu Espacio KidUs</h2>
                <p className="text-slate-400 text-sm mt-2">¿Cómo quieres empezar hoy?</p>
              </div>

              <button onClick={createNest} disabled={isProcessing}
                className="w-full p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left hover:border-sky-200 transition-all group shadow-sm active:scale-95"
              >
                <Plus className="text-sky-500 mb-4 group-hover:scale-110 transition-transform" size={28} />
                <p className="font-black text-slate-900 text-lg tracking-tight">Crear un Nido nuevo</p>
                <p className="text-xs text-slate-400">Genera un código para invitar a otros.</p>
              </button>

              <button onClick={() => { triggerHaptic('soft'); setView('join'); }}
                className="w-full p-8 bg-slate-900 rounded-[2.5rem] text-left hover:bg-slate-800 transition-all group shadow-xl active:scale-95"
              >
                <LogIn className="text-sky-400 mb-4 group-hover:translate-x-1 transition-transform" size={28} />
                <p className="font-black text-white text-lg tracking-tight">Unirse a un Nido</p>
                <p className="text-xs text-slate-400">Usa un código KID-XXXXX existente.</p>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="join" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-sm bg-white p-10 rounded-[3.5rem] shadow-brisa border border-white"
            >
              <button onClick={() => setView('selection')} className="mb-6 text-slate-400 hover:text-slate-900 transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Unirse a Tribu</h2>
              <p className="text-xs text-slate-400 mb-8 font-medium">Introduce el código único de tu nido.</p>
              
              <input 
                type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="KID-XXXXX"
                className="w-full h-20 bg-slate-50 rounded-[1.8rem] border-none text-center text-2xl font-black tracking-[0.2em] text-slate-900 placeholder:text-slate-200 focus:ring-2 focus:ring-sky-500/20 mb-6 uppercase"
              />

              <button onClick={joinNest} disabled={isProcessing || joinCode.length < 5}
                className="w-full py-6 bg-sky-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-sky-200 active:scale-95 disabled:opacity-30 transition-all"
              >
                {isProcessing ? "Validando..." : "Sincronizar"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- VISTA: DASHBOARD ACTIVO (Se mantiene igual de elegante) ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="bg-white/70 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white shadow-brisa relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-sky-500">Sincronía Tribu</span>
          </div>
          <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{membersCount} Guías</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">En este Nido</p>
        </div>
        <Users className="absolute right-[-10%] bottom-[-10%] text-slate-50/50 w-48 h-48 -z-0 group-hover:scale-110 transition-transform duration-1000" />
      </section>

      <button onClick={() => onNavigate("agenda")}
        className="w-full bg-slate-900 p-10 rounded-[3.5rem] text-left shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all relative overflow-hidden"
      >
        <Sparkles className="text-sky-400 mb-8" size={28} />
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Próximo Evento</p>
        <h4 className="text-3xl font-black text-white tracking-tighter leading-tight">
          {nextEvent || "Paz en el nido"}
        </h4>
      </button>
    </div>
  );
};
