import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus } from "lucide-react";

// Componentes del Ecosistema KidUs
import Header from "@/components/Header";
import { DashboardView } from "@/components/DashboardView";
import { AgendaView } from "@/components/AgendaView";
import { SettingsView } from "@/components/SettingsView";
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchAllData();
      setLoading(false);
    };
    initApp();
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // 1. Perfil y Nido
      const { data: profile } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.nest_id) {
        setMyNestId(profile.nest_id);
        
        // 2. Cargar Tribu
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('nest_id', profile.nest_id)
          .order('role', { ascending: true });
        setFamilyMembers(profiles || []);

        // 3. Cargar Próximo Evento (Para el Dashboard)
        const { data: events } = await supabase
          .from('events')
          .select('title')
          .eq('nest_id', profile.nest_id)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(1);
        
        if (events && events.length > 0) setNextEventTitle(events[0].title);
      }
    } catch (error) {
      console.error("Error sincronizando Nido:", error);
    }
  };

  // --- LÓGICA DE IA VISION ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    triggerHaptic('medium');
    setIsAiProcessing(true);
    setAiMessage("Leyendo circular...");

    try {
      const fileName = `${myNestId}/${Date.now()}-${file.name}`;
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

  if (loading) return null;

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      <Header />
      
      {/* CONTENIDO PRINCIPAL DINÁMICO */}
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

          {activeTab === "family" && (
            <motion.div key="family" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
               <div className="flex justify-between items-end px-4">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Tribu</h2>
                <AddMemberDialog onMemberAdded={fetchAllData}>
                  <button className="w-20 h-20 bg-sky-500 rounded-[2.2rem] flex items-center justify-center text-white shadow-xl active:scale-90 transition-all">
                    <Plus size={32} strokeWidth={3} />
                  </button>
                </AddMemberDialog>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {familyMembers.map((member) => (
                  <div key={member.id} className="p-10 rounded-[3.5rem] bg-white border border-white shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-3xl font-black text-white mb-6 shadow-inner" style={{ backgroundColor: member.avatar_url || '#cbd5e1' }}>
                      {member.display_name?.charAt(0)}
                    </div>
                    <span className="font-black text-slate-800 text-lg text-center">{member.display_name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
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

      {/* NAVEGACIÓN ÉLITE */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* FAB - BOTÓN DE ACCIÓN FLOTANTE */}
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

      {/* OVERLAY PROCESANDO IA */}
      <AnimatePresence>
        {isAiProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-white/60 backdrop-blur-2xl">
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
        onEventAdded={() => { fetchAllData(); setActiveTab("agenda"); }} 
        initialData={scannedData} 
      />
    </div>
  );
};

export default Index;
