import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, FileText, Image, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const UploadDocumentDrawer = ({ isOpen, onClose, onEventAdded, members }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEventAdded: () => void;
  members: any[];
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      toast({ title: "Sube un archivo", description: "Necesitamos un documento para la IA.", variant: "destructive" });
      return;
    }
    setLoading(true);
    toast({ title: "Procesando documento...", description: "La IA de KidUs está trabajando.", variant: "default" });

    // --- AQUÍ SE INTEGRARÍA LA LLAMADA A TU API DE IA/OCR ---
    // Por ahora, solo simula el procesamiento
    await new Promise(resolve => setTimeout(resolve, 3000)); 

    toast({ title: "Documento analizado", description: "Revisa los campos sugeridos por la IA.", variant: "success" });
    // Aquí iría la lógica para mostrar los campos precargados para validación
    setLoading(false);
    // onClose(); // Cerrar y pasar a un diálogo de validación
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="glass-card rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-nunito">Escaneo Inteligente</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="space-y-6 text-center">
          <p className="text-muted-foreground">Sube una circular, un pantallazo o un PDF. ¡La IA se encarga del resto!</p>
          
          <div className="flex justify-center gap-4 my-6">
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">Subir</span>
            </label>
            {/* Opciones directas (Cámara/Galería) que luego se integrarán */}
            <Button variant="outline" className="w-24 h-24 flex flex-col items-center justify-center rounded-2xl text-gray-500">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-xs">Cámara</span>
            </Button>
            <Button variant="outline" className="w-24 h-24 flex flex-col items-center justify-center rounded-2xl text-gray-500">
                <Image className="w-8 h-8 mb-2" />
                <span className="text-xs">Galería</span>
            </Button>
          </div>

          {file && (
            <p className="text-sm font-medium text-kidus-blue">Archivo seleccionado: {file.name}</p>
          )}

          <Button onClick={handleProcess} disabled={loading || !file} className="w-full h-14 rounded-2xl bg-kidus-blue hover:bg-kidus-blue/90 text-lg font-bold shadow-lg mt-6">
            {loading ? "Analizando documento..." : "Procesar con IA"}
          </Button>
        </div>
      </div>
    </div>
  );
};
