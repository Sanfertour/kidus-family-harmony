import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, Plus, Search, 
  Loader2, Sparkles, Camera, Utensils, 
  Heart, CalendarCheck, ShieldCheck, AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

export const VaultView = ({ nestId }: { nestId: string }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { profile } = useNestStore();
  const { toast } = useToast();

  // 1. Cargar documentos de la Memoria (Simulado/Storage)
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      // Aquí conectarás con supabase.storage.from('vault').list()
      setTimeout(() => {
        setDocuments([
          { id: '1', name: "Cartilla Salud Peques.pdf", size: "1.2MB", date: "12 Ene", category: 'Salud' },
          { id: '2', name: "Menú Escolar Febrero.png", size: "2.4MB", date: "Hoy", category: 'Alimentación' },
        ]);
        setLoading(false);
      }, 800);
    };
    fetchDocs();
  }, [nestId]);

  // 2. Función Maestra: Nest-Vision (Conexión real con Edge Function)
  const handleVisionScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !nestId) return;

    setIsProcessing(true);
    triggerHaptic('medium');
    
    toast({ 
      title: "Activando Inteligencia", 
      description: "Leyendo el documento para vuestra Tribu... ✨" 
    });

    try {
      // Convertir imagen a Base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || "");
        reader.readAsDataURL(file);
      });

      // Llamada real a tu Edge Function
      const { data, error } = await supabase.functions.invoke('nest-vision', {
        body: { 
          image: base64Image, 
          nest_id: nestId,
          user_id: profile?.id 
        }
      });

      if (error) throw error;

      // Inyectar eventos detectados en la Agenda (Verdad Única)
      if (data?.events && data.events.length > 0) {
        const eventsToInsert = data.events.map((ev: any) => ({
          ...ev,
          nest_id: nestId,
          created_by: profile?.id,
          is_private: false
        }));

        const { error: insertError } = await supabase
          .from('events')
          .insert(eventsToInsert);

        if (insertError) throw insertError;

        triggerHaptic('success');
        toast({ 
          title: "¡Sincronía completada!", 
          description: `He volcado ${data.events.length} planes a vuestra agenda automáticamente. 🌿`,
        });
      } else {
        toast({ 
          title: "Lectura finalizada", 
          description: "No he encontrado planes nuevos en este documento.",
          variant: "default" 
        });
      }

    } catch (err: any) {
      console.error("Error en Nest-Vision:", err);
      toast({ 
        title: "Error de Sincronía", 
        description: "Asegúrate de que la foto tenga buena luz.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
      e.target.value = ""; // Reset del input
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen pb-40 px-6 pt-10 overflow-y-auto no-scrollbar"
    >
      {/* HEADER AMABLE (ESTÉTICA BRISA) */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-sky-500/10 rounded-lg">
                <Heart size={14} className="text-sky-600 fill-sky-600" />
            </div>
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.4em]">Protección Familiar</p>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Memoria</h2>
        </div>
      </header>

      {/* BUSCADOR GLASSMORPHISM */}
      <div className="relative mb-8">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          type="text" 
          placeholder="Buscar recuerdos o documentos..."
          className="w-full h-16 bg-white/70 backdrop-blur-md border border-white rounded-[2rem] pl-16 pr-6 font-bold text-slate-600 shadow-sm focus:ring-4 focus:ring-sky-500/5 transition-all outline-none"
        />
      </div>

      {/* LISTADO DE RECUERDOS/DOCUMENTOS */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-300">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">Organizando el Nido...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Memoria vacía</p>
          </div>
        ) : (
          <AnimatePresence>
            {documents.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-5 rounded-[2.8rem] bg-white/80 backdrop-blur-sm border border-white shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-[1.4rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors">
                    {doc.category === 'Alimentación' ? <Utensils size={22} /> : <FileText size={22} />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 tracking-tight text-sm line-clamp-1">{doc.name}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {doc.category} • {doc.date}
                    </p>
                  </div>
                </div>
                <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600">
                  <Download size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* WIDGET INTELIGENTE: NEST-VISION */}
      <div className="mt-12 p-10 rounded-[3.5rem] bg-slate-900 text-white relative overflow-hidden shadow-3xl group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={140} className="text-sky-400" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-sky-400">
            <Sparkles size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">KidUs Vision AI</span>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-black leading-tight tracking-tight italic">
              Vuelca vuestro mundo a la agenda
            </h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[240px]">
              Sube menús, circulares o citas. La IA los convertirá en eventos para tu Tribu.
            </p>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            id="vision-upload" 
            className="hidden" 
            onChange={handleVisionScan}
            disabled={isProcessing}
          />
          
          <label 
            htmlFor="vision-upload"
            className={`w-full h-18 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer shadow-xl ${isProcessing ? 'opacity-50' : 'hover:bg-sky-50'}`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Camera size={20} />
                Capturar y Sincronizar
              </>
            )}
          </label>
        </div>
      </div>

      {/* INDICADOR DE SEGURIDAD AMABLE */}
      <div className="mt-10 flex items-center justify-center gap-2 opacity-30">
        <ShieldCheck size={12} />
        <span className="text-[9px] font-black uppercase tracking-widest">Tus datos están seguros en el Nido</span>
      </div>
    </motion.div>
  );
};
          
