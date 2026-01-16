import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulación de preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    processWithIA(file);
  };

  const processWithIA = async (file: File) => {
    setStep('processing');
    
    // Aquí es donde en el futuro conectamos con Gemini/GPT-4o
    // Por ahora simulamos la "magia" para validar el flujo del Nido
    setTimeout(() => {
      setExtractedData({
        title: "Excursión a la Granja",
        date: "2026-02-15",
        time: "09:00",
        suggestedSubject: members[0]?.id || "",
        description: "Llevar gorra y cantimplora."
      });
      setStep('confirm');
    }, 2500);
  };

  const saveAIEvent = async () => {
    const { error } = await supabase.from('events').insert([{
      title: extractedData.title,
      member_id: extractedData.suggestedSubject,
      start_time: `${extractedData.date}T${extractedData.time}:00`,
      category: 'school',
      description: extractedData.description
    }]);

    if (!error) {
      toast({ title: "¡Entendido!", description: "La IA ha organizado el evento en el nido." });
      onEventAdded();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative w-full bg-white/95 backdrop-blur-2xl rounded-t-[3rem] p-8 shadow-2xl border-t border-white/50 min-h-[50vh]">
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
      
      {step === 'upload' && (
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-blue-500">
            {type === 'camera' ? <Camera size={40} /> : <Sparkles size={40} />}
          </div>
          <div>
            <h3 className="text-2xl font-black">Escanear el Nido</h3>
            <p className="text-gray-500 text-sm font-medium mt-2">Sube una foto de la circular o menú escolar.</p>
          </div>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-16 rounded-[2rem] bg-blue-600 text-lg font-black shadow-xl"
          >
            Seleccionar Archivo
          </Button>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center py-12 space-y-6 animate-pulse">
          <div className="relative mx-auto w-24 h-24">
            <Loader2 size={96} className="text-blue-500 animate-spin absolute inset-0" />
            <Sparkles size={32} className="text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-black text-gray-800">KidUs Brain leyendo...</h3>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Extrayendo fechas y responsables</p>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
            <Check className="text-green-500" />
            <p className="text-sm font-bold text-green-700">¡Lectura completada!</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Título detectado</label>
              <p className="font-bold text-gray-800">{extractedData.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Fecha</label>
                <p className="font-bold text-gray-800">{extractedData.date}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hora</label>
                <p className="font-bold text-gray-800">{extractedData.time}</p>
              </div>
            </div>
          </div>

          <Button onClick={saveAIEvent} className="w-full h-16 rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-lg shadow-xl shadow-orange-100">
            Confirmar en la Agenda
          </Button>
        </div>
      )}
    </div>
  );
};
