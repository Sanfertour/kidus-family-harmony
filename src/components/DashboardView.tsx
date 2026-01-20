import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; 
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Sparkles, Calendar, ShieldCheck, Baby, LayoutGrid, ArrowRight } from "lucide-react";
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

  // --- BLINDAJE ANTI-CRASH ---
  // Nos aseguramos de que safeMembers sea SIEMPRE un array, incluso si llega null
  const safeMembers = Array.isArray(members) ? members : [];

  // Lógica de conteo basada en los roles definidos en la base de datos
  const guiasCount = safeMembers.filter(m => m?.role === 'autonomous').length;
  const tribuCount = safeMembers.filter(m => m?.role === 'dependent').length;

  useEffect(() => {
    const fetchNestCode = async () => {
      if (!nestId) return;
      try {
        const { data } = await supabase
          .from('nests')
          .select('nest_code')
          .eq('id', nestId)
          .maybeSingle();
        if (data) setNestCode(data.nest_code);
      } catch (error) {
        console.error("Error al obtener el código del nido:", error);
      }
    };
    fetchNestCode();
  }, [nestId]);

  const copyCode = () => {
    if (!nestCode) return;
    navigator.clipboard.writeText(nestCode);
    triggerHaptic('success');
    toast({ title: "Sincronía Copiada", description: "Envía el código a otro Guía." });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* CARD PRINCIPAL: ESTADO DE LA TRIBU */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[4rem] relative overflow-hidden shadow-brisa border border-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-100">
                <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Sincronía Total</span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-8">
            <h3 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">
              {safeMembers.length}
            </h3>
            <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight italic">Tribu</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Miembros</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contador Guías */}
            <div className="bg-sky-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-sky-100 relative overflow-hidden group">
              <ShieldCheck size={40} className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform" />
              <p className="text-3xl font-black leading-none mb-1">{guiasCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Guías</p>
            </div>
            
            {/* Contador Tribu */}
            <div className="bg-orange-500 p-6 rounded-[2.5rem] text-white shadow-xl shadow-orange-100 relative overflow-hidden group">
              <Baby size={40} className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform" />
              <p className="text-3xl font-black leading-none mb-1">{tribuCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Pequeños</p>
            </div>
          </div>
        </div>
        <LayoutGrid className="absolute right-[-10%] top-[-10%] text-slate-50 w-64 h-64 -z-0 opacity-50" />
      </motion.section>

      {/* CARD ACCIÓN: PRÓXIMO EVENTO */}
      <motion.button 
        whileTap={{ scale: 0.97 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-slate-900 p-10 rounded-[4rem] text-left shadow-2xl relative overflow-hidden group transition-all"
      >
        <div className="flex justify-between items-start mb-12">
          <div className="p-4 bg-white/10 rounded-[2rem] backdrop-blur-md">
            <Calendar className="text-sky-400" size={24} />
          </div>
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
            <ArrowRight size={20} />
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Próxima Sincronía</p>
        <h4 className="text-4xl font-black text-white tracking-tighter leading-tight italic max-w-[90%]">
          {nextEvent ? `"${nextEvent}"` : "Paz en el Nido"}
        </h4>
      </motion.button>

      {/* CÓDIGO DE INVITACIÓN RÁPIDO */}
      <div 
        onClick={copyCode}
        className="flex items-center justify-between p-7 bg-white/80 backdrop-blur-sm border border-white rounded-[3rem] cursor-pointer hover:bg-white transition-all shadow-sm group"
      >
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Invitar Guía</span>
          <span className="text-2xl font-black text-slate-800 tracking-[0.1em] font-mono group-hover:text-sky-500 transition-colors">
            {nestCode || "KID-•••••"}
          </span>
        </div>
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-inner">
          <Share2 size={22} />
        </div>
      </div>
    </div>
  );
};
