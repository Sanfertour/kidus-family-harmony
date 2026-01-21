import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Sparkles, Check, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; // Ruta corregida según tu estructura
import { triggerHaptic } from '@/utils/haptics';
import { useNestStore } from '@/store/useNestStore';

export const UploadDocumentDrawer = ({ isOpen, onClose, onEventAdded, members, type }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEventAdded: () => void;
  members: any[];
  type: 'camera' | 'gallery' | 'pdf';
}) => {
  const { nestId, profile } = useNestStore();
  const [step, setStep] = useState<'upload' | 'processing' | 'confirm'>('upload');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerHaptic('soft');
    processWithIA(file);
  };

  const processWithIA = async (file: File) => {
    setStep('processing');
    
    // Simulación de "KidUs Brain" (Próximo paso: Conectar con Edge Function de OpenAI/Gemini)
    setTimeout(() => {
      setExtractedData({
        title: "Excursión Granja Escuela",
        date: "2026-02-15",
        time: "09:00",
        suggestedSubject: members[0]?.id || "",
        description: "Llevar gorra, cantimplora y mochila pequeña. Salida desde el bus escolar."
      });
      setStep('confirm');
      triggerHaptic('success');
    }, 2500);
  };

  const saveAIEvent = async () => {
    if (!nestId || !profile) return;
    setLoading(true);
    
    try {
      // Sincronización con la tabla 'events' real
      const { error } = await supabase.from('events').insert([{
        title: extractedData.title,
        description: extractedData.description,
        assigned_to: extractedData.suggestedSubject || null,
        start_time: `${extractedData.date}T${extractedData.time}:00`,
        category: 'school',
        nest_id: nestId,
        is_private: false,
        created_by: profile.id
      }]);

      if (error) throw error;

      triggerHaptic('success');
      toast({ title: "¡Sincronizado!", description: "La IA ha organizado el evento en el nido." });
      onEventAdded();
      onClose();
      // Reset para la próxima vez
      setStep('upload');
    } catch (error: any) {
      triggerHaptic('warning');
      toast({ 
        title: "Error de sincronía", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 min-h-[50vh]">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-10" />
        
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>

        {step === 'upload' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in-95">
            <div className="w-24 h-24 bg-sky-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-sky-500 shadow-inner">
              {type === 'camera' && <Camera size={44} strokeWidth={1.5} />}
              {type === 'gallery' && <ImageIcon size={44} strokeWidth={1.5} />}
              {type === 'pdf' && <FileText size={44} strokeWidth={1.5} />}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">KidUs Brain</h3>
              <p className="text-slate-500 font-medium px-4 text-balance">
                Escanea circulares, menús o notas y deja que la IA organice el Nido por ti.
              </p>
            </div>

            <input type="file" accept="image/*,application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-slate-800 text-lg font-black tracking-widest shadow-xl active:scale-95 transition-all"
            >
              {type === 'camera' ? 'ABRIR CÁMARA' : 'SELECCIONAR'}
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-16 space-y-8">
            <div className="relative mx-auto w-28 h-28">
              <Loader2 size={112} className="text-sky-500 animate-spin absolute inset-0 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={40} className="text-sky-500 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Analizando Documento</h3>
              <p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
                Extrayendo Sincronía...
              </p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <header className="flex items-center gap-4 p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100">
              <div className="bg-emerald-500 rounded-full p-1 text-white">
                <Check size={16} strokeWidth={3} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700">¡Lectura Exitosa!</p>
            </header>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Evento Detectado</label>
                <p className="font-black text-xl text-slate-800 tracking-tight leading-none italic">"{extractedData.title}"</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fecha</label>
                  <p className="font-bold text-slate-800 tracking-tight">{extractedData.date}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hora</label>
                  <p className="font-bold text-slate-800 tracking-tight">{extractedData.time}h</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
               <Button 
                onClick={() => setStep('upload')}
                variant="outline"
                className="h-20 w-1/4 rounded-[2.2rem] border-2 border-slate-100 text-slate-400"
              >
                <X size={24} />
              </Button>
              <Button 
                onClick={saveAIEvent} 
                disabled={loading}
                className="h-20 flex-1 rounded-[2.2rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-lg tracking-widest shadow-xl shadow-orange-200 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : "CONFIRMAR"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
