import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from "@/store/useNestStore";
import { Users, Link2, CheckCircle2, Loader2, X, AlertCircle, Settings2, Baby, LogOut } from "lucide-react";

export const SettingsView = () => {
  const { profile, updateNestId, signOut } = useNestStore();
  const [activeModal, setActiveModal] = useState<'none' | 'sync' | 'member'>('none');
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // FUNCIÓN 1: Sincronizar Nido (Unir dos cuentas Guía)
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

  return (
    <div className="w-full space-y-8 pb-24">
      {/* CABECERA PERFIL */}
      <div className="flex flex-col items-center pt-4">
        <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
          <img src={profile?.avatar_url || "https://ui-avatars.com/api/?name=Guia"} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-900 italic tracking-tighter">{profile?.display_name || "Guía"}</h2>
      </div>

      <div className="space-y-4 px-2">
        {/* BOTÓN A: AÑADIR MIEMBRO (Para la Tribu/Peques) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setActiveModal('member'); triggerHaptic('soft'); }}
          className="w-full p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center gap-4 shadow-xl group"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600">
            <Baby size={24} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-0.5 italic">Gestión de Tribu</p>
            <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Nuevo Miembro</h3>
          </div>
        </motion.button>

        {/* BOTÓN B: SINCRONIZAR NIDO (Vincular con otro Guía) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setActiveModal('sync'); triggerHaptic('soft'); }}
          className="w-full p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center gap-4 shadow-xl group"
        >
          <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-600">
            <Link2 size={24} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 mb-0.5 italic">Conexión Global</p>
            <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Sincronizar Nido</h3>
          </div>
        </motion.button>

        {/* BOTÓN C: AJUSTES */}
        <motion.button className="w-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200/50 rounded-2xl flex items-center justify-center text-slate-600"><Settings2 size={24} /></div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5 italic">Configuración</p>
            <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Ajustes Generales</h3>
          </div>
        </motion.button>
      </div>

      {/* MODALES INDEPENDIENTES */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] flex items-center justify-center px-6 bg-slate-900/10 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="w-full max-w-sm bg-white/70 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white shadow-2xl relative">
              <button onClick={() => setActiveModal('none')} className="absolute top-8 right-8 text-slate-400"><X size={20} /></button>
              
              <div className="text-center mb-8">
                <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter">
                  {activeModal === 'sync' ? 'Sincronizar Nido' : 'Nuevo Miembro'}
                </h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3 italic">
                  {activeModal === 'sync' ? 'Introduce código KID-XXXXX' : 'Añadir peques a la Tribu'}
                </p>
              </div>

              {activeModal === 'sync' ? (
                <div className="space-y-4">
                  <input type="text" placeholder="KID-XXXXX" value={inputCode} onChange={(e) => setInputCode(e.target.value.toUpperCase())} className="w-full bg-white/40 border border-white px-6 py-5 rounded-[2rem] text-center text-xl font-black text-slate-900 focus:outline-none" />
                  <button onClick={handleSyncNest} disabled={status === 'loading'} className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">
                    {status === 'loading' ? <Loader2 className="animate-spin" /> : "Vincular Nido"}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  {/* Aquí iría el formulario de añadir peques que ya tienes */}
                  <p className="text-slate-500 font-medium">Formulario de registro de Tribu...</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
