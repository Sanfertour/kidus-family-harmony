import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Chrome } from "lucide-react";
import { useNestStore } from "@/store/useNestStore";

import Header from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { AgendaView } from "@/components/AgendaView";
import { SettingsView } from "@/components/SettingsView";
import { VaultView } from "@/components/VaultView";
import { BottomNav } from "@/components/BottomNav";
import { triggerHaptic } from "@/utils/haptics";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { profile, nestId, familyMembers } = useNestStore();
  const [nextEventTitle, setNextEventTitle] = useState("");

  useEffect(() => {
    if (nestId) {
      const fetchNext = async () => {
        const { data } = await supabase.from('events').select('title').eq('nest_id', nestId)
          .gte('start_time', new Date().toISOString()).order('start_time', { ascending: true }).limit(1).maybeSingle();
        setNextEventTitle(data?.title || "");
      };
      fetchNext();
    }
  }, [nestId]);

  if (!profile) {
    return (
      <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-sky-400 animate-liquid-fast opacity-10" />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center w-full max-w-sm">
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-40 h-40 mx-auto mb-8 object-contain rounded-[3rem] shadow-2xl shadow-sky-100"
            alt="Logo"
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
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-sky-400 animate-liquid-fast opacity-[0.1]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-6 pt-6 max-w-md pb-48">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DashboardView onNavigate={setActiveTab} nextEvent={nextEventTitle} nestId={nestId} members={familyMembers} membersCount={familyMembers.length} />
              </motion.div>
            )}
            {activeTab === "agenda" && <AgendaView key="a" />}
            {activeTab === "vault" && <VaultView key="v" nestId={nestId || ""} />}
            {activeTab === "settings" && <SettingsView key="s" nestId={nestId} members={familyMembers} onRefresh={() => useNestStore.getState().fetchSession()} />}
          </AnimatePresence>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={(tab) => { triggerHaptic('soft'); setActiveTab(tab); }} />
      </div>
    </div>
  );
};

export default Index;
