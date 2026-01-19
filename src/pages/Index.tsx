import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Users, Calendar, Home as HomeIcon, Plus, Camera, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { SettingsView } from "@/components/SettingsView";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";
import { triggerHaptic } from "@/utils/haptics"; // Importación corregida

const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/kidus-logo-C1AuyFb2.png";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myNestId, setMyNestId] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState("Analizando...");
  const [scannedData, setScannedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAllData();
      else setLoading(false);
    });
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // 1. Obtener perfil vinculado al Nido
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (myProfile?.nest_id) {
        setMyNestId(myProfile.nest_id);
        
        // 2. Cargar toda la Tribu del Nido
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('nest_id', myProfile.nest_id)
          .order('role', { ascending: true });
        
        setFamilyMembers(profiles || []);
      }
    } catch (error) {
      console.error("Error cargando la tribu:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica IA (Mantenida y Estilizada) ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    triggerHaptic('medium');
    setIsAiProcessing(true);
    
    // Simulación de pasos de IA para feedback UX
    const messages = ["Escaneando circular...", "IA extrayendo fechas...", "Sincronizando Nido..."];
    let msgIndex = 0;
    const interval = setInterval(() => {
      setAiMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 1500);

    try {
      const fileName = `${myNestId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-attachments')
        .getPublicUrl(fileName);
      
      // Aquí invocas tu Edge Function de OpenAI/Gemini
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('process-image-ai', { 
        body: { imageUrl: publicUrl, nest_id: myNestId } 
      });

      if (aiError) throw aiError;

      setScannedData({
        title: aiResult.title,
        date: aiResult.date,
        time: aiResult.time,
        description: aiResult.description
      });
      
      clearInterval(interval);
      setIsAiProcessing(false);
      setIsDrawerOpen(true);
      triggerHaptic('success');
      
    } catch (error) {
      clearInterval(interval);
      setIsAiProcessing(false);
      toast({ title: "Error de IA", description: "No pudimos procesar la imagen.", variant: "destructive" });
    }
  };

  if (loading) return null; // El App.tsx ya maneja el loading principal

  return (
    <div className="relative min-h-screen w-full font-sans">
      <Header />
      
      <main className="container mx-auto px-6 pt-10 max-w-md relative z-10 pb-44">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <header className="px-2">
                <h1 className="text-6xl font-black text-slate-900 leading-[0.85] tracking-tighter">
                  {new Date().getHours() < 12 ? "Buen día," : "Nido en,"}<br/> 
                  <span className="text-sky-500">calma.</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-6">Estado de la Tribu</p>
              </header>

              {/* CARD DE ESTADO ÉLITE */}
              <div className="p-12 rounded-[4rem] bg-white/40 backdrop-blur-3xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden group transition-all hover:shadow-sky-100/50">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Sincronía Total</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-7xl font-black text-slate-900 tracking-tighter">{familyMembers.length}</h3>
                    <span className="text-xl font-bold text-slate-400">Guías</span>
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/10 transition-colors" />
              </div>
              
              {/* ACCESOS RÁPIDOS */}
              <div className="grid grid-cols-2 gap-6">
                <button 
                  onClick={() => { triggerHaptic('soft'); setActiveTab("agenda"); }} 
                  className="p-12 rounded-[3.5rem] flex flex-col items-center gap-5 bg-slate-900 text-white shadow-2xl active:scale-95 transition-all"
                >
                  <Calendar size={32} strokeWidth={2.5} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Agenda</span>
                </button>
                <button 
                  onClick={() => { triggerHaptic('soft'); setActiveTab("family"); }} 
                  className="p-12 rounded-[3.5rem] flex flex-col items-center gap-5 bg-white border border-slate-100 text-slate-900 shadow-xl active:scale-95 transition-all"
                >
                  <Users size={32} strokeWidth={2.5} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Tribu</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <AgendaView />
            </motion.div>
          )}

          {activeTab === "family" && (
            <motion.div key="family" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
               <div className="flex justify-between items-end px-4">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Tribu</h2>
                <AddMemberDialog onMemberAdded={fetchAllData}>
                  <button className="w-20 h-20 bg-sky-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl active:scale-90 transition-all">
                    <Plus size={32} strokeWidth={3} />
                  </button>
                </AddMemberDialog>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {familyMembers.map((member) => (
                  <div key={member.id} className="p-10 rounded-[3.5rem] bg-white border border-slate-50 shadow-sm flex flex-col items-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 mb-6 overflow-hidden">
                      {member.avatar_url ? <img src={member.avatar_url} /> : member.display_name?.charAt(0)}
                    </div>
                    <span className="font-black text-slate-900 text-lg">{member.display_name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* NAVBAR BRISA */}
      <nav className="fixed bottom-0 left-0 right-0 h-32 bg-white/70 backdrop-blur-[40px] border-t border-white flex justify-around items-center px-12 z-[100] rounded-t-[4rem] shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
        {[
          { id: "home", icon: HomeIcon }, { id: "agenda", icon: Calendar }, { id: "family", icon: Users }, { id: "settings", icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => { triggerHaptic('soft'); setActiveTab(tab.id); }} 
            className={`p-5 transition-all duration-500 ${activeTab === tab.id ? "text-sky-500 scale-125 -translate-y-6 bg-white rounded-full shadow-lg" : "text-slate-300 hover:text-slate-400"}`}
          >
            <tab.icon size={28} strokeWidth={activeTab === tab.id ? 3 : 2} />
          </button>
        ))}
      </nav>

      {/* FAB - BOTÓN DE ACCIÓN FLOTANTE (ESTILO ÉLITE) */}
      <div className="fixed bottom-40 right-10 z-[110]">
        <div className={`flex flex-col gap-6 mb-8 transition-all duration-700 ${isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
          <button onClick={() => { triggerHaptic('medium'); setIsFabOpen(false); fileInputRef.current?.click(); }} className="w-20 h-20 bg-sky-500 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl border-4 border-white active:scale-90 transition-all hover:rotate-6">
            <Camera size={32} />
          </button>
          <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); setIsDrawerOpen(true); }} className="w-20 h-20 bg-orange-500 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl border-4 border-white active:scale-90 transition-all hover:-rotate-6">
            <Plus size={32} />
          </button>
        </div>
        <button 
          onClick={() => { triggerHaptic('soft'); setIsFabOpen(!isFabOpen); }} 
          className={`w-24 h-24 rounded-[3rem] flex items-center justify-center text-white shadow-2xl transition-all duration-700 ${isFabOpen ? 'rotate-[135deg] bg-slate-900' : 'bg-sky-500 hover:scale-105'}`}
        >
          <Plus size={44} strokeWidth={3} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      {/* OVERLAY PROCESANDO IA */}
      <AnimatePresence>
        {isAiProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/40 backdrop-blur-2xl">
            <div className="flex flex-col items-center gap-10 text-center p-16 bg-white rounded-[5rem] shadow-2xl border border-white">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-400/20 rounded-full animate-ping" />
                <div className="w-32 h-32 bg-sky-50 rounded-[3rem] flex items-center justify-center text-sky-500 relative z-10">
                  <Camera size={48} className="animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Visión IA</h3>
                <p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.6em] animate-pulse">{aiMessage}</p>
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
