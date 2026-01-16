import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
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
    toast({ title: "Procesando documento...", description: "La IA de KidUs está trabajando." });

    await new Promise(resolve => setTimeout(resolve, 3000)); 

    toast({ title: "Documento analizado", description: "Revisa los campos sugeridos por la IA." });
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Overlay oscuro con desenfoque */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* El Drawer */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 border-t border-white/50">
        {/* Tirador decorativo superior */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black font-nunito flex items-center gap-2">
              Escaneo IA <Sparkles className="w-5 h-5 text-blue-500" />
            </h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Multimodal</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Subir</span>
            </label>

            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Cámara</span>
            </button>

            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Galería</span>
            </button>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl animate-in zoom-in-95">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Upload className="w-5 h-5 text-blue-500" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-blue-700 truncate">{file.name}</p>
                <p className="text-[10px] text-blue-400 uppercase font-bold">Listo para procesar</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleProcess} 
            disabled={loading || !file} 
            className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-lg font-black shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analizando...
              </div>
            ) : (
              "Extraer con IA"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
