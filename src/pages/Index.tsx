import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus, Chrome } from "lucide-react";
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
  const { profile, nestId, familyMembers, fetchSession, loading } = useNestStore();
  
  const [nextEventTitle, setNextEventTitle] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async () => {
    triggerHaptic('medium');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' } // Fuerza a elegir cuenta para evitar loops
      }
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  // Solo buscamos eventos si hay un nido vinculado
  useEffect(() => {
    if (nestId) fetchNextEvent();
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
    } catch (error) { console.error("Error eventos:", error); }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !nestId) return;
    
    triggerHaptic('medium');
    setIsAiProcessing(true);
    
    try {
      // Usamos el ID del nido para organizar el storage
      const fileName = `${nestId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('event-attachments').getPublicUrl(fileName);
      
      // Llamada a tu Edge Function de IA
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('process-image-ai', { 
        body: { imageUrl: publicUrl, nest_id: nestId } 
      });

      if (aiError) throw aiError;

      setScannedData(aiResult);
      setIsDrawerOpen(true);
      triggerHaptic('success');
    } catch (error: any) {
      toast({ title: "Radar IA", description: "No pudimos procesar la circular", variant: "destructive" });
    } finally { setIsAiProcessing(false); }
  };

  // --- RENDERIZADO CONDICIONAL ---

  // 1. Si está cargando el store, no mostramos nada (el App.tsx ya muestra el splash)
  if (loading) return null;

  // 2. Si NO hay perfil, mostramos la Landing de Acceso
  if (!profile) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
        {/* Atmósfera Brisa */}
        <div className="absolute top-[-10%] left-[-20%] w-[150%] h-[60%] bg-sky-400/10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white/70 backdrop-blur-3xl border border-white/40 p-10 rounded-[3.5rem] shadow-brisa text-center relative z-10"
        >
          <div className="w-20 h-20 bg-sky-500 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-haptic">
            <Plus size={40} strokeWidth={3} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic">KidUs</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Sincronía familiar de élite. <br/> Diseñada para Guías.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl group"
          >
            <Chrome size={20} className="group-hover:rotate-12 transition-transform" /> 
            ENTRAR CON GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

  // 3. Si hay perfil, mostramos el Dashboard Principal
  return (
    <div className="relative min-h-[100dvh] w-full bg-transparent">
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
            <motion.div key="agenda" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
              <AgendaView />
            </motion.div>
          )}
          
          {activeTab === "vault" && <VaultView nestId={nestId || ""} />}
          
          {activeTab === "settings" && (
            <SettingsView 
              nestId={nestId || ""} 
              members={familyMembers} 
              onRefresh={fetchSession} 
              onClose={() => setActiveTab("home")} 
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={(tab) => { triggerHaptic('soft'); setActiveTab(tab); }} />

      {/* FAB ACCIONES - Solo visible si hay nido */}
      {nestId && (
        <div className="fixed bottom-32 right-8 z-[110]">
          <div className={`flex flex-col gap-4 mb-6 transition-all duration-500 ${isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'}`}>
            <button onClick={() => { triggerHaptic('medium'); setIsFabOpen(false); fileInputRef.current?.click(); }} className="w-16 h-16 bg-white/90 backdrop-blur-xl rounded-[1.8rem] flex items-center justify-center text-sky-600 shadow-xl border border-white active:scale-90">
              <Camera size={28} />
            </button>
            <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); setIsDrawerOpen(true); }} className="w-16 h-16 bg-white/90 backdrop-blur-xl rounded-[1.8rem] flex items-center justify-center text-orange-500 shadow-xl border border-white active:scale-90">
              <Plus size={28} />
            </button>
          </div>
          <button 
            onClick={() => { triggerHaptic('medium'); setIsFabOpen(!isFabOpen); }} 
            className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-[135deg] bg-slate-900' : 'bg-sky-500 shadow-sky-200'}`}
          >
            <Plus size={36} strokeWidth={3} />
          </button>
        </div>
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      
      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => { setIsDrawerOpen(false); setScannedData(null); }} 
        members={familyMembers} 
        onEventAdded={() => { fetchNextEvent(); setActiveTab("agenda"); }} 
        initialData={scannedData} 
      />
      
      {/* Overlay de Procesamiento IA */}
      <AnimatePresence>
        {isAiProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-sky-500 rounded-full animate-ping opacity-20" />
            <p className="mt-4 font-black text-[10px] uppercase tracking-[0.5em] text-sky-600 animate-pulse">IA Analizando...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
