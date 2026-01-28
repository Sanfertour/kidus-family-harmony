import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from "@/store/useNestStore";
import { Users, Link2, CheckCircle2, Loader2, X, AlertCircle, Settings2 } from "lucide-react";

export const AddMemberPanel = () => {
  const { updateNestId } = useNestStore();
  const [isLinking, setIsLinking] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleLink = async () => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (cleanCode.length < 5) return;

    setStatus('loading');
    triggerHaptic('soft');

    const finalCode = cleanCode.startsWith('KID-') ? cleanCode : `KID-${cleanCode}`;
    const success = await updateNestId(finalCode);

    if (success) {
      setStatus('success');
      triggerHaptic('success');
      setTimeout(() => {
        setIsLinking(false);
        setStatus('idle');
        setInputCode("");
      }, 2000);
    } else {
      setStatus('error');
      triggerHaptic('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* CAMBIO: "Nueva Tribu" -> "Nuevo Miembro" */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsLinking(true); triggerHaptic('soft'); }}
        className="w-full p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] flex items-center gap-4 shadow-xl group transition-all"
      >
        <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
          <Users size={24} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 mb-0.5 italic">Sincronía</p>
          <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Nuevo Miembro</h3>
        </div>
      </motion.button>

      {/* CAMBIO: "Radar" -> "Ajustes" e Icono Settings2 */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => { triggerHaptic('soft'); }}
        className="w-full p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center gap-4 group transition-all"
      >
        <div className="w-12 h-12 bg-slate-200/50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
          <Settings2 size={24} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5 italic">Configuración</p>
          <h3 className="text-lg font-black text-slate-900 italic tracking-tighter">Ajustes del Nido</h3>
        </div>
      </motion.button>

      <AnimatePresence>
        {isLinking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center px-6 bg-slate-900/10 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white/70 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white shadow-2xl relative"
            >
              <button onClick={() => setIsLinking(false)} className="absolute top-8 right-8 text-slate-400">
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-sky-50/50 backdrop-blur-md rounded-[1.8rem] flex items-center justify-center mx-auto mb-4 border border-white">
                  <Link2 className="text-sky-500" size={28} />
                </div>
                {/* CAMBIO: "Sincronizar Guía" -> "Sincronizar Nido" */}
                <h4 className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">Sincronizar Nido</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3 italic">Código de Vinculación</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="KID-XXXXX"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full bg-white/40 border border-white px-6 py-5 rounded-[2rem] text-center text-xl font-black tracking-widest text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 transition-all shadow-inner"
                />

                <button
                  disabled={status === 'loading' || inputCode.length < 4}
                  onClick={handleLink}
                  className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl
                    ${status === 'error' ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : 
                   status === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : 
                   status === 'error' ? <AlertCircle size={18} /> : "Vincular Ahora"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
