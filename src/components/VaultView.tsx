import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, Search, 
  Loader2, Sparkles, Camera, Utensils, 
  Heart, ShieldCheck, AlertCircle, Trash2, 
  CloudLightning
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

export const VaultView = ({ nestId }: { nestId: string }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { profile, fetchEvents } = useNestStore();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      // Aquí podrías integrar la llamada real a storage.from('vault').list()
      setTimeout(() => {
        setDocuments([
          { id: '1', name: "Cartilla Salud Peques.pdf", size: "1.2MB", date: "12 Ene", category: 'Salud' },
          { id: '2', name: "Menú Escolar Febrero.png", size: "2.4MB", date: "Hoy", category: 'Alimentación' },
          { id: '3', name: "Circular Excursión Granja.pdf", size: "0.8MB", date: "Ayer", category: 'Escuela' },
        ]);
        setLoading(false);
      }, 600);
    };
    fetchDocs();
  }, [nestId]);

  const handleVisionScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !nestId) return;

    setIsProcessing(true);
    triggerHaptic('medium');
    
    toast({ 
      title: "Activando Nest-Vision", 
      description: "Sincronizando el documento con la agenda de la Tribu...",
    });

    try {
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || "");
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('process-image-ai', {
        body: { image: base64Image, nest_id: nestId, user_id: profile?.id }
      });

      if (error) throw error;

      if (data?.events) {
        await fetchEvents();
        triggerHaptic('success');
        toast({ 
          title: "¡Sincronía completada!", 
          description: "La IA ha organizado los nuevos planes en vuestro nido.",
        });
      }
    } catch (err: any) {
      toast({ 
        title: "Error de Lectura", 
        description: "No he podido procesar la imagen. Revisa la luz.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = "";
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="space-y-8 pb-32"
    >
      <header className="px-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-sky-500/10 rounded-xl flex items-center justify-center">
            <Heart size={16} className="text-sky-600 fill-sky-600" />
          </div>
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.4em]">Memoria del Nido</p>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Documentos</h2>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la memoria..."
          className="w-full h-18 bg-white/60 backdrop-blur-xl border border-white rounded-[2.2rem] pl-16 pr-6 font-bold text-slate-600 shadow-sm focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 opacity-40">
            <Loader2 className="animate-spin text-sky-500" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando archivos...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-6 rounded-[3rem] bg-white/80 backdrop-blur-md border border-white shadow-xl shadow-slate-200/40 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 shadow-inner">
                    {doc.category === 'Alimentación' ? <Utensils size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight text-base italic leading-tight">{doc.name}</h3>
                    <div className="flex gap-2 items-center mt-1">
                       <span className="text-[9px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{doc.category}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{doc.date}</span>
                    </div>
                  </div>
                </div>
                <button className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-sky-50 hover:text-sky-600 transition-all">
                  <Download size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="p-10 rounded-[4rem] bg-slate-900 text-white relative overflow-hidden shadow-3xl shadow-slate-300 group mt-10"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-700">
          <Sparkles size={160} className="text-sky-400" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/40">
                <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-400">KidUs AI Engine</span>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-4xl font-black leading-[0.9] tracking-tighter italic">Libera tu <br/> mente.</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[240px]">
              Sube una circular o menú escolar. Mi IA lo leerá por ti y organizará vuestra agenda en segundos.
            </p>
          </div>

          <input 
            type="file" accept="image/*" id="vision-upload-vault" 
            className="hidden" onChange={handleVisionScan} disabled={isProcessing}
          />
          
          <label 
            htmlFor="vision-upload-vault"
            className={`w-full h-20 bg-white text-slate-900 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer shadow-2xl ${isProcessing ? 'opacity-50' : 'hover:bg-sky-50'}`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Camera size={24} strokeWidth={2.5} />
                Sincronizar con IA
              </>
            )}
          </label>
        </div>
      </motion.div>

      <footer className="py-10 flex flex-col items-center gap-3 opacity-20">
        <CloudLightning size={20} />
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-center leading-loose">
          Privacidad Blindada <br/> KidUs protege la Sincronía de tu Tribu
        </p>
      </footer>
    </motion.div>
  );
};
