import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Users, Sparkles, Calendar, Share2, ShieldCheck, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  membersCount: number;
  onNavigate: (tab: string) => void;
  nextEvent: string;
  nestId: string | null;
  members?: any[]; // Añadimos la prop members para el conteo inteligente
}

export const DashboardView = ({ membersCount, onNavigate, nextEvent, nestId, members = [] }: DashboardProps) => {
  const { toast } = useToast();
  const [nestCode, setNestCode] = useState<string>("");

  // Lógica de conteo inteligente
  const guiasCount = members.filter(m => m.role === 'adult' || m.role === 'autonomous').length;
  const tribuCount = members.filter(m => m.role === 'child' || m.role === 'dependent').length;

  useEffect(() => {
    if (nestId) fetchNestCode();
  }, [nestId]);

  const fetchNestCode = async () => {
    const { data } = await supabase
      .from('nests')
      .select('nest_code')
      .eq('id', nestId)
      .maybeSingle();
    if (data) setNestCode(data.nest_code);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(nestCode);
    triggerHaptic('success');
    toast({ title: "Código Copiado", description: "Envíalo al otro Guía para sincronizaros." });
  };

  return (
    <div className="space-y-6">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 relative overflow-hidden group"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">Sincronía Activa</span>
          </div>
          
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-6xl font-black text-slate-900 tracking-tighter">
              {membersCount}
            </h3>
            <span className="text-xl font-bold text-slate-400">Integrantes</span>
          </div>

          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 rounded-full border border-sky-100">
              <ShieldCheck size={12} className="text-sky-500" />
              <span className="text-[10px] font-black text-sky-700 uppercase">{guiasCount} {guiasCount === 1 ? 'Guía' : 'Guías'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
              <Baby size={12} className="text-orange-500" />
              <span className="text-[10px] font-black text-orange-700 uppercase">{tribuCount} Tribu</span>
            </div>
          </div>
        </div>
        <Users className="absolute right-[-5%] bottom-[-5%] text-slate-100/50 w-40 h-40 -z-0" />
      </motion.section>

      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-slate-900 p-10 rounded-[3.5rem] text-left shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-8">
          <Calendar className="text-sky-400" size={28} />
          <Sparkles className="text-orange-400 animate-pulse" size={20} />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Siguiente en la agenda</p>
        <h4 className="text-3xl font-black text-white tracking-tighter leading-tight italic">
          "{nextEvent || "Paz en el nido"}"
        </h4>
      </motion.button>

      <div 
        onClick={copyCode}
        className="flex items-center justify-between p-6 bg-white/50 border border-white rounded-[2.5rem] cursor-pointer hover:bg-white transition-all group"
      >
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invitar a Guía</span>
          <span className="text-xl font-black text-slate-800 tracking-[0.1em]">{nestCode || "KID-XXXXX"}</span>
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
          <Share2 size={20} />
        </div>
      </div>
    </div>
  );
};
