import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, Search, 
  Loader2, Sparkles, Camera, Utensils, 
  Heart, CloudLightning, X, Check, Calendar, Info, Users, Trash2 
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
  
  const [aiResult, setAiResult] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { profile, fetchEvents, members } = useNestStore();
  const { toast } = useToast();

  const fetchDocs = async () => {
    if (!nestId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from('vault').list(nestId);
      if (error) throw error;

      const formattedDocs = data.map(file => ({
        id: file.id,
        name: file.name,
        size: (file.metadata.size / 1024 / 1024).toFixed(1) + "MB",
        date: new Date(file.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        category: file.name.toLowerCase().includes('menu') ? 'Alimentación' : 'Documento'
      }));
      setDocuments(formattedDocs);
    } catch (err) {
      console.error("Error fetching docs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [nestId]);

  const handleDeleteDoc = async (fileName: string) => {
    if (!confirm("¿Eliminar este documento del Nido?")) return;
    try {
      triggerHaptic('medium');
      const { error } = await supabase.storage
        .from('vault')
        .remove([`${nestId}/${fileName}`]);

      if (error) throw error;
      toast({ title: "Documento eliminado", description: "El nido se ha actualizado." });
      fetchDocs();
    } catch (err) {
      toast({ title: "Error al borrar", variant: "destructive" });
    }
  };

  const handleVisionScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !nestId) return;

    setIsProcessing(true);
    triggerHaptic('medium');
    
    toast({ 
      title: "Activando Nest-Vision", 
      description: "Analizando documento con IA...",
    });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${nestId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error: aiError } = await supabase.functions.invoke('process-image-ai', {
        body: { image: base64Image, nest_id: nestId }
      });

      if (aiError) throw aiError;

      if (data) {
        setAiResult({ 
          title: data.title || "Nuevo Evento Detectado",
          start_time: data.start_time || new Date().toISOString(),
          category: data.category || "activity",
          description: data.description || "",
          assigned_to: profile?.id 
        });
        setShowConfirm(true);
        triggerHaptic('success');
        fetchDocs();
      }
    } catch (err: any) {
      console.error("Scan Error:", err);
      toast({ 
        title: "Error de Sincronía", 
        description: "La IA no ha podido procesar este archivo.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
      if (e.target) e.target.value = "";
    }
  };

  const saveAiEvent = async () => {
    try {
      setIsProcessing(true);
      triggerHaptic('medium');
      const { error } = await supabase.from('events').insert([{
        ...aiResult,
        nest_id: nestId,
        created_by: profile?.id
      }]);

      if (error) throw error;

      await fetchEvents();
      setShowConfirm(false);
      setAiResult(null);
      triggerHaptic('success');
      toast({ title: "¡Evento Sincronizado!", description: "Se ha añadido a la agenda del Nido." });
    } catch (err) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col items-center w-full max-w-lg mx-auto px-6 space-y-10 pb-32 pt-8"
    >
      {/* HEADER: Centrado y Minimalista */}
      <header className="flex flex-col items-center text-center space-y-3">
        <div className="w-14 h-14 bg-sky-500/10 rounded-[1.8rem] flex items-center justify-center border border-white shadow-sm ring-4 ring-sky-500/5">
          <Heart size={24} className="text-sky-600 fill-sky-600" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.5em] italic">Sincronía del Nido</p>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Documentos</h2>
        </div>
      </header>

      {/* SEARCH: Glassmorphism Puro */}
      <div className="relative w-full group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors z-10">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar en la memoria..."
          className="w-full h-18 bg-white/40 backdrop-blur-2xl border border-white rounded-[2.2rem] pl-16 pr-6 font-bold text-slate-600 shadow-xl shadow-slate-200/40 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-center"
        />
      </div>

      {/* LISTADO: Centrado con cards Brisa */}
      <div className="w-full space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 opacity-40">
            <Loader2 className="animate-spin text-sky-500" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Consultando Nido...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white shadow-lg shadow-slate-200/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-inner shrink-0 border border-slate-50 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
                    {doc.category === 'Alimentación' ? <Utensils size={22} /> : <FileText size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-900 tracking-tight text-sm italic leading-tight truncate">{doc.name}</h3>
                    <div className="flex gap-2 items-center mt-1">
                       <span className="text-[8px] font-black text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full uppercase border border-sky-100">{doc.category}</span>
                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{doc.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-3">
                  <button 
                    onClick={() => handleDeleteDoc(doc.name)}
                    className="w-10 h-10 bg-red-50/50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-50 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all border border-slate-100 shadow-sm flex-shrink-0">
                    <Download size={16} />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center py-16 opacity-30">
                 <FileText size={40} className="text-slate-300 mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin documentos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEST-VISION: Hero Card Centrada */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full p-12 rounded-[3.5rem] bg-slate-900 text-white relative overflow-hidden shadow-3xl shadow-slate-300 group flex flex-col items-center text-center"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-1000 pointer-events-none">
          <Sparkles size={160} className="text-sky-400" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="w-16 h-16 bg-sky-500 rounded-[1.6rem] flex items-center justify-center shadow-2xl shadow-sky-500/40 border border-sky-400/20">
              <Sparkles size={30} className="text-white" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-4xl font-black leading-[0.9] tracking-tighter italic">Nest-Vision.</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[220px] italic">
              Deja que la IA analice tus circulares y las sincronice al instante.
            </p>
          </div>

          <input 
            type="file" accept="image/*" id="vision-upload-brisa" 
            className="hidden" onChange={handleVisionScan} disabled={isProcessing}
          />
          
          <label 
            htmlFor="vision-upload-brisa"
            className={`w-full px-10 h-20 bg-white text-slate-900 rounded-[2.2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all cursor-pointer shadow-2xl ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:bg-sky-50'}`}
          >
            {isProcessing ? <Loader2 className="animate-spin text-sky-500" size={24} /> : <><Camera size={24} className="text-sky-500" strokeWidth={2.5} /> Escanear Ahora</>}
          </label>
        </div>
      </motion.div>

      {/* FOOTER: Minimalista */}
      <footer className="pt-8 flex flex-col items-center gap-3 opacity-20">
        <CloudLightning size={20} className="text-slate-900" />
        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-center text-slate-900">
          KidUs Memoria <br/> Grado Élite
        </p>
      </footer>

      {/* MODAL IA: Centrado Estilo Glassmorphism */}
      <AnimatePresence>
        {showConfirm && aiResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[3.5rem] shadow-2xl overflow-hidden p-10 border border-white flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-8">
                <div className="p-4 bg-sky-50 rounded-2xl text-sky-600 flex items-center gap-3 border border-sky-100">
                  <Sparkles size={24} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">Análisis IA</span>
                </div>
                <button onClick={() => setShowConfirm(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-8 w-full flex flex-col items-center text-center">
                <div className="space-y-2 w-full">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Título Detectado</p>
                  <input value={aiResult.title} onChange={(e) => setAiResult({...aiResult, title: e.target.value})} className="text-2xl font-black text-slate-900 w-full bg-slate-50/50 p-5 rounded-[1.8rem] outline-none text-center italic border-2 border-transparent focus:border-sky-500/10 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Fecha</p>
                    <p className="text-[11px] font-black text-slate-700 italic">{new Date(aiResult.start_time).toLocaleDateString()}</p>
                  </div>
                  <div className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Categoría</p>
                    <p className="text-[11px] font-black text-slate-700 capitalize italic">{aiResult.category}</p>
                  </div>
                </div>

                <button onClick={saveAiEvent} disabled={isProcessing} className="w-full h-20 bg-slate-900 text-white rounded-[2.2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin text-sky-500" /> : <><Check size={24} className="text-emerald-400" strokeWidth={3} /> Sincronizar</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
