import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, Search, 
  Loader2, Sparkles, Camera, Utensils, 
  Heart, CloudLightning, X, Check, Calendar, Info, Users
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
    setLoading(true);
    try {
      // Intentamos listar archivos del bucket 'vault' en la carpeta del nido
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

  const handleVisionScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !nestId) return;

    setIsProcessing(true);
    triggerHaptic('medium');
    
    toast({ 
      title: "Activando Nest-Vision", 
      description: "Guardando y analizando con la IA de KidUs...",
    });

    try {
      // 1. SUBIR AL STORAGE
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${nestId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. CONVERTIR A BASE64 PARA IA
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || "");
        reader.readAsDataURL(file);
      });

      // 3. INVOCAR EDGE FUNCTION
      const { data, error: aiError } = await supabase.functions.invoke('process-image-ai', {
        body: { image: base64Image, nest_id: nestId, user_id: profile?.id }
      });

      if (aiError) throw aiError;

      if (data) {
        setAiResult({ ...data, assigned_to: profile?.id });
        setShowConfirm(true);
        triggerHaptic('success');
        fetchDocs(); // Refrescamos la lista para ver el nuevo archivo
      }
    } catch (err: any) {
      console.error("Error en el proceso:", err);
      toast({ 
        title: "Error de Lectura", 
        description: "No he podido procesar la imagen. Verifica el bucket 'vault'.", 
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
      toast({ title: "¡Sincronía completada!", description: "Evento añadido al calendario." });
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
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
            {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
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
                    <h3 className="font-black text-slate-900 tracking-tight text-base italic leading-tight truncate max-w-[150px]">{doc.name}</h3>
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
            )) : (
              <p className="text-center py-10 text-slate-400 font-bold text-xs uppercase tracking-widest">No hay documentos en este Nido</p>
            )}
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
            className={`w-full h-20 bg-white text-slate-900 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer shadow-2xl ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:bg-sky-50'}`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <><Camera size={24} strokeWidth={2.5} /> Sincronizar con IA</>}
          </label>
        </div>
      </motion.div>

      <AnimatePresence>
        {showConfirm && aiResult && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl overflow-hidden p-8 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-sky-50 rounded-2xl text-sky-600 flex items-center gap-2">
                  <Sparkles size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Análisis IA</span>
                </div>
                <button onClick={() => setShowConfirm(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic px-1">Título</h3>
                  <input value={aiResult.title} onChange={(e) => setAiResult({...aiResult, title: e.target.value})} className="text-2xl font-black text-slate-900 w-full bg-slate-50 p-4 rounded-2xl outline-none tracking-tighter italic border border-transparent focus:border-sky-100 transition-all" />
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Asignar a:</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                    <button onClick={() => { triggerHaptic('soft'); setAiResult({...aiResult, assigned_to: null}) }} className={`flex-shrink-0 px-5 py-3 rounded-2xl font-black text-[10px] uppercase transition-all border ${!aiResult.assigned_to ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                      <Users size={14} className="inline mr-2" /> Toda la Tribu
                    </button>
                    {members?.map((member: any) => (
                      <button key={member.id} onClick={() => { triggerHaptic('soft'); setAiResult({...aiResult, assigned_to: member.id}) }} className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase transition-all border ${aiResult.assigned_to === member.id ? 'bg-sky-500 border-sky-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent'}`}>
                        {member.display_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Calendar size={12} /> <span className="text-[8px] font-black uppercase">Fecha</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700">{new Date(aiResult.start_time).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100/50">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Info size={12} /> <span className="text-[8px] font-black uppercase">Categoría</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 capitalize">{aiResult.category}</p>
                  </div>
                </div>

                <div className="p-6 bg-sky-50/50 rounded-[2.5rem] border border-sky-100/50">
                  <p className="text-[10px] font-black text-sky-600 uppercase mb-2 italic">Análisis del contenido</p>
                  <textarea value={aiResult.description} onChange={(e) => setAiResult({...aiResult, description: e.target.value})} className="text-[11px] text-slate-600 font-medium bg-transparent w-full h-24 resize-none outline-none leading-relaxed italic" />
                </div>

                <button onClick={saveAiEvent} disabled={isProcessing} className="w-full h-20 bg-slate-900 text-white rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><Check size={20} strokeWidth={3} /> Sincronizar en Agenda</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-10 flex flex-col items-center gap-3 opacity-20">
        <CloudLightning size={20} />
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-center leading-loose">
          Privacidad Blindada <br/> KidUs protege la Sincronía de tu Tribu
        </p>
      </footer>
    </motion.div>
  );
};
