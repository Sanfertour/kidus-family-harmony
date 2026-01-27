import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNestStore } from "@/store/useNestStore";
import Header from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { AgendaView } from "@/components/AgendaView";
import { SettingsView } from "@/components/SettingsView";
import { VaultView } from "@/components/VaultView";
import { BottomNav } from "@/components/BottomNav";
import { triggerHaptic } from "@/utils/haptics";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";
import { ImageScanner } from "@/components/ImageScanner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { nestId, members, fetchEvents, fetchSession, initialized } = useNestStore();
  const [isManualDrawerOpen, setIsManualDrawerOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    if (!initialized) fetchSession();
  }, [initialized, fetchSession]);

  const handleAction = (type: 'manual' | 'scan') => {
    if (type === 'manual') setIsManualDrawerOpen(true);
    if (type === 'scan') setIsScannerOpen(true);
  };

  return (
    // CAMBIO: Fondo más etéreo y refinado
    <div className="relative min-h-screen w-full bg-slate-50/30">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 container mx-auto px-6 pt-6 max-w-md pb-40">
          <AnimatePresence mode="wait">
            {/* Vistas controladas por el BottomNav */}
            {activeTab === "home" && (
              <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DashboardView onNavigate={setActiveTab} nestId={nestId || ""} members={members} />
              </motion.div>
            )}
            
            {activeTab === "agenda" && (
              <motion.div key="a" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <AgendaView />
              </motion.div>
            )}

            {activeTab === "vault" && (
              <motion.div key="v" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <VaultView nestId={nestId || ""} />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="s" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Scanner Modal - CAMBIO: Ahora es Glassmorphism puro para no romper la estética Brisa */}
        <AnimatePresence>
          {isScannerOpen && (
            <motion.div 
              className="fixed inset-0 z-[110] bg-white/70 backdrop-blur-3xl" 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-6 pt-12">
                <button 
                  onClick={() => { triggerHaptic('soft'); setIsScannerOpen(false); }} 
                  className="mb-8 px-4 py-2 bg-slate-900/5 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-900/5"
                >
                  ← Volver al Nido
                </button>
                <div className="bg-white/40 p-4 rounded-[2.5rem] border border-white shadow-2xl">
                   <ImageScanner onScanComplete={() => { setIsScannerOpen(false); setIsManualDrawerOpen(true); triggerHaptic('success'); }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ManualEventDrawer 
          isOpen={isManualDrawerOpen} 
          onClose={() => setIsManualDrawerOpen(false)} 
          members={members} 
          onEventAdded={async () => {
            await fetchEvents();
            triggerHaptic('success');
          }} 
        />

        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

export default Index;
