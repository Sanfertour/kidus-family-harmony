import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from "@/store/useNestStore";
import { Users, Link2, CheckCircle2, Loader2, X, AlertCircle, Baby, LogOut, Trash2, Plus, Palette, Settings2 } from "lucide-react";

export const SettingsView = () => {
  // Extraemos las funciones del store (asegúrate de que fetchTribe esté en tu store)
  const { profile, tribe, updateNestId, addTribeMember, removeTribeMember, signOut, fetchTribe } = useNestStore();
  
  const [activeModal, setActiveModal] = useState<'none' | 'sync' | 'member'>('none');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Estados Formulario Miembro
  const [memberName, setMemberName] = useState("");
  const [memberColor, setMemberColor] = useState("#60A5FA");
  const [inputCode, setInputCode] = useState("");

  const colors = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F472B6", "#94A3B8"];

  // REFUERZO: Cargar miembros al entrar
  useEffect(() => {
    if (profile?.nest_id) {
      fetchTribe(); 
    }
  }, [profile?.nest_id]);

  const handleAddMember = async () => {
    if (!memberName.trim()) return;
    setStatus('loading');
    triggerHaptic('medium');
    
    const success = await addTribeMember({ 
      display_name: memberName, 
      role: 'dependent', 
      color: memberColor 
    });

    if (success) {
      setStatus('success');
      triggerHaptic('success');
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
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="w-full space-y-8 pb-24 px-4">
      {/* CABECERA PERFIL GUÍA */}
      <div className="flex flex-col items-center pt-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
            <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-sky-500 p-2 rounded-2xl border-2 border-white text-white">
            <Settings2 size={14} />
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 italic tracking-tighter">{profile?.display_name || "Guía"}</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 italic">Sincronía Activa</p>
      </div>

      {/* LISTADO DE LA TRIBU EXISTENTE */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 italic">Miembros en este Nido</h3>
        <div className="space-y-3">
          {tribe && tribe.length > 0 ? tribe.map((member) => (
            <motion.div 
              layout
              key={member.id} 
              className="bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-[2.2rem] flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.2rem] shadow-inner border-2 border-white transition-transform hover:scale-105" style={{ backgroundColor: member.color || '#cbd5e1' }} />
                <div>
                  <span className="font-black text-slate-800 italic tracking-tight block leading-none">{member.display_name}</span>
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest italic">Miembro Tribu</span>
                </div>
              </div>
              <button 
                onClick={() => { removeTribeMember(member.id); triggerHaptic('warning'); }}
                className="p-3 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          )) : (
            <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
               <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest italic">El Nido está vacío</p>
            </div>
          )}
        </div>
      </div>

      {/* BOTONES DE ACCIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 gap-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setActiveModal('member'); triggerHaptic('soft'); }}
          className="w-full p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.8rem] flex items-center gap-4 shadow-xl"
        >
          <div className="w-14 h-14 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-600">
            <Plus size={28} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 italic">Tribu</p>
            <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Añadir Miembro</h3>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setActiveModal('sync'); triggerHaptic('soft'); }}
          className="w-full p-6 bg-sky-500/10 border border-sky-500/20 rounded-[2.8rem] flex items-center gap-4 shadow-xl"
        >
          <div className="w-14 h-14 bg-sky-500/20 rounded-3xl flex items-center justify-center text-sky-600">
            <Link2 size={28} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 italic">Sincronía</p>
            <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Sincronizar Nido</h3>
          </div>
        </motion.button>
      </div>

      <button onClick={signOut} className="w-full py-6 text-[10px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2 italic">
        <LogOut size={16} /> Cerrar Sesión Segura
      </button>

      {/* MODAL DINÁMICO */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center px-6 bg-slate-900/30 backdrop-blur-md">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-sm bg-white/90 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white shadow-2xl relative">
              <button onClick={() => { setActiveModal('none'); setStatus('idle'); }} className="absolute top-8 right-8 text-slate-400"><X size={20} /></button>
              
              <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter text-center mb-8">
                {activeModal === 'sync' ? 'Vincular Nido' : 'Nuevo Miembro'}
              </h4>

              {activeModal === 'sync' ? (
                <div className="space-y-5">
                  <input type="text" placeholder="KID-XXXXX" value={inputCode} onChange={(e) => setInputCode(e.target.value.toUpperCase())} className="w-full bg-white/50 border-2 border-white px-6 py-5 rounded-[2rem] text-center text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 shadow-inner" />
                  <button onClick={handleSyncNest} disabled={status === 'loading'} className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-2xl transition-transform active:scale-95">
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : "Activar Sincronía"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 italic">Nombre del Miembro</label>
                    <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} className="w-full bg-white/50 border-2 border-white px-6 py-4 rounded-[1.8rem] font-black text-slate-900 focus:outline-none shadow-inner" placeholder="Ej: Lucas" />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2 italic">
                      <Palette size={12} /> Color de la Tribu
                    </label>
                    <div className="flex flex-wrap justify-center gap-3 px-2">
                      {colors.map(c => (
                        <button key={c} onClick={() => { setMemberColor(c); triggerHaptic('soft'); }} className={`w-9 h-9 rounded-2xl transition-all ${memberColor === c ? 'scale-125 ring-4 ring-white shadow-lg' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>

                  <button onClick={handleAddMember} disabled={status === 'loading' || !memberName} className="w-full py-5 rounded-[2rem] bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95">
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
