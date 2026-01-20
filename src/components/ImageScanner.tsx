import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export const ImageScanner = ({ onScanComplete }: { onScanComplete: (data: any) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `scans/${fileName}`;

    try {
      // 1. Subida al Storage (bucket 'event-attachments')
      const { error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Llamada a tu Edge Function process-image-ai
      toast({
        title: "Imagen en el Nido",
        description: "La IA está leyendo la circular...",
      });

      const { data, error: aiError } = await supabase.functions.invoke('process-image-ai', {
        body: { filePath } // Pasamos la ruta del archivo para que la función lo lea
      });

      if (aiError) throw aiError;

      // 3. Éxito: Pasamos los datos extraídos (título, fecha, etc.) al Index
      onScanComplete(data);
      
    } catch (error: any) {
      console.error("Error en escaneo:", error);
      toast({
        title: "Error de lectura",
        description: "No pudimos extraer datos de la imagen.",
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
        id="scanner-input"
        disabled={isUploading}
      />
      <motion.label
        whileTap={{ scale: 0.95 }}
        htmlFor="scanner-input"
        className={`flex items-center justify-center gap-4 w-full py-6 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer ${
          isUploading 
          ? 'bg-slate-100 border-slate-200 text-slate-400' 
          : 'bg-white border-sky-100 text-sky-600 shadow-xl shadow-sky-100/50'
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
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            {isUploading ? 'Procesando...' : 'Inteligencia'}
          </span>
          <span className="text-lg font-black text-slate-800 -mt-1">
            Escanear Circular
          </span>
        </div>
        {!isUploading && <Sparkles size={18} className="ml-2 text-sky-400 animate-pulse" />}
      </motion.label>
    </div>
  );
};
