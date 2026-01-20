import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Users, Sparkles, Calendar, Share2, ShieldCheck, Baby, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  membersCount: number;
  onNavigate: (tab: string) => void;
  nextEvent: string;
  nestId: string | null;
  members?: any[]; 
}

export const DashboardView = ({ membersCount, onNavigate, nextEvent, nestId, members = [] }: DashboardProps) => {
  const { toast } = useToast();
  const [nestCode, setNestCode] = useState<string>("");

  // Lógica de conteo basada en la Verdad Única (props)
  const guiasCount = members.filter(m => m.role === 'autonomous').length;
  const tribuCount = members.filter(m => m.role === 'dependent').length;

  useEffect(() => {
    const fetchNestCode = async () => {
      if (!nestId) return;
      const { data } = await supabase.from('nests').select('nest_code').eq('id', nestId).maybeSingle();
      if (data) setNestCode(data.nest_code);
    };
    fetchNestCode();
  }, [nestId]);

  return (
    <div className="space-y-6 pb-20">
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[4rem] relative overflow-hidden shadow-brisa border border-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-emerald-500 rounded-lg animate-pulse">
                <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Sincronía Total</span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-6">
            <h3 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">
              {members.length}
            </h3>
            <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight italic">Tribu</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrada</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-500 p-5 rounded-[2.5rem] text-white shadow-lg shadow-sky-100">
              <ShieldCheck size={20} className="mb-2 opacity-80" />
              <p className="text-2xl font-black leading-none">{guiasCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Guías</p>
            </div>
            <div className="bg-orange-500 p-5 rounded-[2.5rem] text-white shadow-lg shadow-orange-100">
              <Baby size={20} className="mb-2 opacity-80" />
              <p className="text-2xl font-black leading-none">{tribuCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Tribu</p>
            </div>
          </div>
        </div>
        <LayoutGrid className="absolute right-[-10%] top-[-10%] text-slate-50 w-64 h-64 -z-0" />
      </motion.section>

      <motion.button 
        whileTap={{ scale: 0.97 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-slate-900 p-10 rounded-[3.5rem] text-left shadow-2xl relative overflow-hidden group"
      >
        <div className="flex justify-between items-start mb-12">
          <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md">
            <Calendar className="text-sky-400" size={24} />
          </div>
          <ArrowRight className="text-slate-700 group-hover:text-white group-hover:translate-x-2 transition-all" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Próximo hito</p>
        <h4 className="text-4xl font-black text-white tracking-tighter leading-tight italic max-w-[80%]">
          "{nextEvent || "Paz en el Nido"}"
        </h4>
      </motion.button>
    </div>
  );
};
