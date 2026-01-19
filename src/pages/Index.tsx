import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus, Users } from "lucide-react";

// Componentes del Ecosistema KidUs
import Header from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { AgendaView } from "@/components/AgendaView";
import { SettingsView } from "@/components/SettingsView";
import { VaultView } from "@/components/VaultView"; // IMPORTANTE: Asegúrate de que este archivo exista
import { BottomNav } from "@/components/BottomNav";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";

// Utilidades
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  // --- ESTADO GLOBAL ---
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myNestId, setMyNestId] = useState("");
  const [nextEventTitle, setNextEventTitle] = useState("");
  
  // --- UI STATE ---
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState("Analizando...");
  const [scannedData, setScannedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- CICLO DE VIDA ---
  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchAllData();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error inicializando sesión:", error);
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      if (profile?.nest_id) {
        setMyNestId(profile.nest_id);
        
        const [profilesRes, eventsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('nest_id', profile.nest_id).order('role', { ascending: true }),
          supabase.from('events')
            .select('title')
            .eq('nest_id', profile.nest_id)
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
            .limit(1)
            .maybeSingle()
        ]);

        if (profilesRes.data) setFamilyMembers(profilesRes.data);
        if (eventsRes.data) setNextEventTitle(eventsRes.data.title);
      }
    } catch (error) {
      console.error("Error en flujo de sincronía:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    triggerHaptic('medium');
    setIsAiProcessing(true);
    setAiMessage("Leyendo circular...");

    try {
      const fileName = `${myNestId || 'unassigned'}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-attachments')
        .getPublicUrl(fileName);
      
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('process-image-ai', { 
        body: { imageUrl: publicUrl, nest_id: myNestId } 
      });

      if (aiError) throw aiError;

      setScannedData(aiResult);
      setIsAiProcessing(false);
      setIsDrawerOpen(true);
      triggerHaptic('success');
      
    } catch (error) {
      setIsAiProcessing(false);
      toast({ title: "Radar offline", description: "La IA no pudo procesar la imagen.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sincronizando Nido</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      <Header />
      
      <main className="container mx-auto px-6 pt-10 max-w-md relative z-10 pb-48">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <DashboardView 
              membersCount={familyMembers.length} 
              onNavigate={setActiveTab}
              nextEvent={nextEventTitle}
            />
          )}

          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <AgendaView />
            </motion.div>
          )}

          {activeTab === "vault" && (
            <VaultView nestId={myNestId} />
          )}

          {activeTab === "settings" && (
            <SettingsView 
              nestId={myNestId} 
              members={familyMembers} 
              onRefresh={fetchAllData}
              onClose={() => setActiveTab("home")}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* FAB ACCIONES */}
      <div className="fixed bottom-40 right-10 z-[110]">
        <div className={`flex flex-col gap-6 mb-8 transition-all duration-500 ${isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`}>
          <button 
            onClick={() => { triggerHaptic('medium'); setIsFabOpen(false); fileInputRef.current?.click(); }} 
            className="w-20 h-20 bg-sky-500 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl border-4 border-white active:scale-90"
          >
            <Camera size={32} />
          </button>
          <button 
            onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); setIsDrawerOpen(true); }} 
            className="w-20 h-20 bg-orange-500 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl border-4 border-white active:scale-90"
          >
            <Plus size={32} />
          </button>
        </div>
        <button 
          onClick={() => { triggerHaptic('soft'); setIsFabOpen(!isFabOpen); }} 
          className={`w-24 h-24 rounded-[3rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-[135deg] bg-slate-900' : 'bg-sky-500'}`}
        >
          <Plus size={44} strokeWidth={3} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      <AnimatePresence>
        {isAiProcessing && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-white/60 backdrop-blur-2xl">
             <div className="flex flex-col items-center gap-10 p-16 bg-white rounded-[5rem] shadow-2xl border border-white">
              <div className="relative w-32 h-32 bg-sky-50 rounded-[3rem] flex items-center justify-center text-sky-500 animate-pulse">
                <Camera size={48} />
              </div>
              <p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.6em]">{aiMessage}</p>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => { setIsDrawerOpen(false); setScannedData(null); }} 
        members={familyMembers} 
        onEventAdded={() => { fetchAllData(); setActiveTab("agenda"); }} 
        initialData={scannedData} 
      />
    </div>
  );
};

export default Index;
