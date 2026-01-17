import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Users, Calendar, Home as HomeIcon, Plus, 
  Clock, User, Camera, Image, FileText, Edit 
} from "lucide-react";
import Header from "@/components/Header";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";
import { UploadDocumentDrawer } from "@/components/UploadDocumentDrawer";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Control de carga inicial
  const [inviteCode, setInviteCode] = useState("");
  const [myNestId, setMyNestId] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'manual' | 'camera' | 'gallery' | 'pdf'>('manual');

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
        setShowOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!myProfile || !myProfile.nest_id) {
        setShowOnboarding(true);
        setMyNestId("");
      } else {
        setMyNestId(myProfile.nest_id);
        setShowOnboarding(false);
        
        const { data: profiles } = await supabase.from('profiles').select('*').eq('nest_id', myProfile.nest_id);
        const { data: eventData } = await supabase.from('events').select('*').eq('nest_id', myProfile.nest_id).order('start_time', { ascending: true });
        
        setFamilyMembers(profiles || []);
        setEvents(eventData || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewNest = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const randomPart = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      const newId = `KID-${randomPart}`;

      const { error } = await supabase
        .from('profiles')
        .update({ nest_id: newId })
        .eq('id', user.id);
      
      if (error) throw error;

      toast({ title: "Nido Creado", description: `Tu código: ${newId}` });
      
      // Actualización forzada del estado para saltar el glitch
      setMyNestId(newId);
      setShowOnboarding(false);
      await fetchAllData(); 
    } catch (err) {
      toast({ title: "Error", description: "No se pudo crear el nido.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkNest = async () => {
    if (!inviteCode.startsWith('KID-')) {
      toast({ title: "Código inválido", description: "Usa el formato KID-XXXXXX", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: partnerProfile } = await supabase.from('profiles').select('nest_id').eq('nest_id', inviteCode.toUpperCase()).maybeSingle();
      
      if (!partnerProfile) {
        toast({ title: "Error", description: "Nido no encontrado.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ nest_id: partnerProfile.nest_id }).eq('id', user?.id);
      
      toast({ title: "¡Tándem Conectado!", description: "Nido vinculado con éxito." });
      setMyNestId(partnerProfile.nest_id);
      setShowOnboarding(false);
      await fetchAllData();
    } catch (err) {
      toast({ title: "Error", description: "Error al vincular.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // PANTALLA DE CARGA (Evita el glitch del dashboard relleno)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFBFF]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl rotate-12" />
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Preparando el nido...</p>
        </div>
      </div>
    );
  }

  // LOGIN
  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAFBFF] font-nunito relative overflow-hidden">
        <div className="wave-bg opacity-30 scale-150" />
        <div className="relative z-10 text-center space-y-10">
          <div className="w-24 h-24 bg-blue-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-12">
            <span className="text-4xl font-black text-white -rotate-12">K</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-gray-800 tracking-tighter">KidUs</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">Harmony & Focus</p>
          </div>
          <Button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="w-full max-w-xs h-16 rounded-[2rem] bg-white border-2 border-gray-100 text-gray-700 font-black flex gap-4 shadow-xl active:scale-95">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            ENTRAR CON GOOGLE
          </Button>
        </div>
      </div>
    );
  }

  // ONBOARDING
  if (showOnboarding) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white font-nunito relative overflow-hidden">
        <div className="wave-bg opacity-20" />
        <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
               <HomeIcon className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Tu Nido</h2>
            <p className="text-gray-500 font-medium text-sm px-8">Parece que aún no tienes un espacio familiar. ¿Cómo prefieres empezar?</p>
          </div>
          <div className="grid gap-4">
            <button onClick={handleCreateNewNest} className="p-6 bg-blue-50 hover:bg-blue-100 rounded-[2.5rem] border-2 border-blue-100 text-left transition-all active:scale-95">
              <h4 className="font-black text-blue-600 text-lg">Crear mi propio Nido</h4>
              <p className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Para uso personal o nueva familia</p>
            </button>
            <div className="p-6 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 space-y-4">
              <div>
                <h4 className="font-black text-indigo-600 text-lg">Unirme a mi pareja</h4>
                <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1 tracking-widest">Introduce su código KID-</p>
              </div>
              <div className="flex gap-2">
                <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="KID-XXXXXX" className="flex-1 h-12 rounded-xl border-none px-4 font-black tracking-widest text-sm shadow-inner" />
                <Button onClick={handleLinkNest} className="h-12 px-4 rounded-xl bg-indigo-600 text-white font-black">UNIRME</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-nunito bg-[#FAFBFF]">
      <div className="wave-bg" />
      <Header />
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10 pb-32">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-2">
              <h1 className="text-4xl font-black text-gray-800 leading-tight">Tu Nido está <br/> <span className="text-blue-500">en calma.</span></h1>
            </div>

            <div className="relative glass-card p-8 rounded-[3rem] bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm">
                <div className="px-4 py-1.5 bg-orange-100 rounded-full w-fit mb-4"><span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Próxima Tarea</span></div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Sincronización lista</h3>
                <p className="text-gray-500 font-medium">Añade tu primera actividad en la agenda.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-blue-50/50 active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white"><Calendar size={20} /></div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Agenda</span>
              </button>
              <button onClick={() => setActiveTab("family")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-orange-50/50 active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white"><Users size={20} /></div>
                <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <AgendaView />}
        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-black text-gray-800">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData}>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/40 border border-white/60 rounded-2xl shadow-sm">
                  <Plus size={18} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-600 uppercase">Nuevo</span>
                </button>
              </AddMemberDialog>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="glass-card p-6 flex flex-col items-center bg-white/60">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 text-2xl font-black text-blue-500">{member.display_name?.charAt(0).toUpperCase()}</div>
                  <span className="font-black text-gray-700 tracking-tight">{member.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black px-2 text-gray-800">Ajustes</h2>
            <div className="glass-card p-8 space-y-6 bg-indigo-50/30 border-none rounded-[3rem]">
              <div className="p-4 bg-white/80 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Tu código de nido</p>
                <p className="text-2xl font-black tracking-[0.3em] text-indigo-600">{myNestId}</p>
              </div>
              <div className="space-y-3">
                <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="CÓDIGO PAREJA..." className="w-full h-14 rounded-2xl bg-white border-none px-4 text-center font-black text-sm" />
                <Button onClick={handleLinkNest} className="w-full h-14 rounded-2xl bg-gray-800 text-white font-black">FUSIONAR NIDOS</Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start h-16 font-bold text-red-500" onClick={() => supabase.auth.signOut()}>Cerrar Sesión</Button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/60 backdrop-blur-2xl border-t border-white/30 flex justify-around items-center px-8 z-40 rounded-t-[3rem] shadow-lg">
        <button onClick={() => setActiveTab("home")} className={`transition-all ${activeTab === "home" ? "text-blue-500 scale-110" : "text-gray-300"}`}><HomeIcon size={24} /></button>
        <button onClick={() => setActiveTab("agenda")} className={`transition-all ${activeTab === "agenda" ? "text-blue-500 scale-110" : "text-gray-300"}`}><Calendar size={24} /></button>
        <button onClick={() => setActiveTab("family")} className={`transition-all ${activeTab === "family" ? "text-blue-500 scale-110" : "text-gray-300"}`}><Users size={24} /></button>
        <button onClick={() => setActiveTab("settings")} className={`transition-all ${activeTab === "settings" ? "text-blue-500 scale-110" : "text-gray-300"}`}><Settings size={24} /></button>
      </nav>

      <div className="fixed bottom-32 right-8 z-50">
          <button onClick={() => setIsFabOpen(!isFabOpen)} className={`w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isFabOpen ? 'rotate-45 bg-gray-800' : ''}`}><Plus size={32} /></button>
          {isFabOpen && (
            <div className="absolute bottom-20 right-0 flex flex-col gap-4 animate-in slide-in-from-bottom-4">
              <button onClick={() => { setIsDrawerOpen(true); setDialogType('manual'); setIsFabOpen(false); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg"><Edit size={20} className="text-blue-500" /></button>
            </div>
          )}
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-500 z-10">
            <ManualEventDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} members={familyMembers} onEventAdded={fetchAllData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
