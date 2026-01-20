import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, ShieldCheck, Download, Plus, 
  Search, Trash2, ShieldAlert, Loader2, Sparkles, Camera
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

export const VaultView = ({ nestId }: { nestId: string }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // 1. Cargar documentos (Simulado hasta conectar Storage)
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      // Aquí irá la lógica de listado de archivos de Supabase Storage
      setTimeout(() => {
        setDocuments([
          { id: '1', name: "Libro Vacunas.pdf", size: "1.2MB", date: "12 Ene", type: 'pdf' },
          { id: '2', name: "Circular Colegio.png", size: "2.4MB", date: "Hoy", type: 'image' },
        ]);
        setLoading(false);
      }, 800);
    };
    fetchDocs();
  }, [nestId]);

  const handleUpload = () => {
    triggerHaptic('medium');
    // Aquí dispararemos el input file o la cámara
    toast({ title: "Bóveda Inteligente", description: "Preparando escaneo con IA..." });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pb-40 px-4 pt-4"
    >
      {/* HEADER ÉLITE */}
      <header className="flex justify-between items-end mb-10 px-2">
        <div>
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-1">Cifrado Militar</p>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Bóveda</h2>
        </div>
        <button 
          onClick={handleUpload}
          className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all border-4 border-white"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </header>

      {/* BARRA DE BÚSQUEDA BRISA */}
      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          type="text" 
          placeholder="Buscar en el Nido..."
          className="w-full h-16 bg-white/50 backdrop-blur-md border border-white rounded-[2rem] pl-16 pr-6 font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-sky-500/5 transition-all shadow-sm"
        />
      </div>

      {/* LISTA DE DOCUMENTOS */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-sky-500" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Abriendo Bóveda...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-40">
            <ShieldAlert size={48} className="mx-auto text-slate-300" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin documentos protegidos</p>
          </div>
        ) : (
          <AnimatePresence>
            {documents.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-5 rounded-[2.5rem] bg-white border border-white shadow-brisa flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${doc.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-sky-50 text-sky-500'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 tracking-tight text-sm line-clamp-1">{doc.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* IA SCANNER PREVIEW (PROXIMAMENTE) */}
      <div className="mt-10 p-8 rounded-[3.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-sky-400">
            <Sparkles size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">KidUs Inteligencia</span>
          </div>
          <h3 className="text-2xl font-black leading-none tracking-tight text-white">Escáner de Circulares</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Sube una foto del menú del comedor o la próxima excursión y la IA creará los eventos automáticamente en tu Sincro.
          </p>
          <button 
            onClick={() => triggerHaptic('heavy')}
            className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
          >
            <Camera size={16} /> Probar Escáner
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
          <FileText size={160} />
        </div>
      </div>
    </motion.div>
  );
};
