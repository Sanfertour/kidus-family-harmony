import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Calendar, ShieldCheck, Baby, ArrowRight, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNestStore } from "@/store/useNestStore";
import { format, isAfter, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView = ({ onNavigate }: DashboardProps) => {
  const { toast } = useToast();
  // El Store es nuestra "Verdad Única"
  const { members, events, nestCode, profile, loading } = useNestStore();
  
  const guiasCount = members.filter(m => m.role === 'autonomous').length;
  const tribuCount = members.filter(m => m.role === 'dependent').length;

  // Filtro de "Próxima Sincronía" optimizado
  const nextEvent = events
    .filter(e => isAfter(parseISO(e.start_time), new Date()))
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())[0];

  const handleCopyCode = () => {
    if (!nestCode) return;
    navigator.clipboard.writeText(nestCode);
    triggerHaptic('success');
    toast({ 
      title: "Sincronía Copiada", 
      description: "Código KID listo para compartir.",
      duration: 2000 
    });
  };

  if (loading && !profile) {
    return (
      <div className="py-20 flex flex-col items-center justify-center opacity-40">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando Nido...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto">
      {/* HEADER: Saludo Elite */}
      <header className="px-2 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 mb-1">KidUs Home</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">
            Hola, {profile?.display_name?.split(' ')[0] || 'Guía'}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Nido Activo</span>
          <span className="text-xs font-bold text-slate-900">{nestCode}</span>
        </div>
      </header>

      {/* SECCIÓN TRIBU: Glassmorphism Profundo */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 bg-white/40 backdrop-blur-3xl rounded-[4rem] border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600">Sincronía Estable</span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-10">
            <h3 className="text-8xl font-black text-slate-900 tracking-tighter leading-none italic">
              {members.length}
            </h3>
            <span className="text-2xl font-black text-slate-900 italic tracking-tighter opacity-30">Tribu</span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-slate-900 p-6 rounded-[2.8rem] text-white shadow-2xl shadow-slate-300 transition-transform active:scale-95">
              <ShieldCheck size={20} className="mb-3 text-sky-400" />
              <p className="text-3xl font-black tracking-tighter italic">{guiasCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Guías</p>
            </div>
            <div className="bg-white/80 border border-slate-100 p-6 rounded-[2.8rem] text-slate-900 shadow-sm transition-transform active:scale-95">
              <Baby size={20} className="mb-3 text-orange-500" />
              <p className="text-3xl font-black tracking-tighter italic">{tribuCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Peques</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* AGENDA PREVIEW: Botón de Acción */}
      <motion.button 
        whileTap={{ scale: 0.96 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-white border border-white p-10 rounded-[4rem] text-left relative group shadow-xl shadow-slate-100 transition-all hover:border-sky-100"
      >
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 bg-sky-50 rounded-[2rem] flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
            <Calendar size={28} />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-sky-600 transition-colors">Abrir Agenda</span>
            <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-all group-hover:text-sky-500" />
          </div>
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3 italic">Próximo Hito</p>
        
        <div className="space-y-1">
          {nextEvent ? (
            <>
              <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight italic group-hover:text-sky-600 transition-colors">
                "{nextEvent.title}"
              </h4>
              <p className="text-sm font-bold text-sky-500 uppercase tracking-tight">
                {format(parseISO(nextEvent.start_time), "EEEE d '•' HH:mm", { locale: es })}
              </p>
            </>
          ) : (
            <h4 className="text-3xl font-black text-slate-200 tracking-tighter leading-tight italic">
              Nido en Calma
            </h4>
          )}
        </div>
      </motion.button>

      {/* INVITE: KID-CODE */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={handleCopyCode}
        className="flex items-center justify-between p-8 bg-slate-900/5 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200 cursor-pointer group transition-all hover:bg-white hover:border-sky-400 hover:border-solid shadow-sm"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Añadir Guía (Código)</span>
          <span className="text-2xl font-black text-slate-800 tracking-[0.2em] font-mono group-hover:text-sky-600 transition-colors">
            {nestCode || "KID-•••••"}
          </span>
        </div>
        <div className="w-14 h-14 bg-slate-900 rounded-[1.8rem] flex items-center justify-center text-white shadow-xl group-hover:bg-sky-500 group-hover:rotate-12 transition-all">
          <Share2 size={20} />
        </div>
      </motion.div>
    </div>
  );
};
