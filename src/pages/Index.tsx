import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Chrome, Plus } from "lucide-react";
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
  // Extraemos lo necesario del Store. App.tsx ya se encarga de llamar a fetchSession.
  const { profile, nestId, members, fetchEvents } = useNestStore();
  const [isManualDrawerOpen, setIsManualDrawerOpen] = useState(false);
  const [aiExtractedData, setAiExtractedData] = useState<any>(null);

  const handleScanComplete = (data: any) => {
    triggerHaptic('success');
    setAiExtractedData(data);
    setIsManualDrawerOpen(true);
  };

  const handleManualOpen = () => {
    triggerHaptic('soft');
    setAiExtractedData(null);
    setIsManualDrawerOpen(true);
  };

  const handleGoogleLogin = async () => {
    triggerHaptic('medium');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) console.error("Error Auth:", error.message);
  };

  // VISTA A: SI NO HAY PERFIL (LOGIN)
  // Mantenemos tu estética KidUs original al 100%
  if (!profile) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center w-full max-w-sm"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-40 h-40 mx-auto mb-8 rounded-[3rem] shadow-2xl object-cover" 
            alt="KidUs" 
          />
          <h1 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter leading-none">KidUs</h1>
          <p className="text-slate-400 mb-12 font-black uppercase tracking-[0.3em] text-[10px]">Sincronía en el Nido</p>
          
          <button 
            onClick={handleGoogleLogin} 
            className="w-full h-20 bg-slate-900 text-white rounded-[2.5rem] font-black flex items-center justify-center gap-4 shadow-2xl shadow-slate-300 active:scale-95 transition-all"
          >
            <Chrome size={24} strokeWidth={3} />
            <span className="tracking-widest text-sm">ENTRAR CON GOOGLE</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // VISTA B: DASHBOARD (CUANDO HAY PERFIL)
  // Reutilizamos toda la lógica de componentes que ya funcionaba
  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 container mx-auto px-6 pt-6 max-w-md pb-48">
          {/* Scanner de IA visible en Home y Agenda */}
          {(activeTab === "home" || activeTab === "agenda") && (
            <div className="mb-8">
              <ImageScanner onScanComplete={handleScanComplete} />
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div key="h" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <DashboardView onNavigate={setActiveTab} nestId={nestId || ""} members={members} />
              </motion.div>
            )}
            
            {activeTab === "agenda" && (
              <motion.div key="a" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <AgendaView />
              </motion.div>
            )}

            {activeTab === "vault" && (
              <motion.div key="v" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <VaultView nestId={nestId || ""} />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="s" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Botón Flotante (FAB) con rotación dinámica */}
        <div className="fixed bottom-32 right-8 z-50">
          <button 
            onClick={handleManualOpen} 
            className="w-16 h-16 bg-slate-900 text-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center border-4 border-white active:scale-90 transition-all rotate-3 hover:rotate-0"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {/* Drawer de Eventos Manual/IA */}
        <ManualEventDrawer 
          isOpen={isManualDrawerOpen} 
          onClose={() => { setIsManualDrawerOpen(false); setAiExtractedData(null); }} 
          members={members} 
          onEventAdded={() => fetchEvents()} 
          initialData={aiExtractedData} // Pasamos los datos de la IA si existen
        />

        {/* Barra de navegación con haptic feedback */}
        <BottomNav activeTab={activeTab} onTabChange={(tab) => {
          triggerHaptic('soft');
          setActiveTab(tab);
        }} />
      </div>
    </div>
  );
};

export default Index;
