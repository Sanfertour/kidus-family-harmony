import { motion } from "framer-motion";
import { Calendar, Users, Zap, Bell } from "lucide-react";

interface DashboardProps {
  membersCount: number;
  onNavigate: (tab: string) => void;
}

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    type === 'soft' ? navigator.vibrate(10) : navigator.vibrate([20, 30, 20]);
  }
};

export const DashboardView = ({ membersCount, onNavigate }: DashboardProps) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buen día" : hour < 20 ? "Energía alta" : "Nido en calma";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="space-y-8"
    >
      {/* HEADER DINÁMICO */}
      <div className="px-2">
        <h1 className="text-5xl font-black text-slate-800 leading-[1.1] tracking-tighter font-nunito">
          {greeting}, <br/> <span className="text-[#0EA5E9]">Guía.</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Estado del Nido</p>
      </div>

      {/* CARD DE ESTADO (GLASS) */}
      <div className="p-10 rounded-[3.5rem] bg-white/60 backdrop-blur-2xl border border-white/40 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
        <div className="relative z-10">
          <label className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.2em] mb-4 block">Sincronía Actual</label>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black text-slate-800">{membersCount}</h3>
            <span className="text-xl font-bold text-slate-400">integrantes</span>
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-tight mt-2">La tribu fluye en total armonía.</p>
        </div>
        <Zap className="absolute -right-4 -bottom-4 text-[#0EA5E9]/5 w-32 h-32 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-2 gap-5">
        <button 
          onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }} 
          className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 bg-[#0EA5E9] text-white shadow-2xl active:scale-95 transition-all group"
        >
          <Calendar size={32} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Agenda</span>
        </button>
        
        <button 
          onClick={() => { triggerHaptic('soft'); onNavigate("family"); }} 
          className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 bg-white/60 backdrop-blur-xl text-[#F97316] border border-white/40 shadow-xl active:scale-95 transition-all group"
        >
          <Users size={32} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Tribu</span>
        </button>
      </div>

      {/* PRÓXIMO HIT DE LA TRIBU */}
      <div className="mx-2 p-6 rounded-[2.5rem] bg-slate-800 text-white/90 flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
          <Bell size={20} className="text-[#0EA5E9]" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Próximo objetivo</p>
          <p className="text-sm font-bold">Logística de la tribu sincronizada</p>
        </div>
      </div>
    </motion.div>
  );
};
