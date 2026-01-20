import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Chrome, Loader2 } from "lucide-react";
import { useNestStore } from "@/store/useNestStore";

// Componentes
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

  // 1. INICIALIZACIÓN Y SEGURIDAD
  useEffect(() => {
    fetchSession();

    // Interruptor de seguridad: Si en 6s sigue cargando, algo fue mal con la red
    const timer = setTimeout(() => {
      if (authLoading) {
        console.warn("Sincronización lenta detectada. Forzando entrada.");
        // El store se autogestiona con el timeout que pusimos, pero esto asegura la UI
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // 2. CARGA DE EVENTOS (La tribu ya viene del Store)
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
      
      {/* CAPA DE ONDAS (Siempre visible, incluso en carga) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-sky-400/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-orange-200/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AnimatePresence mode="wait">
        {authLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-50 h-screen w-full flex flex-col items-center justify-center bg-white/20 backdrop-blur-md"
          >
            <Loader2 className="animate-spin text-sky-500 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-600">Sincronizando Nido</p>
          </motion.div>
        ) : !profile ? (
          <motion.div 
            key="login"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="relative z-50 h-screen w-full flex flex-col items-center justify-center p-6"
          >
            <div className="w-24 h-24 bg-sky-500 rounded-[2.8rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-sky-200">
              <Plus size={48} strokeWidth={3} />
            </div>
            <h1 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter">KidUs</h1>
            <p className="text-slate-500 font-medium mb-12 text-center leading-relaxed italic">Gestión Familiar de Élite.<br/>Diseñada para Guías.</p>
            <button 
              onClick={handleLogin} 
              className="w-full max-w-xs h-20 bg-slate-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all"
            >
              <Chrome size={24} /> ENTRAR CON GOOGLE
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
