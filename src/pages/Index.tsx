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
    <div className="relative min-h-screen w-full bg-slate-50/50">
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

        {/* Scanner Modal (Se activa desde el FAB Central) */}
        <AnimatePresence>
          {isScannerOpen && (
            <motion.div className="fixed inset-0 z-[110] bg-white" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}>
              <div className="p-6">
                <button onClick={() => setIsScannerOpen(false)} className="mb-4 text-slate-400 text-xs font-black uppercase tracking-widest">Cerrar</button>
                <ImageScanner onScanComplete={() => { setIsScannerOpen(false); setIsManualDrawerOpen(true); triggerHaptic('success'); }} />
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
