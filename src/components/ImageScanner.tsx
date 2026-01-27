import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/utils/haptics';

export const ImageScanner = ({ onScanComplete }: { onScanComplete: (data: any) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    triggerHaptic('medium');
    
    try {
      // 1. Convertir a Base64 para envío directo a la Edge Function
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString().split(',')[1] || "");
        reader.readAsDataURL(file);
      });

      toast({
        title: "Inteligencia Activada",
        description: "Leyendo el contenido del documento...",
      });

      // 2. Llamada a la Edge Function (nombre: process-image-ai)
      const { data, error: aiError } = await supabase.functions.invoke('process-image-ai', {
        body: { image: base64Image }
      });

      if (aiError) throw aiError;

      triggerHaptic('success');
      onScanComplete(data);
      
    } catch (error: any) {
      console.error("Error en escaneo:", error);
      toast({
        title: "Error de lectura",
        description: "Asegúrate de que la imagen sea clara.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="file"
        accept="image/*"
        capture="environment" 
        onChange={handleUpload}
        className="hidden"
        id="scanner-input-global"
        disabled={isUploading}
      />
      <motion.label
        whileTap={{ scale: 0.95 }}
        htmlFor="scanner-input-global"
        className={`flex items-center justify-center gap-4 w-full py-6 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer ${
          isUploading 
          ? 'bg-slate-100 border-slate-200 text-slate-400' 
          : 'bg-white border-sky-100 text-sky-600 shadow-xl shadow-sky-100/50 hover:border-sky-300'
        }`}
      >
        <div className={`p-3 rounded-2xl ${isUploading ? 'bg-slate-200' : 'bg-sky-50'}`}>
          {isUploading ? (
            <Loader2 className="animate-spin text-sky-500" size={24} />
          ) : (
            <Camera size={24} className="text-sky-500" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none mb-1">
            {isUploading ? 'Procesando...' : 'Nest-Vision'}
          </span>
          <span className="text-lg font-black text-slate-800 leading-none">
            Escanear Circular
          </span>
        </div>
        {!isUploading && <Sparkles size={18} className="ml-2 text-sky-400 animate-pulse" />}
      </motion.label>
    </div>
  );
};
