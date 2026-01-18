import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Feedback háptico profesional
const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else if (type === 'success') navigator.vibrate([20, 30, 20]);
    else navigator.vibrate(100);
  }
};

export const UploadDocumentDrawer = ({ isOpen, onClose, onEventAdded, members, type }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEventAdded: () => void;
  members: any[];
  type: 'camera' | 'gallery' | 'pdf';
}) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'confirm'>('upload');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerHaptic('soft');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    processWithIA(file);
  };

  const processWithIA = async (file: File) => {
    setStep('processing');
    
    // Simulación de "KidUs Brain"
    setTimeout(() => {
      setExtractedData({
        title: "Excursión a la Granja",
        date: "2026-02-15",
        time: "09:00",
        suggestedSubject: members[0]?.id || "",
        details: "Llevar gorra y cantimplora."
      });
      setStep('confirm');
      triggerHaptic('soft');
    }, 2500);
  };

  // FUNCIÓN CORREGIDA Y SINCRONIZADA
  const saveAIEvent = async () => {
    setLoading(true);
    
    // Mapeo exacto a las columnas de la base de datos
    const { error } = await supabase.from('events').insert([{
      description: extractedData.title, // El título va a description según tu manual
      assigned_to: extractedData.suggestedSubject,
      event_date: `${extractedData.date}T${extractedData.time}:00`,
      category: 'school',
      nest_id: members[0]?.nest_id,
      // notas_adicionales: extractedData.details // Opcional si tienes la columna
    }]);

    if (!error) {
      triggerHaptic('success');
      toast({ title: "¡Entendido!", description: "La IA ha organizado el evento en el nido." });
      onEventAdded();
      onClose();
    } else {
      triggerHaptic('warning');
      console.error("Error guardando evento IA:", error);
      toast({ 
        title: "Error de sincronía", 
        description: "No pudimos guardar el evento.", 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="relative w-full bg-white/95 backdrop-blur-2xl rounded-t-[3.5rem] p-8 shadow-2xl border-t border-white/50 min-h-[50vh]">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
        
        {step === 'upload' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-sky-50 rounded-[2rem] flex items-center justify-center mx-auto text-sky-500">
              {type === 'camera' ? <Camera size={40} /> : <Sparkles size={40} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">Sincroniza tu Nido</h3>
              <p className="text-slate-500 text-sm font-medium mt-2">Sube una foto de la circular o menú escolar.</p>
            </div>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 rounded-[2rem] bg-sky-500 hover:bg-sky-600 text-lg font-black shadow-lg active:scale-95 transition-all"
            >
              Seleccionar Archivo
            </Button>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-12 space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <Loader2 size={96} className="text-sky-500 animate-spin absolute inset-0" />
              <Sparkles size={32} className="text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-xl font-black text-slate-800">KidUs Brain leyendo...</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Extrayendo fechas de la tribu</p>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <Check className="text-emerald-500" />
              <p className="text-sm font-bold text-emerald-700">¡Lectura completada!</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Título detectado</label>
                <p className="font-bold text-slate-800">{extractedData.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</label>
                  <p className="font-bold text-slate-800">{extractedData.date}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hora</label>
                  <p className="font-bold text-slate-800">{extractedData.time}</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={saveAIEvent} 
              disabled={loading}
              className="w-full h-16 rounded-[2.5rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-lg shadow-xl active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : "CONFIRMAR EN LA AGENDA"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
