import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Sparkles, Calendar, ShieldCheck, Baby, ArrowRight, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  membersCount: number;
  onNavigate: (tab: string) => void;
  nextEvent: string;
  nestId: string | null;
  members?: any[]; 
}

export const DashboardView = ({ onNavigate, nextEvent, nestId, members = [] }: DashboardProps) => {
  const { toast } = useToast();
  const [nestCode, setNestCode] = useState<string>("");
  const safeMembers = Array.isArray(members) ? members : [];
  const guiasCount = safeMembers.filter(m => m?.role === 'autonomous').length;
  const tribuCount = safeMembers.filter(m => m?.role === 'dependent').length;

  useEffect(() => {
    if (nestId) {
      const fetchCode = async () => {
        const { data } = await supabase.from('nests').select('nest_code').eq('id', nestId).maybeSingle();
        if (data) setNestCode(data.nest_code);
      };
      fetchCode();
    }
  }, [nestId]);

  return (
    <div className="space-y-6">
      {/* CARD PRINCIPAL CRISTALIZADA */}
      <motion.section className="glass-panel p-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-brisa text-emerald-600">Sincronía Nidal</span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-8">
            <h3 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">{safeMembers.length}</h3>
            <span className="text-xl font-black text-slate-900 italic">Tribu</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-500/90 backdrop-blur-xl p-6 rounded-[2.5rem] text-white shadow-lg">
              <ShieldCheck size={20} className="mb-2 opacity-50" />
              <p className="text-3xl font-black">{guiasCount}</p>
              <p className="text-brisa text-[8px] opacity-80">Guías</p>
            </div>
            <div className="bg-orange-500/90 backdrop-blur-xl p-6 rounded-[2.5rem] text-white shadow-lg">
              <Baby size={20} className="mb-2 opacity-50" />
              <p className="text-3xl font-black">{tribuCount}</p>
              <p className="text-brisa text-[8px] opacity-80">Peques</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* PRÓXIMA CITA */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-slate-900/95 backdrop-blur-2xl p-10 rounded-[4rem] text-left relative group overflow-hidden"
      >
        <div className="flex justify-between items-center mb-10">
          <Calendar className="text-sky-400" size={24} />
          <ArrowRight className="text-slate-500 group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-brisa text-slate-500 mb-2">Próxima Sincronía</p>
        <h4 className="text-3xl font-black text-white tracking-tighter leading-tight italic">
          {nextEvent ? `"${nextEvent}"` : "Paz en el Nido"}
        </h4>
      </motion.button>

      {/* INVITACIÓN */}
      <div 
        onClick={() => {
          navigator.clipboard.writeText(nestCode);
          triggerHaptic('success');
          toast({ title: "Código Copiado", description: "Envía el KID-ID a otro Guía." });
        }}
        className="flex items-center justify-between p-7 glass-panel cursor-pointer active:scale-95 transition-all"
      >
        <div className="flex flex-col">
          <span className="text-brisa text-slate-400 mb-1">Invitar Guía</span>
          <span className="text-2xl font-black text-slate-800 tracking-widest font-mono">
            {nestCode || "KID-•••••"}
          </span>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-sky-500 shadow-inner">
          <Share2 size={20} />
        </div>
      </div>
    </div>
  );
};
