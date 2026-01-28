import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from "@/store/useNestStore";
import { Users, Link2, CheckCircle2, Loader2, X, AlertCircle, Settings2, Baby, LogOut, Trash2, Edit2, Plus } from "lucide-react";

export const SettingsView = () => {
  const { profile, tribe, updateNestId, addTribeMember, removeTribeMember, signOut } = useNestStore();
  const [activeModal, setActiveModal] = useState<'none' | 'sync' | 'member'>('none');
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Estados para el formulario de Nuevo Miembro (Restaurados)
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<'dependent' | 'autonomous'>('dependent');
  const [memberColor, setMemberColor] = useState("#000000");

  const colors = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F472B6"];

  const handleSyncNest = async () => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (cleanCode.length < 5) return;
    setStatus('loading');
    triggerHaptic('soft');
    const success = await updateNestId(cleanCode.startsWith('KID-') ? cleanCode : `KID-${cleanCode}`);
    if (success) {
      setStatus('success');
      triggerHaptic('success');
      setTimeout(() => { setActiveModal('none'); setStatus('idle'); setInputCode(""); }, 2000);
    } else {
      setStatus('error'); triggerHaptic('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleAddMember = async () => {
    if (!memberName.trim()) return;
    setStatus('loading');
    triggerHaptic('medium');
    const success = await addTribeMember({ name: memberName, role: memberRole, color: memberColor });
    if (success) {
      setStatus('success');
      setTimeout(() => { 
        setActiveModal('none'); 
        setStatus('idle'); 
        setMemberName(""); 
      }, 1500);
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="w-full space-y-8 pb-24 px-4">
      {/* CABECERA PERFIL */}
      <div className="flex flex-col items-center pt-4">
        <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
          <img src={profile?.avatar_url || "https://ui-avatars.com/api/?name=Guia"} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 italic tracking-tighter">{profile?.display_name || "Guía"}</h2>
      </div>

      {/* GESTIÓN DE LA TRIBU (Perfiles existentes - RESTAURADO) */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 italic">Miembros de la Tribu</p>
        <div className="grid grid-cols-1 gap-3">
          {tribe?.map((member) => (
            <div key={member.id} className="bg-white/20 backdrop-blur-xl border border-white/30 p-4 rounded-[2rem] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm" style={{ backgroundColor: member.color || '#cbd5e1' }} />
                <div>
                  <h4 className="font-black text-slate-900 italic tracking-tight">{member.display_name}</h4>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{member.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => triggerHaptic('soft')} className="p-2 text-slate-400 hover:text-sky-500 transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => { removeTribeMember(member.id); triggerHaptic('warning'); }} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN PRINCIPAL */}
      <div className="space-y-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setActiveModal('member'); triggerHaptic('soft'); }}
          className="w-full p-6 bg-emerald-500/10 backdrop-blur-2xl border border-emerald-500/20 rounded-[2.5rem] flex items-center gap-4 shadow-xl group"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all"><Plus size={24} /></div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-0.5 italic">Gestión de Tribu</p>
            <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Añadir Nuevo Miembro</h3>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setActiveModal('sync'); triggerHaptic('soft'); }}
          className="w-full p-6 bg-sky-500/10 backdrop-blur-2xl border border-sky-500/20 rounded-[2.5rem] flex items-center gap-4 shadow-xl group"
        >
          <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-all"><Link2 size={24} /></div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 mb-0.5 italic">Conexión Global</p>
            <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Sincronizar Nido</h3>
          </div>
        </motion.button>
      </div>

      {/* BOTÓN CERRAR SESIÓN */}
      <button onClick={() => { signOut(); triggerHaptic('medium'); }} className="w-full p-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-400/60 hover:text-red-500 transition-colors flex items-center justify-center gap-2 italic">
        <LogOut size={14} /> Cerrar Sesión
      </button>

      {/* MODAL UNIFICADO (Contenido Dinámico Restaurado) */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center px-6 bg-slate-900/20 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-white/80 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white shadow-2xl relative">
              <button onClick={() => setActiveModal('none')} className="absolute top-8 right-8 text-slate-400"><X size={20} /></button>
              
              <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter text-center mb-6">
                {activeModal === 'sync' ? 'Sincronizar Nido' : 'Nueva Tribu'}
              </h4>

              {activeModal === 'sync' ? (
                <div className="space-y-4">
                  <input type="text" placeholder="KID-XXXXX" value={inputCode} onChange={(e) => setInputCode(e.target.value.toUpperCase())} className="w-full bg-white/40 border border-white px-6 py-5 rounded-[2rem] text-center text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 shadow-inner" />
                  <button onClick={handleSyncNest} disabled={status === 'loading'} className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2">
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : "Vincular Nido"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre del Miembro</label>
                    <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Ej: Lucas" className="w-full bg-white/40 border border-white px-6 py-4 rounded-[1.8rem] font-black text-slate-900 focus:outline-none" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Identidad Visual</label>
                    <div className="flex justify-between px-2">
                      {colors.map(c => (
                        <button key={c} onClick={() => { setMemberColor(c); triggerHaptic('soft'); }} className={`w-8 h-8 rounded-xl transition-all ${memberColor === c ? 'scale-125 ring-2 ring-slate-400 ring-offset-2' : ''}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <button onClick={handleAddMember} disabled={status === 'loading' || !memberName} className="w-full py-5 rounded-[2rem] bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2 transition-all">
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : status === 'success' ? <CheckCircle2 /> : "Añadir a la Tribu"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
