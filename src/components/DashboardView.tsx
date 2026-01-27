import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Calendar, ShieldCheck, Baby, ArrowRight, Loader2, Users } from "lucide-react";
import { useNestStore } from "@/store/useNestStore";
import { format, isAfter, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Profile } from "@/types/kidus";

interface DashboardProps {
  onNavigate: (tab: string) => void;
  nestId: string;
  members: Profile[];
}

export const DashboardView = ({ onNavigate, members }: DashboardProps) => {
  const { events, nestCode, profile, loading } = useNestStore();
  
  const guiasCount = members.filter(m => m.role === 'autonomous').length;
  const tribuCount = members.filter(m => m.role === 'dependent').length;

  const nextEvent = events
    .filter(e => isAfter(parseISO(e.start_time), new Date()))
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())[0];

  if (loading && !profile) {
    return (
      <div className="py-20 flex flex-col items-center justify-center opacity-40 animate-pulse">
        <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Nido...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto">
      {/* Header con saludo dinámico - Ahora con cristal suave */}
      <header className="px-2 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 mb-1 italic">KidUs Home</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">
            Hola, {profile?.display_name?.split(' ')[0] || 'Guía'}
          </h2>
        </div>
        <div className="text-right bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 shadow-sm">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-0.5">Código Nido</span>
          <span className="text-[11px] font-black text-slate-900 tracking-widest">{nestCode || 'KID-XXXXX'}</span>
        </div>
      </header>

      {/* Card Principal: Estado de la Familia - Cambiado a bg-white/10 y backdrop-blur-3xl */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 bg-white/10 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 shadow-2xl overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 bg-slate-900/5 w-fit px-4 py-1.5 rounded-full border border-white/10">
            <Users size={12} className="text-slate-900" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Comunidad Nido</span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-10">
            <h3 className="text-8xl font-black text-slate-900 tracking-tighter leading-none italic">
              {members.length}
            </h3>
            <div className="flex flex-col">
               <span className="text-2xl font-black text-slate-900 italic tracking-tighter opacity-30 leading-none">Miembros</span>
               <span className="text-[9px] font-black uppercase tracking-[0.1em] text-sky-500">Sincronía</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contador de Guías - Slate 900 con ligera transparencia para profundidad */}
            <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-[2.5rem] text-white shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <ShieldCheck size={20} className="text-sky-400" />
                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
              </div>
              <p className="text-4xl font-black tracking-tighter italic leading-none mb-1">{guiasCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-50 italic">Guías</p>
            </div>

            {/* Contador de Peques - Cristal blanco más nítido */}
            <div className="bg-white/40 backdrop-blur-md border border-white/40 p-6 rounded-[2.5rem] text-slate-900 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <Baby size={20} className="text-orange-500" />
              </div>
              <p className="text-4xl font-black tracking-tighter italic leading-none mb-1">{tribuCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Peques</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Widget de Próximo Evento - Cambiado de bg-white a bg-white/10 + blur */}
      <motion.button 
        whileTap={{ scale: 0.96 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[3.5rem] text-left relative group shadow-xl transition-all overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:bg-sky-400/40 transition-colors" />
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="w-14 h-14 bg-slate-50/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
            <Calendar size={28} />
          </div>
          <div className="p-3 rounded-full bg-slate-50/50 text-slate-300 group-hover:text-sky-500 transition-colors">
            <ArrowRight size={20} />
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3 italic">Próxima Sincronía</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight italic group-hover:text-sky-600 transition-colors">
          {nextEvent ? `"${nextEvent.title}"` : "Nido en Calma"}
        </h4>
        
        {nextEvent && (
          <div className="flex items-center gap-2 mt-4 bg-sky-50/50 backdrop-blur-sm w-fit px-3 py-1 rounded-full">
            <span className="text-[11px] font-black text-sky-600 uppercase tracking-tighter">
              {format(parseISO(nextEvent.start_time), "EEEE d '•' HH:mm", { locale: es })}
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
};
