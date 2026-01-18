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
        {/* Sub-botón: Escáner IA */}
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => { setActiveDrawer('ia'); setIsOpen(false); }}
            className="w-14 h-14 bg-[#0EA5E9] text-white rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Sparkles size={24} />
          </motion.button>
        )}

        {/* Sub-botón: Manual */}
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => { setActiveDrawer('manual'); setIsOpen(false); }}
            className="w-14 h-14 bg-slate-800 text-white rounded-2xl shadow-lg flex items-center justify-center"
          >
            <Edit size={24} />
          </motion.button>
        )}

        {/* Botón Principal */}
        <button 
          onClick={toggleFab}
          className={`w-18 h-18 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? 'bg-orange-500 rotate-45' : 'bg-[#F97316] text-white'}`}
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      {/* Control de Drawers centralizado */}
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
        type="camera" // Por defecto abre cámara
      />
    </>
  );
};
