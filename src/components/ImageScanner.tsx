import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Loader2, Sparkles, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ImageScanner = ({ onScanComplete }: { onScanComplete: (data: any) => void }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Subir imagen a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('event-attachments')
        .getPublicUrl(filePath);

      toast({
        title: "Imagen recibida",
        description: "Analizando contenido con IA...",
      });

      // 3. AQUÍ LLAMAREMOS A LA EDGE FUNCTION (Próximo paso)
      // Por ahora, simulamos una respuesta para probar la UI
      console.log("URL de imagen lista para IA:", publicUrl);
      
      // Simulación de delay de IA
      setTimeout(() => {
        setIsUploading(false);
        onScanComplete({
          title: "Análisis pendiente de Edge Function",
          date: new Date().toISOString().split('T')[0],
        });
      }, 2000);

    } catch (error) {
      toast({
        title: "Error de subida",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        id="scanner-input"
        disabled={isUploading}
      />
      <label
        htmlFor="scanner-input"
        className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer active:scale-95 ${
          isUploading 
          ? 'bg-slate-50 border-slate-200 text-slate-400' 
          : 'bg-[#F8FAFC] border-[#0EA5E9]/30 text-[#0EA5E9] hover:bg-[#0EA5E9]/5'
        }`}
      >
        {isUploading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Sparkles size={20} className="animate-pulse" />
        )}
        <span className="text-sm font-black uppercase tracking-widest">
          {isUploading ? 'Escaneando...' : 'Escanear con IA'}
        </span>
      </label>
    </div>
  );
};
