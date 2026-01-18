import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Users, Calendar, Home as HomeIcon, Plus, Camera, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { SettingsView } from "@/components/SettingsView"; // Componente extraído
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";

const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/kidus-logo-C1AuyFb2.png";

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(15);
    else navigator.vibrate([20, 40, 20]);
  }
};

const KidUsDynamicBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden bg-[#F8FAFC]">
    <div className="absolute top-[-15%] left-[-10%] w-[100%] h-[80%] bg-[#0EA5E9]/10 animate-wave-slow blur-[100px]" />
    <div className="absolute bottom-[-10%] right-[-5%] w-[80%] h-[70%] bg-[#F97316]/10 animate-wave-medium blur-[100px]" />
    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#8B5CF6]/5 animate-float blur-[120px]" />
  </div>
);

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myNestId, setMyNestId] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState("Sincronizando...");
  const [scannedData, setScannedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAllData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchAllData();
      else {
        setLoading(false);
        setFamilyMembers([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      if (myProfile?.nest_id) {
        setMyNestId(myProfile.nest_id);
        const { data: profiles } = await supabase.from('profiles').select('*').eq('nest_id', myProfile.nest_id);
        setFamilyMembers(profiles || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    triggerHaptic('success');
    setIsAiProcessing(true);
    
    // Simulación de pasos de IA para el usuario
    const messages = ["Analizando imagen...", "Escaneando con IA...", "Sincronizando equipo..."];
    let msgIndex = 0;
    const interval = setInterval(() => {
      setAiMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 1500);

    try {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('event-attachments').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('event-attachments').getPublicUrl(fileName);
      const { data: aiResult } = await supabase.functions.invoke('process-image-ai', { body: { imageUrl: publicUrl } });

      setScannedData({
        description: aiResult.description || "Nueva actividad",
        date: aiResult.date || new Date().toISOString().split('T')[0],
        time: aiResult.time || "12:00"
      });
      setIsAiProcessing(false);
      setIsDrawerOpen(true);
      triggerHaptic('success');
      toast({ title: "¡Tribu lista!", description: "Actividad detectada con éxito." });
      clearInterval(interval);
    } catch (error) {
      clearInterval(interval);
      setIsAiProcessing(false);
      toast({ title: "Aviso", description: "No se pudo procesar la imagen.", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <KidUsDynamicBackground />
      <div className="animate-float w-20 h-20 bg-primary rounded-[2.5rem] shadow-haptic flex items-center justify-center border-4 border-white z-10">
        <Loader2 className="text-white animate-spin" size={32} />
      </div>
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-[#F8FAFC] relative overflow-hidden font-sans">
        <KidUsDynamicBackground />
        <div className="relative z-10 text-center space-y-12 w-full max-w-sm">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="w-36 h-36 bg-white/70 backdrop-blur-2xl rounded-[3.5rem] flex items-center justify-center mx-auto shadow-brisa border border-white/50">
              <img src={LOGO_URL} alt="KidUs" className="w-24 h-24 object-contain" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-slate-800 tracking-tighter">KidUs</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Armonía para tu Tribu</p>
          </div>
          <Button 
            onClick={() => { triggerHaptic('soft'); supabase.auth.signInWithOAuth({ provider: 'google' }); }} 
            className="w-full h-20 rounded-5xl bg-white border border-slate-100 text-slate-800 font-black shadow-brisa active:scale-95 transition-all"
          >
            SINCRO CON GOOGLE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-32 font-sans bg-[#F8FAFC]">
      <KidUsDynamicBackground />
      <Header />
      
      <main className="container mx-auto px-6 pt-6 max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <h1 className="text-5xl font-black text-slate-800 leading-[1.1] tracking-tight px-2">
                Nido en <br/> <span className="text-primary">equilibrio.</span>
              </h1>
              
              <div className="p-10 rounded-7xl bg-white/70 backdrop-blur-2xl shadow-tribu-card border border-white/50">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">Estado de la Tribu</label>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{familyMembers.length} integrantes</h3>
                <p className="text-slate-500 font-medium">Todo tu equipo está sincronizado.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <button onClick={() => { triggerHaptic('soft'); setActiveTab("agenda"); }} className="p-10 rounded-6xl flex flex-col items-center gap-4 bg-primary text-white shadow-haptic active:scale-95 transition-all">
                  <Calendar size={28} strokeWidth={3} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Agenda</span>
                </button>
                <button onClick={() => { triggerHaptic('soft'); setActiveTab("family"); }} className="p-10 rounded-6xl flex flex-col items-center gap-4 bg-white/80 text-secondary border border-white shadow-brisa active:scale-95 transition-all">
                  <Users size={28} strokeWidth={3} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Tribu</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "agenda" && <div className="animate-in fade-in duration-500"><AgendaView /></div>}

          {activeTab === "family" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <h2 className="text-4xl font-black text-slate-800">Tribu</h2>
                <AddMemberDialog onMemberAdded={fetchAllData}>
                  <button onClick={() => triggerHaptic('soft')} className="w-16 h-16 bg-primary rounded-4xl flex items-center justify-center text-white shadow-haptic active:scale-90 transition-all">
                    <Plus size={32} strokeWidth={3} />
                  </button>
                </AddMemberDialog>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {familyMembers.map((member) => (
                  <div key={member.id} className="p-8 rounded-7xl flex flex-col items-center bg-white/70 backdrop-blur-2xl border border-white/50 shadow-brisa transition-all">
                    <div className="w-20 h-20 rounded-5xl flex items-center justify-center text-2xl font-black text-white shadow-haptic mb-4" style={{ backgroundColor: member.avatar_url || '#0EA5E9' }}>
                      {member.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-black text-slate-800 text-sm text-center line-clamp-1">{member.display_name}</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">{member.role === 'autonomous' ? 'Guía' : 'Peque'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LA NUEVA VISTA DE AJUSTES CONECTADA */}
          {activeTab === "settings" && (
            <div className="animate-in fade-in duration-500">
              <SettingsView nestId={myNestId} members={familyMembers} />
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav className="fixed bottom-0 left-0 right-0 h-28 bg-white/70 backdrop-blur-2xl border-t border-white/20 flex justify-around items-center px-10 z-40 rounded-t-7xl shadow-brisa">
        {[
          { id: "home", icon: HomeIcon }, { id: "agenda", icon: Calendar }, { id: "family", icon: Users }, { id: "settings", icon: Settings }
        ].map((tab) => (
          <button key={tab.id} onClick={() => { triggerHaptic('soft'); setActiveTab(tab.id); }} className={`p-4 transition-all ${activeTab === tab.id ? "text-primary scale-125 -translate-y-3" : "text-slate-300"}`}>
            <tab.icon size={28} strokeWidth={activeTab === tab.id ? 3 : 2} />
          </button>
        ))}
      </nav>

      {/* FAB - BOTÓN DE ACCIÓN FLOTANTE */}
      <div className="fixed bottom-36 right-8 z-50 flex flex-col items-center">
        <div className={`flex flex-col gap-6 mb-6 transition-all duration-500 ${isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
          <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); fileInputRef.current?.click(); }} className="w-16 h-16 bg-accent rounded-5xl flex items-center justify-center text-white shadow-haptic border-4 border-white active:scale-90">
            <Camera size={28} strokeWidth={2.5} />
          </button>
          <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); setIsDrawerOpen(true); }} className="w-16 h-16 bg-secondary rounded-5xl flex items-center justify-center text-white shadow-haptic border-4 border-white active:scale-90">
            <Plus size={28} strokeWidth={2.5} />
          </button>
        </div>
        <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(!isFabOpen); }} className={`w-[76px] h-[76px] rounded-6xl flex items-center justify-center text-white shadow-tribu-card transition-all ${isFabOpen ? 'rotate-45 bg-slate-800' : 'bg-primary'}`}>
          <Plus size={40} strokeWidth={3} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      {/* OVERLAY DE PROCESAMIENTO IA */}
      {isAiProcessing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-3xl">
          <div className="flex flex-col items-center gap-8 text-center p-12">
            <div className="w-24 h-24 bg-primary/10 rounded-7xl flex items-center justify-center animate-wave-slow shadow-inner">
              <Camera className="text-primary animate-pulse" size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800">Sincronizando...</h3>
              <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">{aiMessage}</p>
            </div>
          </div>
        </div>
      )}

      <ManualEventDrawer isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setScannedData(null); }} members={familyMembers} onEventAdded={fetchAllData} initialData={scannedData} />
    </div>
  );
};

export default Index;
