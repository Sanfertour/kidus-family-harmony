import { useState, useEffect, useRef } from "react";
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
  const { profile, nestId, fetchSession, loading: authLoading } = useNestStore();
  
  const [members, setMembers] = useState<any[]>([]); 
  const [nextEventTitle, setNextEventTitle] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const { toast } = useToast();

  // 1. EFECTO DE CARGA DE DATOS (Con protección de NestId)
  useEffect(() => {
    if (nestId) {
      console.log("Nido detectado:", nestId);
      fetchTribu();
      fetchNextEvent();

      const channel = supabase.channel('realtime-tribu')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'profiles', 
          filter: `nest_id=eq.${nestId}` 
        }, () => fetchTribu())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [nestId]);

  const fetchTribu = async () => {
    if (!nestId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('nest_id', nestId);
      if (error) throw error;
      setMembers(data || []);
    } catch (e) { console.error("Error Tribu:", e); }
  };

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
      options: { redirectTo: window.location.origin }
    });
  };

  // --- RENDERIZADO SEGURO ---

  // Si está cargando la sesión, mostramos un spinner elegante
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  // Si no hay perfil, pantalla de Login
  if (!profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
           <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
             <Plus size={40} strokeWidth={3} />
           </div>
           <h1 className="text-4xl font-black text-slate-900 mb-2 italic">KidUs</h1>
           <p className="text-slate-500 mb-8">Gestión Familiar de Élite</p>
           <button onClick={handleLogin} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-3">
             <Chrome size={20} /> ENTRAR CON GOOGLE
           </button>
        </motion.div>
      </div>
    );
  }

  // PANTALLA PRINCIPAL (Solo se renderiza si hay profile)
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      
      <main className="container mx-auto px-6 pt-6 max-w-md pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DashboardView 
                membersCount={members?.length || 0} 
                onNavigate={setActiveTab} 
                nextEvent={nextEventTitle} 
                nestId={nestId} 
                members={members || []} 
              />
            </motion.div>
          )}
          
          {activeTab === "agenda" && <AgendaView key="a" />}
          
          {activeTab === "settings" && (
            <SettingsView 
              key="s"
              nestId={nestId} 
              members={members || []} 
              onRefresh={() => { fetchSession(); fetchTribu(); }} 
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Drawer de eventos con protección de array */}
      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        members={members || []} 
        onEventAdded={() => { fetchNextEvent(); setActiveTab("agenda"); }} 
      />
    </div>
  );
};

export default Index;
