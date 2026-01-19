import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus } from "lucide-react";

// Store Global (Zustand)
import { useNestStore } from "@/store/useNestStore";

// Componentes del Ecosistema KidUs
import Header from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { AgendaView } from "@/components/AgendaView";
import { SettingsView } from "@/components/SettingsView";
import { VaultView } from "@/components/VaultView"; // Importamos la nueva Bóveda
import { BottomNav } from "@/components/BottomNav";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";

// Utilidades
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  // --- CONSUMO DEL STORE (Cerebro Global) ---
  const { 
    isLoading, 
    nestId, 
    familyMembers, 
    fetchSession, 
    nextEventTitle 
  } = useNestStore();

  // --- UI STATE LOCAL ---
  const [activeTab, setActiveTab] = useState("home");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState("Analizando...");
  const [scannedData, setScannedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- CARGA INICIAL ---
  useEffect(() => {
    fetchSession();
  }, []);

  // --- LÓGICA DE IA VISION (PROCESAMIENTO) ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    triggerHaptic('medium');
    setIsAiProcessing(true);
    setAiMessage("Leyendo circular...");

    try {
      const fileName = `${nestId || 'unassigned'}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-attachments')
        .getPublicUrl(fileName);
      
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('process-image-ai', { 
        body: { imageUrl: publicUrl, nest_id: nestId } 
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

  // --- PANTALLA DE CARGA ÉLITE ---
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-8 border-sky-100 rounded-[2.5rem]" />
          <div className="absolute inset-0 border-8 border-t-sky-500 rounded-[2.5rem] animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">
            Sincronizando Nido
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-nido-mesh">
      <Header />
      
      <main className="container mx-auto px-6 pt-10 max-w-md relative z-10 pb-48">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <DashboardView 
              key="home"
              membersCount={familyMembers.length} 
              onNavigate={setActiveTab}
              nextEvent={nextEventTitle}
            />
          )}

          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <AgendaView />
            </motion.div>
          )}

          {activeTab === "vault" && (
            <VaultView key="vault" nestId={nestId || ""} />
          )}

          {activeTab === "settings" && (
            <SettingsView 
              key="settings"
              nestId={nestId || ""} 
              members={familyMembers} 
              onRefresh={fetchSession}
              onClose={() => setActiveTab("home")}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* FAB - ACCIONES RÁPIDAS */}
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
          className={`w-24 h-24 rounded-[3rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-[135deg] bg-slate-900' : 'bg-sky-500 shadow-sky-200'}`}
        >
          <Plus size={44} strokeWidth={3} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      {/* OVERLAY IA */}
      <AnimatePresence>
        {isAiProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[300] flex items-center justify-center bg-white/60 backdrop-blur-2xl"
          >
            <div className="flex flex-col items-center gap-10 p-16 bg-white rounded-[5rem] shadow-2xl border border-white">
              <div className="relative w-32 h-32 bg-sky-50 rounded-[3rem] flex items-center justify-center text-sky-500">
                <div className="absolute inset-0 bg-sky-400/20 rounded-[3rem] animate-ping" />
                <Camera size={48} className="animate-pulse" />
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">IA KidUs</h3>
                <p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.6em]">{aiMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => { setIsDrawerOpen(false); setScannedData(null); }} 
        members={familyMembers} 
        onEventAdded={() => { fetchSession(); setActiveTab("agenda"); }} 
        initialData={scannedData} 
      />
    </div>
  );
};

export default Index;
