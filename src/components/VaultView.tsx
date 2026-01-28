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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32 px-4">
      {/* Header Estilo Brisa */}
      <header className="pt-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/10">
            <Heart size={18} className="text-sky-600 fill-sky-600" />
          </div>
          <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.4em] italic">Memoria del Nido</p>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Cápsula Digital</h2>
      </header>

      {/* Buscador Glassmorphism */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors z-10">
          <Search size={22} />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar recuerdos o documentos..."
          className="w-full h-18 bg-white/40 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] pl-16 pr-6 font-bold text-slate-600 shadow-xl shadow-slate-200/50 focus:bg-white/80 focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
        />
      </div>

      {/* Listado de Documentos */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 opacity-40">
            <Loader2 className="animate-spin text-sky-500" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Sincronizando el Nido...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDocs.length > 0 ? filteredDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 rounded-[3rem] bg-white/50 backdrop-blur-md border border-white/80 shadow-lg shadow-slate-200/30 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-white shadow-inner flex items-center justify-center text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-700 shrink-0 border border-slate-100">
                    {doc.category === 'Alimentación' ? <Utensils size={24} /> : <FileText size={24} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-900 tracking-tight text-sm italic leading-tight truncate w-full">{doc.name}</h3>
                    <div className="flex gap-2 items-center mt-1.5">
                       <span className="text-[8px] font-black text-sky-600 bg-sky-100/50 border border-sky-200/50 px-3 py-1 rounded-full uppercase italic">{doc.category}</span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{doc.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => handleDeleteDoc(doc.name)}
                    className="w-12 h-12 bg-red-50/50 rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-100/50"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all duration-300 border border-slate-100 shadow-sm">
                    <Download size={18} />
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="py-16 bg-white/30 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center gap-3">
                 <CloudLightning className="text-slate-300" size={32} />
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] italic">El nido aún no tiene recuerdos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tarjeta IA Nest-Vision */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="p-10 rounded-[4.5rem] bg-slate-900 text-white relative overflow-hidden shadow-3xl shadow-slate-300 group transition-all duration-700"
      >
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
          <Sparkles size={180} className="text-sky-400" />
        </div>
        
        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-500 rounded-[1.4rem] flex items-center justify-center shadow-2xl shadow-sky-500/50 ring-4 ring-sky-500/10">
                <Sparkles size={24} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-400 italic">Nest-Vision AI</span>
              <span className="text-[8px] font-bold text-sky-600/50 uppercase tracking-[0.2em]">Cero carga mental</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-5xl font-black leading-[0.85] tracking-tighter italic">Cero carga <br/> mental.</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[260px] italic">
              Suelta una circular o un menú. Deja que la IA lo sincronice por ti.
            </p>
          </div>

          <input 
            type="file" accept="image/*" id="vision-upload-vault" 
            className="hidden" onChange={handleVisionScan} disabled={isProcessing}
          />
          
          <label 
            htmlFor="vision-upload-vault"
            className={`w-full h-22 bg-white text-slate-900 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all cursor-pointer shadow-2xl ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:bg-sky-50 hover:shadow-sky-200/20'}`}
          >
            {isProcessing ? <Loader2 className="animate-spin text-sky-500" size={24} /> : <><Camera size={26} strokeWidth={2.5} className="text-sky-500" /> Escanear Documento</>}
          </label>
        </div>
      </motion.div>

      {/* Modal de Confirmación IA Estilo Brisa */}
      <AnimatePresence>
        {showConfirm && aiResult && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 200 }} className="relative w-full max-w-lg bg-white/90 backdrop-blur-3xl rounded-[4rem] shadow-2xl overflow-hidden p-10 max-h-[90vh] overflow-y-auto no-scrollbar border border-white/50">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-sky-50 rounded-3xl text-sky-600 flex items-center gap-3 border border-sky-100">
                  <Sparkles size={28} className="animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest italic">Visión Sincronizada</span>
                </div>
                <button onClick={() => setShowConfirm(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-100 transition-all"><X size={24} /></button>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-5 italic">Título Identificado</h3>
                  <input value={aiResult.title} onChange={(e) => setAiResult({...aiResult, title: e.target.value})} className="text-3xl font-black text-slate-900 w-full bg-slate-50/50 border-2 border-transparent focus:border-sky-500/10 p-6 rounded-[2rem] outline-none tracking-tighter italic transition-all" />
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">Asignar en el Nido:</p>
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1">
                    <button onClick={() => { triggerHaptic('soft'); setAiResult({...aiResult, assigned_to: null}) }} className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-[1.8rem] font-black text-[10px] uppercase transition-all border ${!aiResult.assigned_to ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}>
                      <Users size={16} /> Toda la Tribu
                    </button>
                    {members?.map((member: any) => (
                      <button key={member.id} onClick={() => { triggerHaptic('soft'); setAiResult({...aiResult, assigned_to: member.id}) }} className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-[1.8rem] font-black text-[10px] uppercase transition-all border ${aiResult.assigned_to === member.id ? 'bg-sky-500 border-sky-500 text-white shadow-xl' : 'bg-white text-slate-400 border-slate-100'}`}>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: member.color }} />
                        {member.display_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <Calendar size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Fecha</span>
                    </div>
                    <p className="text-sm font-black text-slate-700 italic">
                      {new Date(aiResult.start_time).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <Info size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">Categoría</span>
                    </div>
                    <p className="text-sm font-black text-slate-700 capitalize italic">{aiResult.category}</p>
                  </div>
                </div>

                <div className="p-8 bg-sky-50/30 rounded-[3rem] border border-sky-100/50">
                  <p className="text-[10px] font-black text-sky-600 uppercase mb-3 italic tracking-widest">Contenido Extraído</p>
                  <textarea value={aiResult.description} onChange={(e) => setAiResult({...aiResult, description: e.target.value})} className="text-xs text-slate-600 font-medium bg-transparent w-full h-32 resize-none outline-none leading-relaxed italic" />
                </div>

                <button onClick={saveAiEvent} disabled={isProcessing} className="w-full h-22 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><Check size={24} strokeWidth={3} className="text-emerald-400" /> Sincronizar Agenda</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-16 flex flex-col items-center gap-4 opacity-20">
        <CloudLightning size={24} className="text-slate-900" />
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-center leading-loose text-slate-900">
          KidUs Vault v1.0 <br/> Encriptación de Grado Familiar
        </p>
      </footer>
    </motion.div>
  );
};
          <div className="space-y-3">
            <h3 className="text-4xl font-black leading-[0.9] tracking-tighter italic">Cero carga <br/> mental.</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[240px]">
              Sube una foto de la circular o el menú. KidUs lo sincroniza todo por ti.
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
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <><Camera size={24} strokeWidth={2.5} /> Escanear Documento</>}
          </label>
        </div>
      </motion.div>

      <AnimatePresence>
        {showConfirm && aiResult && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl overflow-hidden p-8 max-h-[90vh] overflow-y-auto no-scrollbar border border-white">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-sky-50 rounded-2xl text-sky-600 flex items-center gap-2">
                  <Sparkles size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">Análisis Inteligente</span>
                </div>
                <button onClick={() => setShowConfirm(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic px-1">¿Es correcto este título?</h3>
                  <input value={aiResult.title} onChange={(e) => setAiResult({...aiResult, title: e.target.value})} className="text-2xl font-black text-slate-900 w-full bg-slate-50 p-4 rounded-2xl outline-none tracking-tighter italic border-2 border-transparent focus:border-sky-500/20 transition-all" />
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
                  <div className="p-4 bg-slate-50 rounded-3xl">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Calendar size={12} /> <span className="text-[8px] font-black uppercase tracking-tighter">Fecha detectada</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 italic">
                      {new Date(aiResult.start_time).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl">
                    <div className="flex items-center gap-2 mb-1 text-slate-400">
                      <Info size={12} /> <span className="text-[8px] font-black uppercase tracking-tighter">Categoría</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 capitalize">{aiResult.category}</p>
                  </div>
                </div>

                <div className="p-6 bg-sky-50/50 rounded-[2.5rem] border border-sky-100/50">
                  <p className="text-[10px] font-black text-sky-600 uppercase mb-2 italic">Resumen de la IA</p>
                  <textarea value={aiResult.description} onChange={(e) => setAiResult({...aiResult, description: e.target.value})} className="text-[11px] text-slate-600 font-medium bg-transparent w-full h-24 resize-none outline-none leading-relaxed italic" />
                </div>

                <button onClick={saveAiEvent} disabled={isProcessing} className="w-full h-20 bg-slate-900 text-white rounded-[2.2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" /> : <><Check size={20} strokeWidth={3} /> Guardar en Agenda</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-10 flex flex-col items-center gap-3 opacity-20">
        <CloudLightning size={20} />
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-center leading-loose">
          KidUs Vault v1.0 <br/> Encriptación de Grado Familiar
        </p>
      </footer>
    </motion.div>
  );
};
