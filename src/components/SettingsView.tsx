import { useNestStore } from "@/store/useNestStore";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  LogOut, Shield, Bell, Users, 
  ChevronRight, Share2, Sparkles,
  Heart, Crown, UserMinus
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const SettingsView = () => {
  const { profile, nestCode, signOut, members, fetchSession } = useNestStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    triggerHaptic('medium');
    await signOut();
    toast({
      title: "Sincronía Finalizada",
      description: "Has salido del nido de forma segura.",
    });
  };

  const copyNestCode = () => {
    if (nestCode) {
      navigator.clipboard.writeText(nestCode);
      triggerHaptic('success');
      toast({
        title: "Código Copiado",
        description: "Comparte este código para sumar Guías al Nido.",
      });
    }
  };

  const removeMember = async (id: string, name: string) => {
    triggerHaptic('warning');
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      toast({ title: "Miembro eliminado", description: `${name} ya no está en el nido.` });
      await fetchSession();
    }
  };

  const isGuiaPrincipal = profile?.role === 'autonomous';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 pb-32 space-y-8 max-w-md mx-auto"
    >
      <header className="px-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-sky-500" />
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Configuración</p>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Ajustes</h2>
      </header>

      {/* TARJETA DE PERFIL BRISA */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-[3.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-xl">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div 
                className="w-20 h-20 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl transition-colors"
                style={{ backgroundColor: profile?.color || '#0f172a' }}
              >
                <span className="font-black text-3xl italic">{profile?.display_name?.charAt(0) || 'G'}</span>
              </div>
              {isGuiaPrincipal && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-white">
                  <Crown size={14} strokeWidth={3} />
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-black text-2xl text-slate-900 tracking-tighter italic">{profile?.display_name || 'Guía'}</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-sky-100">
                  {profile?.role === 'autonomous' ? 'Guía Élite' : 'Tribu'}
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {members.length} Miembros
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={copyNestCode}
            className="w-full bg-slate-900 rounded-[2rem] p-6 flex justify-between items-center group active:scale-[0.97] transition-all shadow-xl shadow-slate-200"
          >
            <div className="text-left">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 block">Sincronizador KID</span>
              <span className="font-mono font-bold text-white text-xl tracking-[0.2em]">{nestCode || 'KID-XXXXX'}</span>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-sky-500 transition-colors">
              <Share2 size={20} />
            </div>
          </button>
        </div>
      </div>

      {/* LISTA DE MIEMBROS (GESTIÓN DIRECTA) */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 italic">Miembros del Nido</h4>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-white/40 rounded-[2rem] border border-white/60">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs"
                  style={{ backgroundColor: member.color || '#94a3b8' }}
                >
                  {member.display_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700 italic">{member.display_name}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{member.role === 'autonomous' ? 'Guía' : 'Tribu'}</p>
                </div>
              </div>
              {member.id !== profile?.id && (
                <button 
                  onClick={() => removeMember(member.id, member.display_name || '')}
                  className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <UserMinus size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MENÚ DE OPCIONES ADICIONALES */}
      <div className="space-y-3">
        {[
          { icon: Bell, label: 'Notificaciones Inteligentes', color: 'text-sky-500', bg: 'bg-sky-50' },
          { icon: Shield, label: 'Seguridad del Nido', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { icon: Heart, label: 'Preferencias Familiares', color: 'text-pink-500', bg: 'bg-pink-50' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => {
              triggerHaptic('soft');
              toast({ title: "Próximamente", description: "Estamos puliendo esta sección para tu Nido." });
            }}
            className="w-full flex items-center justify-between p-6 bg-white/50 hover:bg-white transition-all rounded-[2.2rem] border border-white/60 group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
                <item.icon size={22} />
              </div>
              <span className="font-black text-slate-700 tracking-tight italic uppercase text-xs">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      <div className="pt-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-8 bg-red-50 text-red-500 font-black uppercase tracking-[0.3em] text-[10px] rounded-[2.5rem] hover:bg-red-500 hover:text-white transition-all duration-500 border border-red-100 group shadow-lg shadow-red-100/20"
        >
          <LogOut size={18} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          Cerrar Sincronía
        </button>
      </div>
    </motion.div>
  );
};
