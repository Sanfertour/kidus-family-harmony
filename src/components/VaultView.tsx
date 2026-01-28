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
      toast({ title: "Documento eliminado" });
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
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${nestId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('vault').upload(filePath, file);
      if (uploadError) throw uploadError;

      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error: aiError } = await supabase.functions.invoke('process-image-ai', {
        body: { image: base64Image, nest_id: nestId }
      });

      if (aiError) throw aiError;

      if (data) {
        setAiResult({ 
          title: data.title || "Nuevo Evento",
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
      toast({ title: "Error de lectura IA", variant: "destructive" });
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
      toast({ title: "Sincronizado" });
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full space-y-8 pb-32 px-4 max-w-md mx-auto">
      {/* CABECERA CENTRADA */}
      <header className="text-center pt-8">
        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-sky-500/10 rounded-[1.5rem] flex items-center justify-center border border-sky-100 shadow-sm">
            <Heart size={20} className="text-sky-600 fill-sky-600" />
          </div>
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.4em] italic">Gestión del Nido</p>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Documentos</h2>
      </header>

      {/* BUSCADOR CENTRADO */}
      <div className="relative w-full group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-sky-500 transition-colors z-10" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar documentos..."
          className="w-full h-18 bg-white/50 backdrop-blur-xl border border-white rounded-[2.2rem] pl-16 pr-6 font-bold text-slate-600 shadow-xl shadow-slate-200/30 focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all outline-none text-center"
        />
      </div>

      {/* LISTADO DE DOCUMENTOS */}
      <div className="w-full space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4 opacity-40">
            <Loader2 className="animate-spin text-sky-500" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Sincronizando Memoria...</p>
          </div>
        ) : (
          <div className="grid gap-4 w-full">
            {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 rounded-[2.8rem] bg-white/70 backdrop-blur-md border border-white shadow-lg shadow-slate-200/20 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 shadow-inner shrink-0 border border-slate-50">
                    {doc.category === 'Alimentación' ? <Utensils size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-900 tracking-tight text-sm italic truncate">{doc.name}</h3>
                    <div className="flex gap-2 items-center mt-0.5">
                       <span className="text-[7px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full uppercase italic border border-sky-100">{doc.category}</span>
                       <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{doc.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => handleDeleteDoc(doc.name)} className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100">
                    <Trash2 size={15} />
                  </button>
                  <button className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all border border-slate-100 shadow-sm">
                    <Download size={15} />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-10 bg-white/30 rounded-[2.5rem] border border-dashed border-slate-200 italic font-black text-[9px] uppercase text-slate-300 tracking-[0.3em]">No hay archivos</div>
            )}
          </div>
        )}
      </div>

      {/* TARJETA NEST-VISION CENTRADA */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="w-full p-10 rounded-[3.5rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl shadow-slate-400/30 group text-center flex flex-col items-center"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-1000">
          <Sparkles size={140} className="text-sky-400" />
        </div>
        
        <div className="relative z-10 space-y-6 w-full flex flex-col items-center">
          <div className="w-14 h-14 bg-sky-500 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-sky-500/40 border border-sky-400/20">
              <Sparkles size={26} className="text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-4xl font-black leading-[0.9] tracking-tighter italic">Nest-Vision.</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[200px] italic">
              Escanea circulares o menús y sincroniza tu Nido.
            </p>
          </div>

          <input type="file" accept="image/*" id="vision-upload-vault" className="hidden" onChange={handleVisionScan} disabled={isProcessing} />
          
          <label 
            htmlFor="vision-upload-vault"
            className={`w-full h-18 bg-white text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer shadow-2xl ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:bg-sky-50'}`}
          >
            {isProcessing ? <Loader2 className="animate-spin text-sky-500" size={20} /> : <><Camera size={20} className="text-sky-500" /> Iniciar Escaneo</>}
          </label>
        </div>
      </motion.div>

      {/* FOOTER CENTRADO */}
      <footer className="py-12 flex flex-col items-center gap-3 opacity-20">
        <CloudLightning size={20} className="text-slate-900" />
        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-center leading-loose text-slate-900">
          KidUs Sincronía <br/> Encriptación Familiar
        </p>
      </footer>

      {/* MODAL IA - CENTRADO Y AJUSTADO */}
      <AnimatePresence>
        {showConfirm && aiResult && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-8 border border-white flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-600 mb-6">
                <Sparkles size={32} className="animate-pulse" />
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-slate-400 italic tracking-widest">Título Detectado</p>
                  <input value={aiResult.title} onChange={(e) => setAiResult({...aiResult, title: e.target.value})} className="text-xl font-black text-slate-900 w-full bg-slate-50/50 p-4 rounded-2xl outline-none text-center italic" />
                </div>

                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1 italic">Fecha</p>
                    <p className="text-xs font-black text-slate-700 italic">{new Date(aiResult.start_time).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1 italic">Categoría</p>
                    <p className="text-xs font-black text-slate-700 italic capitalize">{aiResult.category}</p>
                  </div>
                </div>

                <button onClick={saveAiEvent} disabled={isProcessing} className="w-full h-16 bg-slate-900 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Confirmar</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
                                                                                                                                                                                                                               
