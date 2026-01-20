import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus } from "lucide-react";
import { useNestStore } from "@/store/useNestStore"; // Importamos el cerebro

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
  
  // --- LEEMOS DEL STORE (YA ESTÁ CARGADO) ---
  const { nestId, familyMembers, fetchSession } = useNestStore();
  
  // --- UI STATE ---
  const [nextEventTitle, setNextEventTitle] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Solo cargamos los datos específicos que no están en el store (como el próximo evento)
  useEffect(() => {
    if (nestId) {
      fetchNextEvent();
    }
  }, [nestId]);

  const fetchNextEvent = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('title')
        .eq('nest_id', nestId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) setNextEventTitle(data.title);
    } catch (error) {
      console.error("Error cargando próximo evento:", error);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !nestId) return;
    
    triggerHaptic('medium');
    setIsAiProcessing(true);
    
    try {
      const fileName = `${nestId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('event-attachments').getPublicUrl(fileName);
      
      const { data: aiResult } = await supabase.functions.invoke('process-image-ai', { 
        body: { imageUrl: publicUrl, nest_id: nestId } 
      });

      setScannedData(aiResult);
      setIsDrawerOpen(true);
      triggerHaptic('success');
    } catch (error) {
      toast({ title: "Radar IA offline", description: "No pudimos procesar la imagen", variant: "destructive" });
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-transparent">
      <Header />
      
      <main className="container mx-auto px-6 pt-10 max-w-md relative z-10 pb-48">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <DashboardView 
                membersCount={familyMembers.length} 
                onNavigate={setActiveTab}
                nextEvent={nextEventTitle}
                nestId={nestId || ""}
              />
            </motion.div>
          )}

          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <AgendaView />
            </motion.div>
          )}

          {activeTab === "vault" && <VaultView nestId={nestId || ""} />}

          {activeTab === "settings" && (
            <SettingsView 
              nestId={nestId || ""} 
              members={familyMembers} 
              onRefresh={fetchSession} // El store ya sabe refrescar todo
              onClose={() => setActiveTab("home")}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Navegación y FAB se mantienen igual... */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => { triggerHaptic('soft'); setActiveTab(tab); }} />

      {/* FAB ACCIONES */}
      <div className="fixed bottom-32 right-8 z-[110]">
        <div className={`flex flex-col gap-4 mb-6 transition-all duration-500 ${isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`}>
          <button onClick={() => { triggerHaptic('medium'); setIsFabOpen(false); fileInputRef.current?.click(); }} className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-[1.8rem] flex items-center justify-center text-sky-600 shadow-xl border border-white active:scale-90">
            <Camera size={28} />
          </button>
          <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); setIsDrawerOpen(true); }} className="w-16 h-16 bg-white/80 backdrop-blur-xl rounded-[1.8rem] flex items-center justify-center text-orange-500 shadow-xl border border-white active:scale-90">
            <Plus size={28} />
          </button>
        </div>
        <button onClick={() => { triggerHaptic('medium'); setIsFabOpen(!isFabOpen); }} className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-[135deg] bg-slate-900' : 'bg-sky-500 shadow-sky-200'}`}>
          <Plus size={36} strokeWidth={3} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => { setIsDrawerOpen(false); setScannedData(null); }} 
        members={familyMembers} 
        onEventAdded={() => { fetchNextEvent(); setActiveTab("agenda"); }} 
        initialData={scannedData} 
      />
      
      {isAiProcessing && (
        <div className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-sky-500 rounded-full animate-ping opacity-20" />
          <p className="mt-4 font-black text-[10px] uppercase tracking-[0.5em] text-sky-600">IA Analizando...</p>
        </div>
      )}
    </div>
  );
};

export default Index;
