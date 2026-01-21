import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, Edit } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";
import { ManualEventDrawer } from "./ManualEventDrawer";
import { UploadDocumentDrawer } from "./UploadDocumentDrawer";

export const FabRadial = ({ onEventAdded, members }: { onEventAdded: () => void; members: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'manual' | 'ia' | null>(null);

  const toggleFab = () => {
    triggerHaptic('soft');
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="fixed bottom-10 right-8 z-[100] flex flex-col items-center gap-4">
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => { setActiveDrawer('ia'); setIsOpen(false); }}
            className="w-14 h-14 bg-sky-500 text-white rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Sparkles size={24} />
          </motion.button>
        )}

        {isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => { setActiveDrawer('manual'); setIsOpen(false); }}
            className="w-14 h-14 bg-slate-800 text-white rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Edit size={24} />
          </motion.button>
        )}

        <button 
          onClick={toggleFab}
          className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-orange-500 rotate-45' : 'bg-orange-600 text-white'}`}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      <ManualEventDrawer 
        isOpen={activeDrawer === 'manual'} 
        onClose={() => setActiveDrawer(null)} 
        onEventAdded={onEventAdded} 
        members={members} 
      />
      
      <UploadDocumentDrawer 
        isOpen={activeDrawer === 'ia'} 
        onClose={() => setActiveDrawer(null)} 
        onEventAdded={onEventAdded} 
        members={members}
      />
    </>
  );
};
