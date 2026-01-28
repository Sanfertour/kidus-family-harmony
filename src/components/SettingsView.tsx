import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from "@/store/useNestStore";
import { 
  Users, Link2, CheckCircle2, Loader2, X, 
  Settings2, Plus, LogOut, Heart 
} from "lucide-react";

export const SettingsView = () => {
  // Extraemos solo lo que el Store tiene definido para garantizar estabilidad
  const { 
    profile, 
    members, 
    nestCode,
    updateNestId, 
    signOut, 
    fetchEvents 
  } = useNestStore();
  
  const [activeModal, setActiveModal] = useState<'none' | 'sync'>('none');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inputCode, setInputCode] = useState("");

  // Sincronía inicial de datos
  useEffect(() => {
    if (profile?.nest_id && typeof fetchEvents === 'function') {
      fetchEvents(); 
    }
  }, [profile?.nest_id]);

  const handleSyncNest = async () => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (cleanCode.length < 5) return;
    
    setStatus('loading');
    triggerHaptic('medium');
    
    const success = await updateNestId(cleanCode.startsWith('KID-') ? cleanCode : `KID-${cleanCode}`);
    
    if (success) {
      setStatus('success');
      triggerHaptic('success');
      setTimeout(() => { 
        setActiveModal('none'); 
        setStatus('idle'); 
        setInputCode(""); 
      }, 2000);
    } else {
      setStatus('error');
      triggerHaptic('warning');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col items-center w-full max-w-md mx-auto space-y-12 pb-32 px-6 pt-10"
    >
      {/* CABECERA: Enfoque Brisa centrado */}
      <header className="flex flex-col items-center text-center space-y-5">
        <div className="relative">
          <div className="w-32 h-32 rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl ring-offset-4 ring-2 ring-sky-100">
            <img 
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.display_name || 'Guia'}&background=0ea5e9&color=fff`} 
              alt="Perfil" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-slate-900 p-3 rounded-2xl border-4 border-white text-white shadow-xl">
            <Settings2 size={18} />
          </div>
        </div>
        
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter leading-none">
            {profile?.display_name || "Guía"}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-500 italic">
            Nido: {nestCode || 'Pendiente'}
          </p>
        </div>
      </header>

      {/* LISTADO DE LA TRIBU: Cards balanceadas */}
      <div className="w-full space-y-5">
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-slate-100" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Miembros del Nido</h3>
          <div className="h-px w-8 bg-slate-100" />
        </div>
        
        <div className="flex flex-col gap-4">
          {members && members.length > 0 ? members.map((member: any) => (
            <motion.div 
              key={member.id} 
              whileHover={{ y: -2 }}
              className="bg-white/70 backdrop-blur-2xl border border-white p-6 rounded-[2.8rem] flex items-center justify-between shadow-xl shadow-slate-200/40"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center font-black text-sky-600 border border-sky-100 shadow-inner text-xl italic">
                  {member.display_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 italic tracking-tight text-base">{member.display_name}</h4>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-none mt-1">
                    {member.role === 'autonomous' ? 'Guía Senior' : 'Tribu'}
                  </p>
                </div>
              </div>
              <Heart size={16} className="text-sky-100 fill-sky-100" />
            </motion.div>
          )) : (
            <div className="py-12 border-2 border-dashed border-slate-100 rounded-[3rem] text-center">
               <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] italic">Esperando Sincronía</p>
            </div>
          )}
        </div>
      </div>

      {/* ACCIÓN PRINCIPAL: Botón con Glassmorphism oscuro */}
      <div className="w-full">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setActiveModal('sync'); triggerHaptic('soft'); }}
          className="w-full p-8 bg-slate-900 rounded-[3.5rem] flex items-center justify-between shadow-2xl shadow-slate-900/20 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Link2 size={80} className="text-white" />
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
              <Link2 size={28} strokeWidth={3} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 italic mb-1">Red Nidus</p>
              <h3 className="text-xl font-black text-white italic tracking-tighter">Vincular Nido</h3>
            </div>
          </div>
        </motion.button>
      </div>

      {/* SALIDA SEGURA */}
      <button 
        onClick={signOut} 
        className="text-[10px] font-black uppercase text-slate-300 hover:text-red-400 transition-all flex items-center gap-3 italic tracking-[0.5em] group"
      >
        <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> 
        Cerrar Sesión Segura
      </button>

      {/* MODAL DE SINCRONIZACIÓN: Estilo Brisa Puro */}
      <AnimatePresence>
        {activeModal === 'sync' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setActiveModal('none')} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 30 }} 
              className="relative w-full max-w-sm bg-white rounded-[4rem] p-12 border border-white shadow-3xl flex flex-col items-center"
            >
              <button onClick={() => setActiveModal('none')} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                <X size={28} />
              </button>
              
              <div className="w-20 h-20 bg-sky-50 rounded-[2.2rem] flex items-center justify-center mb-8 text-sky-500 border border-sky-100 shadow-inner">
                <Link2 size={40} />
              </div>

              <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter text-center mb-8">
                Unirse a un Nido
              </h4>

              <div className="w-full space-y-8">
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase text-slate-400 text-center tracking-[0.2em] italic">Identificador KID-XXXXX</p>
                  <input 
                    type="text" 
                    placeholder="KID-XXXXX" 
                    value={inputCode} 
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())} 
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-sky-500/20 px-6 py-6 rounded-[2.5rem] text-center text-3xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-200 shadow-inner" 
                  />
                </div>
                
                <button 
                  onClick={handleSyncNest} 
                  disabled={status === 'loading'} 
                  className="w-full h-20 rounded-[2.5rem] bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-slate-900/20"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" /> : status === 'success' ? <CheckCircle2 className="text-emerald-400" /> : "Sincronizar Ahora"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
