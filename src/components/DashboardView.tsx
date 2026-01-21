import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Calendar, ShieldCheck, Baby, ArrowRight, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNestStore } from "@/store/useNestStore";
import { format, isAfter, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Profile } from "@/types/kidus";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  nestId: string;
  members: Profile[];
}

export const DashboardView = ({ onNavigate, nestId, members }: DashboardProps) => {
  const { toast } = useToast();
  const { events, nestCode, profile, loading } = useNestStore();
  
  const guiasCount = members.filter(m => m.role === 'autonomous').length;
  const tribuCount = members.filter(m => m.role === 'dependent').length;

  const nextEvent = events
    .filter(e => isAfter(parseISO(e.start_time), new Date()))
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())[0];

  const handleCopyCode = () => {
    if (!nestCode) return;
    navigator.clipboard.writeText(nestCode);
    triggerHaptic('success');
    toast({ title: "Sincronía Copiada", description: "Código KID listo para compartir." });
  };

  if (loading && !profile) {
    return (
      <div className="py-20 flex flex-col items-center justify-center opacity-40">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Nido...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto">
      <header className="px-2 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 mb-1">KidUs Home</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">
            Hola, {profile?.display_name?.split(' ')[0] || 'Guía'}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Nido Activo</span>
          <span className="text-xs font-bold text-slate-900">{nestCode || '---'}</span>
        </div>
      </header>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-white/60 shadow-xl overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Sincronía Estable</span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-10">
            <h3 className="text-8xl font-black text-slate-900 tracking-tighter leading-none italic">{members.length}</h3>
            <span className="text-2xl font-black text-slate-900 italic tracking-tighter opacity-30">Tribu</span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-slate-900 p-6 rounded-[2.8rem] text-white shadow-2xl active:scale-95 transition-transform">
              <ShieldCheck size={20} className="mb-3 text-sky-400" />
              <p className="text-3xl font-black tracking-tighter italic">{guiasCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Guías</p>
            </div>
            <div className="bg-white/80 border border-slate-100 p-6 rounded-[2.8rem] text-slate-900 shadow-sm active:scale-95 transition-transform">
              <Baby size={20} className="mb-3 text-orange-500" />
              <p className="text-3xl font-black tracking-tighter italic">{tribuCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Peques</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.button 
        whileTap={{ scale: 0.96 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-white border border-white p-10 rounded-[4rem] text-left relative group shadow-xl transition-all"
      >
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 bg-sky-50 rounded-[2rem] flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
            <Calendar size={28} />
          </div>
          <ArrowRight size={20} className="text-slate-300 group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 italic">Próximo Hito</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight italic">
          {nextEvent ? `"${nextEvent.title}"` : "Nido en Calma"}
        </h4>
        {nextEvent && (
          <p className="text-sm font-bold text-sky-500 uppercase mt-2">
            {format(parseISO(nextEvent.start_time), "EEEE d '•' HH:mm", { locale: es })}
          </p>
        )}
      </motion.button>
    </div>
  );
};
