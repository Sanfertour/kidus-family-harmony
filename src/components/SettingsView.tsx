import { useNestStore } from "@/store/useNestStore";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { LogOut, Shield, Bell, Users, ChevronRight, Share2, Sparkles, Heart, Crown, UserMinus, Pencil, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { useNavigate } from "react-router-dom";

export const SettingsView = () => {
  const { profile, nestCode, signOut, members, fetchMembers } = useNestStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    triggerHaptic('medium');
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: "No se pudo cerrar la sesión.", variant: "destructive" });
    } else {
      // Limpiamos el store manualmente para asegurar el reset total
      useNestStore.setState({ profile: null, nestId: null, initialized: true });
      toast({ title: "Sincronía Finalizada", description: "Cierre de sesión exitoso." });
      navigate("/", { replace: true });
    }
  };

  const copyNestCode = () => {
    if (nestCode) {
      navigator.clipboard.writeText(nestCode);
      triggerHaptic('success');
      toast({ title: "Código Copiado", description: "Sincroniza otro Guía con este código." });
    }
  };

  const removeMember = async (id: string, name: string) => {
    triggerHaptic('warning');
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      toast({ title: "Miembro fuera", description: `${name} ya no está en el nido.` });
      await fetchMembers();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 pb-32 space-y-8 max-w-md mx-auto">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-sky-500" />
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Configuración</p>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">Radar</h2>
      </header>

      {/* ACCIÓN PRINCIPAL: GESTIÓN DE NIDO */}
      <AddMemberDialog onMemberAdded={async () => await fetchMembers()}>
        <button onClick={() => triggerHaptic('medium')} className="w-full bg-slate-900 rounded-[2.5rem] p-8 flex items-center justify-between group active:scale-[0.98] transition-all shadow-2xl">
          <div className="text-left">
            <h4 className="text-white font-black italic text-xl uppercase tracking-tighter">Gestionar Nido</h4>
            <p className="text-sky-400 text-[9px] font-bold uppercase tracking-widest mt-1">Configurar Miembros</p>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white group-hover:bg-sky-500 transition-all">
            <UserPlus size={24} />
          </div>
        </button>
      </AddMemberDialog>

      {/* TARJETA DE PERFIL CON FOTO DE GOOGLE */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-8 border border-white shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name} 
                className="w-16 h-16 rounded-3xl object-cover border-2 border-white shadow-lg"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-3xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                style={{ backgroundColor: profile?.color || '#0f172a' }}
              >
                {profile?.display_name?.charAt(0)}
              </div>
            )}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white shadow-md text-white">
              <Crown size={10} strokeWidth={3} />
            </div>
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 tracking-tighter italic">{profile?.display_name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guía Registrado</p>
          </div>
        </div>
        
        <button onClick={copyNestCode} className="w-full bg-slate-50 rounded-[2rem] p-6 flex justify-between items-center active:scale-95 transition-all">
          <div className="text-left">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Código KID (Sincronía)</span>
            <span className="font-mono font-bold text-slate-900 text-lg tracking-[0.2em]">{nestCode || 'KID-XXXXX'}</span>
          </div>
          <Share2 size={18} className="text-sky-500" />
        </button>
      </div>

      {/* LISTA DE TRIBU */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 italic">Sincronía Actual</h4>
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-white/40 rounded-[2rem] border border-white/60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm" style={{ backgroundColor: member.color || '#94a3b8' }}>
                  {member.display_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700 italic">{member.display_name}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                    {member.role === 'autonomous' ? 'Guía' : 'Tribu'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <AddMemberDialog editingMember={member}>
                  <button onClick={() => triggerHaptic('soft')} className="p-3 text-slate-300 hover:text-sky-500 transition-colors">
                    <Pencil size={18} />
                  </button>
                </AddMemberDialog>
                {member.id !== profile?.id && (
                  <button onClick={() => removeMember(member.id, member.display_name || '')} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleLogout} className="w-full p-8 bg-red-50 text-red-500 font-black uppercase tracking-[0.3em] text-[10px] rounded-[2.5rem] border border-red-100 active:scale-95 transition-all hover:bg-red-500 hover:text-white duration-300">
        Cerrar Sincronía
      </button>
    </motion.div>
  );
};
