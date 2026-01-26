import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
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

  // 1. DISPARADOR CRÍTICO: Sincronizar sesión al iniciar
  useEffect(() => {
    if (!initialized) {
      fetchSession();
    }
  }, [initialized, fetchSession]);

  const handleScanComplete = () => {
    triggerHaptic('success');
    setIsManualDrawerOpen(true);
  };

  const handleManualOpen = () => {
    triggerHaptic('soft');
    setIsManualDrawerOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 container mx-auto px-6 pt-6 max-w-md pb-48">
          {(activeTab === "home" || activeTab === "agenda") && (
            <div className="mb-8">
              <ImageScanner onScanComplete={handleScanComplete} />
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div 
                key="h" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardView onNavigate={setActiveTab} nestId={nestId || ""} members={members} />
              </motion.div>
            )}
            
            {activeTab === "agenda" && (
              <motion.div 
                key="a" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <AgendaView />
              </motion.div>
            )}

            {activeTab === "vault" && (
              <motion.div 
                key="v" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <VaultView nestId={nestId || ""} />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div 
                key="s" 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* BOTÓN FLOTANTE KIDUS */}
        <div className="fixed bottom-32 right-8 z-50">
          <button 
            onClick={handleManualOpen} 
            className="w-16 h-16 bg-slate-900 text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border-4 border-white active:scale-90 transition-all rotate-3 hover:rotate-0"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {/* COMPONENTES GLOBALES */}
        <ManualEventDrawer 
          isOpen={isManualDrawerOpen} 
          onClose={() => setIsManualDrawerOpen(false)} 
          members={members} 
          onEventAdded={async () => {
            await fetchEvents(); // Refresca eventos tras añadir uno manual
            triggerHaptic('success');
          }} 
        />

        <BottomNav 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            triggerHaptic('soft');
            setActiveTab(tab);
          }} 
        />
      </div>
    </div>
  );
};

export default Index;
