import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus } from "lucide-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

// Componentes del Ecosistema KidUs
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
  // --- ESTADO DE SESIÓN ---
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- ESTADO GLOBAL ---
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
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

  // --- CONTROL DE AUTENTICACIÓN (Lógica Lineal) ---
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Obtener la sesión actual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        // 2. Si hay sesión, intentamos cargar datos pero NO bloqueamos la UI
        if (currentSession) {
          await fetchAllData(currentSession.user.id);
        }
      } catch (error) {
        console.error("Error en la inicialización:", error);
      } finally {
        // 3. Pase lo que pase, quitamos el spinner para que el usuario vea algo
        setLoading(false);
      }
    };

    initializeApp();

    // Listener para cambios de Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchAllData(newSession.user.id);
      } else {
        setMyNestId("");
        setFamilyMembers([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAllData = async (userId: string) => {
    try {
      // Obtenemos el perfil del Guía
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) throw profileError;
      
      // Si no tiene Nido, salimos (DashboardView manejará el estado "Sin Nido")
      if (!profile?.nest_id) return;

      setMyNestId(profile.nest_id);
      
      // Carga paralela de Tribu y Agenda
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
      
    } catch (error) {
      console.error("Error en flujo de sincronía:", error);
      // No lanzamos error para evitar bloqueos de UI
    }
  };

  // --- LÓGICA DE IA ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    triggerHaptic('medium');
    setIsAiProcessing(true);
    try {
      const fileName = `${myNestId || 'unassigned'}/${Date.now()}-${file.name}`;
      await supabase.storage.from('event-attachments').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('event-attachments').getPublicUrl(fileName);
      const { data: aiResult } = await supabase.functions.invoke('process-image-ai', { 
        body: { imageUrl: publicUrl, nest_id: myNestId } 
      });
      setScannedData(aiResult);
      setIsAiProcessing(false);
      setIsDrawerOpen(true);
      triggerHaptic('success');
    } catch (error) {
      setIsAiProcessing(false);
      toast({ title: "Radar offline", variant: "destructive" });
    }
  };

  // --- RENDERIZADO ---

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white space-y-4">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sincronizando Nido</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-[3.5rem] shadow-brisa border border-white">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">KidUs</h1>
            <p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.4em] mt-2">Gestión Familiar Élite</p>
          </div>
          <Auth 
            supabaseClient={supabase} 
            appearance={{ 
              theme: ThemeSupa,
              variables: { default: { colors: { brand: '#0ea5e9', brandAccent: '#0284c7' } } }
            }}
            providers={[]}
            localization={{ variables: { sign_up: { email_label: 'Email del Guía', password_label: 'Contraseña segura' } } }}
          />
        </div>
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
              nestId={myNestId}
            />
          )}

          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <AgendaView />
            </motion.div>
          )}

          {activeTab === "vault" && <VaultView nestId={myNestId} />}

          {activeTab === "settings" && (
            <SettingsView 
              nestId={myNestId} 
              members={familyMembers} 
              onRefresh={() => fetchAllData(session.user.id)}
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
          className={`w-24 h-24 rounded-[3rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-[135deg] bg-slate-900' : 'bg-sky-500 shadow-sky-200'}`}
        >
          <Plus size={44} strokeWidth={3} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => { setIsDrawerOpen(false); setScannedData(null); }} 
        members={familyMembers} 
        onEventAdded={() => { fetchAllData(session.user.id); setActiveTab("agenda"); }} 
        initialData={scannedData} 
      />
    </div>
  );
};

export default Index;
