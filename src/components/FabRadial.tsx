import { useState } from "react";
import { Plus, Camera, Image, FileText, Edit } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog"; // Importa DialogTrigger

// Diálogos de contenido (estos los crearemos luego como Drawers)
import { ManualEventDrawer } from "@/components/ManualEventDrawer"; // Futuro
import { UploadDocumentDrawer } from "@/components/UploadDocumentDrawer"; // Futuro

export const FabRadial = ({ onEventAdded, members }: { onEventAdded: () => void; members: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'' | 'manual' | 'upload'>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Estado para controlar los drawers

  const handleFabClick = () => {
    setIsOpen(!isOpen);
  };

  const handleSubButtonClick = (type: 'manual' | 'upload') => {
    setDialogType(type);
    setIsDrawerOpen(true); // Abre el drawer correspondiente
    setIsOpen(false); // Cierra el FAB radial
  };

  return (
    <>
      <div className="fab-radial-container">
        {/* Botones secundarios */}
        {/* Cámara */}
        <button 
          className={`fab-sub-button ${isOpen ? 'visible' : ''}`}
          onClick={() => console.log('Abrir cámara')} // Aquí irá la lógica de cámara
          style={{ transform: isOpen ? 'translateY(-250px) scale(1)' : '' }}
        >
          <Camera className="w-6 h-6" />
        </button>
        {/* Galería */}
        <button 
          className={`fab-sub-button ${isOpen ? 'visible' : ''}`}
          onClick={() => console.log('Abrir galería')} // Aquí irá la lógica de galería
          style={{ transform: isOpen ? 'translateY(-190px) scale(1)' : '' }}
        >
          <Image className="w-6 h-6" />
        </button>
        {/* PDF */}
        <button 
          className={`fab-sub-button ${isOpen ? 'visible' : ''}`}
          onClick={() => handleSubButtonClick('upload')}
          style={{ transform: isOpen ? 'translateY(-130px) scale(1)' : '' }}
        >
          <FileText className="w-6 h-6" />
        </button>
        {/* Lápiz (Manual) */}
        <button 
          className={`fab-sub-button ${isOpen ? 'visible' : ''}`}
          onClick={() => handleSubButtonClick('manual')}
          style={{ transform: isOpen ? 'translateY(-70px) scale(1)' : '' }}
        >
          <Edit className="w-6 h-6" />
        </button>

        {/* Botón principal del FAB */}
        <button className={`fab-main-button ${isOpen ? 'open' : ''}`} onClick={handleFabClick}>
          <Plus />
        </button>
      </div>

      {/* DRAWERS: Se abrirán desde abajo */}
      {dialogType === 'manual' && (
        <ManualEventDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          onEventAdded={onEventAdded} 
          members={members} 
        />
      )}
      {dialogType === 'upload' && (
        <UploadDocumentDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          onEventAdded={onEventAdded} 
          members={members} 
        />
      )}
    </>
  );
};
