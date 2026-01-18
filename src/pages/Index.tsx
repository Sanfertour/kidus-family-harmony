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

const LOGO_URL = "https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/kidus-logo-C1AuyFb2.png";

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else navigator.vibrate([20, 30, 20]);
  }
};

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
      
      let { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!myProfile || !myProfile.role) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            display_name: user.user_metadata.full_name || 'Nuevo Guía',
            role: 'autonomous',
            nest_id: myProfile?.nest_id || crypto.randomUUID()
          })
          .select()
          .single();
        myProfile = newProfile;
      }
      
      if (myProfile?.nest_id) {
        setMyNestId(myProfile.nest_id);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    triggerHaptic('success');
    setIsAiProcessing(true);
    
    const messages = ["Escaneando...", "IA trabajando...", "Sincronizando..."];
    let msgIndex = 0;
    const interval = setInterval(() => {
      setAiMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 1500);

    try {
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('event-attachments').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('event-attachments').getPublicUrl(fileName);
      
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('process-image-ai', { 
        body: { imageUrl: publicUrl } 
      });

      if (aiError) throw aiError;

      setScannedData({
        description: aiResult.description || "Nueva actividad",
        date: aiResult.date || new Date().toISOString().split('T')[0],
        time: aiResult.time || "12:00",
        location: aiResult.location || ""
      });
      
      setIsAiProcessing(false);
      setIsDrawerOpen(true);
      clearInterval(interval);
    } catch (error) {
      clearInterval(interval);
      setIsAiProcessing(false);
      toast({ title: "Error de lectura", description: "La IA no pudo procesar la imagen.", variant: "destructive" });
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-transparent">
      <div className="relative">
        <div className="absolute inset-0 animate-ping bg-[#0EA5E9]/20 rounded-[3rem]" />
        <div className="w-24 h-24 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex items-center justify-center z-10 animate-pulse border border-white/50">
          <Loader2 className="text-[#0EA5E9] animate-spin" size={40} strokeWidth={3} />
        </div>
      </div>
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-transparent relative overflow-hidden">
        <div className="relative z-10 text-center space-y-12 w-full max-w-sm">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="w-36 h-36 bg-white/70 backdrop-blur-2xl rounded-[3.5rem] shadow-xl flex items-center justify-center mx-auto border border-white/50">
              <img src={LOGO_URL} alt="KidUs" className="w-24 h-24 object-contain" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-slate-800 tracking-tighter font-nunito">KidUs</h1>
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Armonía para tu Tribu</p>
          </div>
          <Button 
            onClick={() => { triggerHaptic('soft'); supabase.auth.signInWithOAuth({ provider: 'google' }); }} 
            className="w-full h-20 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-2 border-white text-slate-800 font-black shadow-xl active:scale-95 transition-all text-lg tracking-tight hover:bg-white"
          >
            SINCRO CON GOOGLE
          </Button>
        </div>
      </div>
    );
  }

 return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent font-sans">
      <Header />
      
      {/* ELIMINADO bg-slate-50 PARA QUE SE VEAN LAS OLAS */}
      <main className="container mx-auto px-6 pt-6 max-w-md relative z-10 pb-44">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div 
              key="home" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="space-y-8"
            >
              {/* SALUDO DINÁMICO SEGÚN MOMENTO DEL DÍA */}
              <div className="px-2">
                <h1 className="text-5xl font-black text-slate-800 leading-[1.1] tracking-tighter font-nunito">
                  {new Date().getHours() < 12 ? "Buen día," : new Date().getHours() < 20 ? "Energía alta," : "Nido en calma,"}<br/> 
                  <span className="text-[#0EA5E9]">Guía.</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Rendimiento de la Tribu</p>
              </div>

              {/* DASHBOARD CARD - GLASSMOPHISM PRO */}
              <div className="p-10 rounded-[3.5rem] bg-white/60 backdrop-blur-2xl border border-white/40 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                <div className="relative z-10">
                  <label className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.2em] mb-4 block">Sincronía Actual</label>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-5xl font-black text-slate-800">{familyMembers.length}</h3>
                    <span className="text-xl font-bold text-slate-400 tracking-tight">integrantes</span>
                  </div>
                  <p className="text-slate-500 font-bold text-sm tracking-tight mt-2">Tu equipo está fluyendo en armonía.</p>
                </div>
                {/* Decoración sutil de fondo para la tarjeta */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#0EA5E9]/5 rounded-full blur-2xl group-hover:bg-[#0EA5E9]/10 transition-colors duration-700" />
              </div>
              
              {/* ACCESOS RÁPIDOS CON FEEDBACK HÁPTICO */}
              <div className="grid grid-cols-2 gap-5">
                <button 
                  onClick={() => { triggerHaptic('soft'); setActiveTab("agenda"); }} 
                  className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 bg-[#0EA5E9] text-white shadow-2xl active:scale-95 transition-all group"
                >
                  <Calendar size={28} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Agenda</span>
                </button>
                <button 
                  onClick={() => { triggerHaptic('soft'); setActiveTab("family"); }} 
                  className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 bg-white/60 backdrop-blur-xl text-[#F97316] border border-white/40 shadow-xl active:scale-95 transition-all group"
                >
                  <Users size={28} strokeWidth={3} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Tribu</span>
                </button>
              </div>

              {/* HIT DEL DÍA - MENTALIDAD DE EQUIPO ÉLITE */}
              <div className="mx-2 p-6 rounded-[2.5rem] bg-slate-800 text-white/90 flex items-center gap-4 shadow-lg">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#0EA5E9] rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Siguiente hito</p>
                  <p className="text-sm font-bold">Logística del equipo lista</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "agenda" && (
            <motion.div key="agenda" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <AgendaView />
            </motion.div>
          )}
          {activeTab === "family" && (
            <motion.div key="family" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-10">
              <div className="flex justify-between items-end px-4">
                <div>
                  <h2 className="text-5xl font-black text-slate-800 tracking-tighter font-nunito">Tribu</h2>
                  <p className="text-[10px] font-black text-[#F97316] uppercase tracking-widest mt-1">Gestión del Nido</p>
                </div>
                <AddMemberDialog onMemberAdded={fetchAllData}>
                  <button onClick={() => triggerHaptic('soft')} className="w-16 h-16 bg-[#0EA5E9] rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all">
                    <Plus size={32} strokeWidth={3} />
                  </button>
                </AddMemberDialog>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {familyMembers.map((member) => (
                  <div key={member.id} className="p-8 rounded-[3rem] bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm flex flex-col items-center hover:shadow-md transition-all">
                    <div className="w-20 h-20 rounded-[2.2rem] flex items-center justify-center text-2xl font-black text-white shadow-lg mb-4" style={{ backgroundColor: member.avatar_url || '#0EA5E9' }}>
                      {member.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-black text-slate-800 text-sm text-center line-clamp-1">{member.display_name}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                      {member.role === 'autonomous' ? 'Guía' : 'Tribu'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <SettingsView nestId={myNestId} members={familyMembers} onRefresh={fetchAllData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* NAVEGACIÓN INFERIOR GLASS */}
      <nav className="fixed bottom-0 left-0 right-0 h-28 bg-white/60 backdrop-blur-3xl border-t border-white/20 flex justify-around items-center px-10 z-[40] rounded-t-[3.5rem] shadow-2xl">
        {[
          { id: "home", icon: HomeIcon }, { id: "agenda", icon: Calendar }, { id: "family", icon: Users }, { id: "settings", icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => { triggerHaptic('soft'); setActiveTab(tab.id); }} 
            className={`p-4 transition-all duration-400 ${activeTab === tab.id ? "text-[#0EA5E9] scale-125 -translate-y-4" : "text-slate-400"}`}
          >
            <tab.icon size={26} strokeWidth={activeTab === tab.id ? 3 : 2} />
          </button>
        ))}
      </nav>

      {/* FAB DINÁMICO */}
      <div className="fixed bottom-36 right-8 z-50 flex flex-col items-center">
        <div className={`flex flex-col gap-6 mb-6 transition-all duration-500 ${isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-50 pointer-events-none'}`}>
          <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); fileInputRef.current?.click(); }} className="w-16 h-16 bg-[#0EA5E9] rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-90 transition-all">
            <Camera size={28} strokeWidth={3} />
          </button>
          <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(false); setIsDrawerOpen(true); }} className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-90 transition-all">
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
        <button onClick={() => { triggerHaptic('soft'); setIsFabOpen(!isFabOpen); }} className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-45 bg-slate-800' : 'bg-[#0EA5E9]'}`}>
          <Plus size={36} strokeWidth={3} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />

      <AnimatePresence>
        {isAiProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-3xl">
            <div className="flex flex-col items-center gap-8 text-center p-12">
              <div className="w-28 h-28 bg-[#0EA5E9]/10 rounded-[3rem] flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[#0EA5E9]/20 rounded-[3rem] animate-ping" />
                <Camera className="text-[#0EA5E9] relative z-10" size={44} />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black text-slate-800 tracking-tighter">IA KidUs</h3>
                <p className="text-[#0EA5E9] font-black text-xs uppercase tracking-[0.4em]">{aiMessage}</p>
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
