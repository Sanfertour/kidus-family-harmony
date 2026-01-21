import { useState, useEffect } from "react";
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
  // Corregido: Usamos 'members' en lugar de 'familyMembers' para coincidir con el Store
  const { profile, nestId, members, fetchSession, fetchEvents } = useNestStore();
  const [nextEventTitle, setNextEventTitle] = useState("");
  const [isManualDrawerOpen, setIsManualDrawerOpen] = useState(false);
  const [aiExtractedData, setAiExtractedData] = useState<any>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (nestId) {
      const fetchNext = async () => {
        const { data } = await supabase
          .from('events')
          .select('title')
          .eq('nest_id', nestId)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1)
          .maybeSingle();
        setNextEventTitle(data?.title || "");
      };
      fetchNext();
    }
  }, [nestId]);

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

  if (!profile) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full max-w-sm">
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-40 h-40 mx-auto mb-8 rounded-[3rem] shadow-2xl shadow-sky-100 object-cover" 
            alt="KidUs Logo"
          />
          <h1 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter">KidUs</h1>
          <p className="text-slate-500 mb-12 font-medium italic">Esperanza en el Nido</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} 
            className="w-full h-20 bg-slate-900 text-white rounded-[2.5rem] font-black flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
          >
            <Chrome size={24} /> ENTRAR CON GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

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
              <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DashboardView 
                  onNavigate={setActiveTab} 
                  nestId={nestId || ""} 
                  members={members} 
                />
              </motion.div>
            )}

            {activeTab === "agenda" && (
              <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AgendaView />
              </motion.div>
            )}

            {activeTab === "vault" && (
              <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <VaultView nestId={nestId || ""} />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Floating Action Button - Brisa Style */}
        <div className="fixed bottom-28 right-6 z-50">
          <button 
            onClick={handleManualOpen} 
            className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white active:scale-90 transition-all hover:bg-sky-600"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {/* Drawer de Eventos */}
        <ManualEventDrawer 
          isOpen={isManualDrawerOpen} 
          onClose={() => { 
            setIsManualDrawerOpen(false); 
            setAiExtractedData(null); 
          }} 
          members={members} 
          onEventAdded={() => fetchEvents()} 
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
