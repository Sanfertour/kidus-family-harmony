import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Plus, Users, Sparkles, copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  membersCount: number;
  onNavigate: (tab: string) => void;
  nextEvent: string;
  nestId: string | null;
}

export const DashboardView = ({ membersCount, onNavigate, nextEvent, nestId }: DashboardProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Función para generar el código KID-XXXXX
  const createNest = async () => {
    setIsCreating(true);
    triggerHaptic('medium');
    
    const randomCode = `KID-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Crear el Nido
      const { data: nest, error: nestError } = await supabase
        .from('nests')
        .insert([{ nest_code: randomCode, name: `Nido de ${user.email?.split('@')[0]}` }])
        .select()
        .single();

      if (nestError) throw nestError;

      // 2. Vincular al Guía con este Nido
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ nest_id: nest.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({ title: "Nido Creado", description: `Tu código es ${randomCode}. ¡Sincronía activada!` });
      window.location.reload(); // Recargamos para que Index pille el nuevo nest_id
      
    } catch (error) {
      toast({ title: "Error", description: "No se pudo crear el nido.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  if (!nestId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-12 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-10 bg-white/60 backdrop-blur-3xl rounded-[4rem] border border-white shadow-brisa max-w-sm"
        >
          <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl">
            <Plus size={40} strokeWidth={3} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Bienvenido, Guía</h2>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
            Tu nido aún no está sincronizado. Crea uno nuevo para empezar a gestionar tu tribu.
          </p>
          <button
            onClick={createNest}
            disabled={isCreating}
            className="w-full py-6 bg-slate-900 text-white rounded-[2.2rem] font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all shadow-2xl disabled:opacity-50"
          >
            {isCreating ? "Sincronizando..." : "Crear mi Nido"}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* CARD PRINCIPAL: ESTADO DEL NIDO */}
      <section className="bg-white/70 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white shadow-brisa relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Sincronía Activa</span>
          </div>
          <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Tu Tribu</h3>
          <p className="text-slate-400 font-medium">{membersCount} integrantes conectados</p>
        </div>
        <Users className="absolute right-[-20px] bottom-[-20px] text-slate-50 w-40 h-40 -z-0" />
      </section>

      {/* CARD: PRÓXIMO EVENTO */}
      <button 
        onClick={() => onNavigate("agenda")}
        className="w-full bg-slate-900 p-10 rounded-[3.5rem] text-left shadow-2xl shadow-slate-200 group active:scale-[0.98] transition-all"
      >
        <div className="flex justify-between items-start mb-10">
          <div className="p-4 bg-white/10 rounded-2xl text-white">
            <Sparkles size={24} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Próximo en Sincro</span>
        </div>
        <h4 className="text-3xl font-black text-white tracking-tighter leading-tight">
          {nextEvent || "No hay eventos hoy"}
        </h4>
      </button>
    </div>
  );
};
