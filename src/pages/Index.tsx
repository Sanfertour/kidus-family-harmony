import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Chrome, Loader2 } from "lucide-react";
import { useNestStore } from "@/store/useNestStore";

// Componentes con carga segura
import Header from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { AgendaView } from "@/components/AgendaView";
import { SettingsView } from "@/components/SettingsView";
import { VaultView } from "@/components/VaultView";
import { BottomNav } from "@/components/BottomNav";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";

import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { profile, nestId, fetchSession, loading: authLoading, familyMembers } = useNestStore();
  
  const [nextEventTitle, setNextEventTitle] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const { toast } = useToast();

  // 1. INICIALIZACIÓN Y SEGURIDAD (Interruptor de desbloqueo)
  useEffect(() => {
    fetchSession();

    // Interruptor de seguridad: Si en 6s sigue cargando, liberamos la UI
    const timer = setTimeout(() => {
      if (authLoading) {
        console.warn("Sincronización lenta detectada. Forzando desbloqueo visual.");
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // 2. SINCRONIZACIÓN DE EVENTOS
  useEffect(() => {
    if (nestId) {
      fetchNextEvent();
    }
  }, [nestId]);

  const fetchNextEvent = async () => {
    if (!nestId) return;
    try {
      const { data } = await supabase
        .from('events')
        .select('title')
        .eq('nest_id', nestId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();
      setNextEventTitle(data?.title || "");
    } catch (e) { console.error("Error Eventos:", e); }
  };

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

  // --- RENDERIZADO ---

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-50 overflow-hidden">
      
      {/* CAPA DE ONDAS LÍQUIDAS KIDUS (Siempre presente en el fondo) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-sky-400 animate-liquid-fast opacity-[0.15]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-orange-400 animate-liquid-slow opacity-[0.1]" />
      </div>

      <AnimatePresence mode="wait">
        {authLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-50 h-[100dvh] w-full flex flex-col items-center justify-center bg-white/20 backdrop-blur-md"
          >
            <Loader2 className="animate-spin text-sky-500 mb-4" size={32} />
            <p className="text-brisa text-sky-600">Sincronizando</p>
          </motion.div>
        ) : !profile ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="relative z-50 h-[100dvh] w-full flex flex-col items-center justify-center p-6"
          >
            <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-haptic shadow-sky-200">
              <Plus size={40} strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter">KidUs</h1>
            <p className="text-slate-500 font-medium mb-12 text-center italic">Gestión Familiar de Élite</p>
            <button 
              onClick={handleLogin} 
              className="w-full max-w-sm h-20 bg-slate-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
            >
              <Chrome size={20} /> ENTRAR CON GOOGLE
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative z-10"
          >
            <Header />
            
            <main className="container mx-auto px-6 pt-6 max-w-md pb-48">
              <AnimatePresence mode="wait">
                {activeTab === "home" && (
                  <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <DashboardView 
                      membersCount={familyMembers?.length || 0} 
                      onNavigate={setActiveTab} 
                      nextEvent={nextEventTitle} 
                      nestId={nestId} 
                      members={familyMembers || []} 
                    />
                  </motion.div>
                )}
                
                {activeTab === "agenda" && <AgendaView key="a" />}
                {activeTab === "vault" && <VaultView key="v" nestId={nestId || ""} />}
                {activeTab === "settings" && (
                  <SettingsView 
                    key="s"
                    nestId={nestId} 
                    members={familyMembers || []} 
                    onRefresh={() => fetchSession()} 
                  />
                )}
              </AnimatePresence>
            </main>

            <BottomNav activeTab={activeTab} onTabChange={(tab) => { triggerHaptic('soft'); setActiveTab(tab); }} />
            
            <ManualEventDrawer 
              isOpen={isDrawerOpen} 
              onClose={() => setIsDrawerOpen(false)} 
              members={familyMembers || []} 
              onEventAdded={() => { fetchNextEvent(); setActiveTab("agenda"); }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
