import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { Calendar, ShieldCheck, Baby, ArrowRight, Share2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNestStore } from "@/store/useNestStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView = ({ onNavigate }: DashboardProps) => {
  const { toast } = useToast();
  // Extraemos todo del Store. Ya no necesitamos useEffect ni llamadas directas a Supabase aquí.
  const { members, events, nestCode, profile } = useNestStore();
  
  const safeMembers = Array.isArray(members) ? members : [];
  const guiasCount = safeMembers.filter(m => m?.role === 'autonomous').length;
  const tribuCount = safeMembers.filter(m => m?.role === 'dependent').length;

  // Lógica de "Próximo Evento" mejorada para manejar fechas inválidas
  const nextEvent = events
    .filter(e => {
      const eventDate = new Date(e.start_time);
      return eventDate > new Date();
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

  const handleCopyCode = () => {
    if (!nestCode) return;
    navigator.clipboard.writeText(nestCode);
    triggerHaptic('success');
    toast({ 
      title: "Sincronía Copiada", 
      description: "El código KID está en tu portapapeles." 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto">
      {/* SALUDO PERSONALIZADO (Gestión de Perfil) */}
      <header className="px-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 mb-1">Bienvenido al Nido</p>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
          Hola, {profile?.display_name?.split(' ')[0] || 'Guía'}
        </h2>
      </header>

      {/* CARD PRINCIPAL: ESTADO DE LA TRIBU (Gestión de Usuarios) */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 relative overflow-hidden border-none shadow-2xl bg-white/40 rounded-[3.5rem]"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Sincronía Activa</span>
          </div>
          
          <div className="flex items-baseline gap-3 mb-8">
            <h3 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">
              {safeMembers.length}
            </h3>
            <span className="text-xl font-black text-slate-900 italic tracking-tighter">Miembros</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl group active:scale-95 transition-all">
              <ShieldCheck size={18} className="mb-2 text-sky-400" />
              <p className="text-3xl font-black">{guiasCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Guías</p>
            </div>
            <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] text-slate-900 shadow-sm active:scale-95 transition-all">
              <Baby size={18} className="mb-2 text-orange-500" />
              <p className="text-3xl font-black">{tribuCount}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Tribu</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* PRÓXIMA CITA: DINÁMICA (Gestión de Calendario/Eventos) */}
      <motion.button 
        whileTap={{ scale: 0.97 }}
        onClick={() => { triggerHaptic('soft'); onNavigate("agenda"); }}
        className="w-full bg-white border border-slate-50 p-10 rounded-[4rem] text-left relative group shadow-brisa overflow-hidden"
      >
        <div className="flex justify-between items-center mb-10">
          <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500">
            <Calendar size={24} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-sky-500 transition-colors">Ver Agenda</span>
            <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform group-hover:text-sky-500" />
          </div>
        </div>
        
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Próxima Sincronía</p>
        
        <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight italic">
          {nextEvent ? (
            <>
              "{nextEvent.title}"
              <span className="block text-sm font-bold text-sky-500 mt-2 not-italic">
                {format(new Date(nextEvent.start_time), "EEEE d 'a las' HH:mm", { locale: es })}
              </span>
            </>
          ) : (
            <span className="text-slate-300 italic">Paz en el Nido</span>
          )}
        </h4>
      </motion.button>

      {/* INVITACIÓN: COMPARTIR CÓDIGO (Sincronía de Nidos) */}
      <div 
        onClick={handleCopyCode}
        className="flex items-center justify-between p-8 bg-white/60 backdrop-blur-md rounded-[3rem] border border-white cursor-pointer active:scale-95 transition-all shadow-sm group hover:border-sky-200"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Sincronizar Guía</span>
          <span className="text-2xl font-black text-slate-800 tracking-[0.15em] font-mono group-hover:text-sky-600 transition-colors">
            {nestCode || "KID-•••••"}
          </span>
        </div>
        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:bg-sky-500 transition-colors">
          <Share2 size={20} />
        </div>
      </div>
    </div>
  );
};
