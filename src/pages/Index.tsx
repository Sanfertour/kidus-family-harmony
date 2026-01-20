import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus, Chrome, Loader2 } from "lucide-react";
import { useNestStore } from "@/store/useNestStore";

// Componentes
import Header from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { AgendaView } from "@/components/AgendaView";
import { SettingsView } from "@/components/SettingsView";
import { VaultView } from "@/components/VaultView";
import { BottomNav } from "@/components/BottomNav";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";

// Utilidades
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { profile, nestId, fetchSession, loading: authLoading } = useNestStore();
  
  const [members, setMembers] = useState<any[]>([]); 
  const [nextEventTitle, setNextEventTitle] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- SINCRONIZACIÓN DE DATOS DEL NIDO ---
  useEffect(() => {
    if (nestId) {
      setDataLoading(true);
      Promise.all([fetchNextEvent(), fetchTribu()])
        .finally(() => setDataLoading(false));
      
      const memberChannel = supabase.channel('tribu-updates')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'profiles', // Cambiado a profiles para que coincida con lo que editamos en Settings
          filter: `nest_id=eq.${nestId}` 
        }, () => fetchTribu())
        .subscribe();

      return () => { supabase.removeChannel(memberChannel); };
    }
  }, [nestId]);

  const fetchTribu = async () => {
    if (!nestId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('nest_id', nestId)
        .order('display_name', { ascending: true });
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error cargando la tribu:", error);
    }
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
    } catch (error) { console.error("Error eventos:", error); }
  };

  const handleLogin = async () => {
    triggerHaptic('medium');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' }
      }
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !nestId) return;
    setIsAiProcessing(true);
    // ... (Tu lógica de carga de archivos e IA se mantiene igual)
  };

  // --- RENDERIZADO DE SEGURIDAD ---

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-sky-500" size={40} />
    </div>
  );

  if (!profile) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[60%] bg-sky-400/10 blur-[120px] rounded-full pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm bg-white/70 backdrop-blur-3xl border border-white/40 p-10 rounded-[3.5rem] shadow-brisa text-center relative z-10">
          <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-haptic">
            <Plus size={40} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">KidUs</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Sincronía familiar de élite. <br/> Diseñada para Guías.</p>
          <button onClick={handleLogin} className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl group">
            <Chrome size={20} className="group-hover:rotate-12 transition-transform" /> ENTRAR CON GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] w-full bg-slate-50/50">
      <Header />
      
      <main className="container mx-auto px-6 pt-10 max-w-md relative z-10 pb-48">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <DashboardView 
                membersCount={members?.length || 0} 
                onNavigate={setActiveTab} 
                nextEvent={nextEventTitle} 
                nestId={nestId} 
                members={members || []} // Protección vital
              />
            </motion.div>
          )}
          
          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
              <AgendaView />
            </motion.div>
          )}
          
          {activeTab === "vault" && <VaultView nestId={nestId || ""} />}
          
          {activeTab === "settings" && (
            <SettingsView 
              nestId={nestId} 
              members={members || []} 
              onRefresh={() => { fetchSession(); fetchTribu(); }} 
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={(tab) => { triggerHaptic('soft'); setActiveTab(tab); }} />

      {/* FAB y Drawers (se mantienen igual)... */}
      {nestId && (
        <div className="fixed bottom-32 right-8 z-[110]">
          <button onClick={() => { triggerHaptic('medium'); setIsFabOpen(!isFabOpen); }} className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-[135deg] bg-slate-900' : 'bg-sky-500 shadow-sky-200'}`}>
            <Plus size={36} strokeWidth={3} />
          </button>
        </div>
      )}

      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => { setIsDrawerOpen(false); setScannedData(null); }} 
        members={members || []} 
        onEventAdded={() => { fetchNextEvent(); setActiveTab("agenda"); }} 
        initialData={scannedData} 
      />
    </div>
  );
};

export default Index;
        
