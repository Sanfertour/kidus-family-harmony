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
import { ManualEventDrawer } from "@/components/ManualEventDrawer";

import { triggerHaptic } from "@/utils/haptics";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { profile, nestId, familyMembers } = useNestStore();
  const [nextEventTitle, setNextEventTitle] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleLogin = async () => {
    triggerHaptic('medium');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' }
      }
    });
  };

  if (!profile) {
    return (
      <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-6 overflow-hidden">
        {/* FONDO LÍQUIDO EN LOGIN */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-sky-400 animate-liquid-fast opacity-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[100%] bg-orange-400 animate-liquid-slow opacity-10" />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center">
          <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl">
            <Plus size={40} strokeWidth={3} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter">KidUs</h1>
          <p className="text-slate-500 mb-12 font-medium italic">Gestión Familiar de Élite</p>
          <button onClick={handleLogin} className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all px-10">
            <Chrome size={24} /> ENTRAR CON GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-50/50 overflow-hidden">
      {/* CAPA DE ONDAS SIEMPRE ACTIVA */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-sky-400 animate-liquid-fast opacity-[0.12]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-orange-400 animate-liquid-slow opacity-[0.08]" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-6 pt-6 max-w-md pb-48">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DashboardView 
                  membersCount={familyMembers.length} 
                  onNavigate={setActiveTab} 
                  nextEvent={nextEventTitle} 
                  nestId={nestId} 
                  members={familyMembers} 
                />
              </motion.div>
            )}
            {activeTab === "agenda" && <AgendaView key="a" />}
            {activeTab === "vault" && <VaultView key="v" nestId={nestId || ""} />}
            {activeTab === "settings" && <SettingsView key="s" nestId={nestId} members={familyMembers} onRefresh={() => useNestStore.getState().fetchSession()} />}
          </AnimatePresence>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={(tab) => { triggerHaptic('soft'); setActiveTab(tab); }} />
        <ManualEventDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} members={familyMembers} onEventAdded={() => setActiveTab("agenda")} />
      </div>
    </div>
  );
};

export default Index;
