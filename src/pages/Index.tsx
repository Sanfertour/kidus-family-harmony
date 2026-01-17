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
  // --- ESTADOS DE SESIÓN Y DATOS ---
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [myNestId, setMyNestId] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // --- ESTADOS DE UI ---
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'manual' | 'camera' | 'gallery' | 'pdf'>('manual');

  const { toast } = useToast();

  // --- LÓGICA DE AUTENTICACIÓN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchAllData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchAllData();
      } else {
        setFamilyMembers([]);
        setEvents([]);
        setMyNestId("");
        setShowOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      localStorage.clear();
      toast({ title: "Sesión cerrada", description: "Vuelve pronto al nido." });
    }
  };

  // --- CARGA DE DATOS FILTRADA POR NEST_ID ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Obtener perfil del usuario actual
      const { data: myProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // 2. Si no tiene nest_id o no existe perfil, activamos onboarding
      if (!myProfile || !myProfile.nest_id) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }

      // 3. Si tiene nest_id, cargamos el resto de datos del nido
      setShowOnboarding(false);
      setMyNestId(myProfile.nest_id);

      const { data: profiles } = await supabase.from('profiles').select('*').eq('nest_id', myProfile.nest_id);
      const { data: eventData } = await supabase.from('events').select('*').eq('nest_id', myProfile.nest_id).order('start_time', { ascending: true });
      
      setFamilyMembers(profiles || []);
      setEvents(eventData || []);
      
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIONES DE NIDO ---
  const handleCreateNewNest = async () => {
    const newId = `KID-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({ nest_id: newId }).eq('id', user?.id);
    
    if (!error) {
      toast({ title: "Nido Creado", description: "Ya puedes empezar a organizar tu familia." });
      fetchAllData();
    }
  };

  const handleLinkNest = async () => {
    if (!inviteCode.startsWith('KID-')) {
      toast({ title: "Código inválido", description: "Usa el formato KID-XXXX", variant: "destructive" });
      return;
    }
    const { data: partnerProfile, error } = await supabase.from('profiles').select('nest_id').eq('nest_id', inviteCode.toUpperCase()).maybeSingle();
    
    if (error || !partnerProfile) {
      toast({ title: "Error", description: "Código no encontrado.", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { error: updateError } = await supabase.from('profiles').update({ nest_id: partnerProfile.nest_id }).eq('id', user?.id);
    
    if (!updateError) {
      toast({ title: "¡Tándem Conectado!", description: "Nido vinculado con éxito." });
      fetchAllData();
    }
  };

  const handleFabAction = (type: 'manual' | 'camera' | 'gallery' | 'pdf') => {
    setDialogType(type);
    setIsDrawerOpen(true);
    setIsFabOpen(false);
  };

  // --- VISTA 1: PANTALLA DE LOGIN ---
  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAFBFF] font-nunito relative overflow-hidden">
        <div className="wave-bg opacity-30 scale-150" />
        <div className="relative z-10 text-center space-y-10 animate-in fade-in zoom-in duration-1000">
          <div className="w-24 h-24 bg-blue-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 rotate-12 transition-transform hover:rotate-0 duration-500">
            <span className="text-4xl font-black text-white -rotate-12 hover:rotate-0 transition-transform">K</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-gray-800 tracking-tighter">KidUs</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">Harmony & Focus</p>
          </div>
          <Button 
            onClick={handleGoogleLogin}
            className="w-full max-w-xs h-16 rounded-[2rem] bg-white border-2 border-gray-100 text-gray-700 font-black flex gap-4 hover:bg-gray-50 shadow-xl transition-all active:scale-95 group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
            ENTRAR CON GOOGLE
          </Button>
          <p className="text-[10px] text-gray-400 font-medium px-8 italic">Organiza tu vida familiar con la calma de un santuario Zen.</p>
        </div>
      </div>
    );
  }

  // --- VISTA 2: ONBOARDING (ELECCIÓN DE NIDO) ---
  if (showOnboarding) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white font-nunito relative overflow-hidden">
        <div className="wave-bg opacity-20" />
        <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
               <HomeIcon className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Tu Nido</h2>
            <p className="text-gray-500 font-medium">¿Cómo quieres empezar hoy?</p>
          </div>

          <div className="grid gap-4">
            <button 
              onClick={handleCreateNewNest}
              className="p-6 bg-blue-50 hover:bg-blue-100 rounded-[2.5rem] border-2 border-blue-100 text-left transition-all active:scale-95 group"
            >
              <h4 className="font-black text-blue-600 text-lg">Crear mi propio Nido</h4>
              <p className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Uso personal o nuevo equipo</p>
            </button>

            <div className="p-6 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 space-y-4">
              <div>
                <h4 className="font-black text-indigo-600 text-lg">Unirme a mi pareja</h4>
                <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1 tracking-widest">Si ya tienen un código KID-</p>
              </div>
              <div className="flex gap-2">
                <input 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="KID-XXXXXX"
                  className="flex-1 h-12 rounded-xl border-none px-4 font-black tracking-widest text-sm shadow-inner uppercase"
                />
                <Button onClick={handleLinkNest} className="h-12 px-4 rounded-xl bg-indigo-600 text-white font-black">UNIRME</Button>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="w-full text-gray-400 font-bold">Cancelar y Salir</Button>
        </div>
      </div>
    );
  }

  // --- VISTA 3: DASHBOARD PRINCIPAL ---
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-nunito bg-[#FAFBFF]">
      <div className="wave-bg" />
      <Header />
      
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10 pb-32">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-2">
              <h1 className="text-4xl font-black text-gray-800 leading-tight">
                Tu Nido está <br/> <span className="text-blue-500">en calma.</span>
              </h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 italic">Dashboard Familiar</p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[3rem] blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative glass-card p-8 rounded-[3rem] bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="px-4 py-1.5 bg-orange-100 rounded-full">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Próxima Tarea</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Recoger de Fútbol</h3>
                <p className="text-gray-500 font-medium flex items-center gap-2">
                  <Clock size={16} className="text-blue-500" /> 17:30 - 18:30
                </p>
                <div className="mt-8 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Responsable</p>
                    <p className="text-sm font-bold text-gray-700">Papá (Tú)</p>
                  </div>
                  <button className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-xs font-black text-blue-600 active:scale-95 transition-all">HECHO</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-blue-50/50 group active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform">
                  <Calendar size={20} />
                </div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest text-center">Agenda</span>
              </button>
              
              <button onClick={() => setActiveTab("family")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-orange-50/50 group active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100 group-hover:-rotate-12 transition-transform">
                  <Users size={20} />
                </div>
                <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest text-center">Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <div className="animate-in slide-in-from-right-4 duration-500"><AgendaView /></div>}

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
                <div key={member.id} className="glass-card p-6 flex flex-col items-center group transition-all">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3 shadow-inner">
                    <span className="text-2xl font-black text-blue-500">{member.display_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="font-black text-gray-700 tracking-tight">{member.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in zoom-in-95 space-y-6">
            <h2 className="text-3xl font-black px-2 text-gray-800">Ajustes</h2>
            <div className="glass-card p-8 space-y-6 bg-indigo-50/30 border-none shadow-sm rounded-[3rem]">
              <div className="p-4 bg-white/80 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Tu código de nido</p>
                <p className="text-2xl font-black tracking-[0.3em] text-indigo-600 uppercase">{myNestId || "---"}</p>
              </div>
              <div className="space-y-3">
                <input 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO PAREJA..." 
                  className="w-full h-14 rounded-2xl bg-white border-none px-4 text-center font-black uppercase text-sm shadow-sm" 
                />
                <Button onClick={handleLinkNest} className="w-full h-14 rounded-2xl bg-gray-800 text-white font-black">FUSIONAR NIDOS</Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start h-16 rounded-[2rem] font-bold text-red-500 hover:bg-red-50" onClick={handleSignOut}>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mr-4">🚪</div>
              Cerrar Sesión
            </Button>
          </div>
        )}
      </main>

      {/* NAV INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/60 backdrop-blur-2xl border-t border-white/30 flex justify-around items-center px-8 z-40 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center transition-all ${activeTab === "home" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <HomeIcon size={24} />
        </button>
        <button onClick={() => setActiveTab("agenda")} className={`flex flex-col items-center transition-all ${activeTab === "agenda" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <Calendar size={24} />
        </button>
        <button onClick={() => setActiveTab("family")} className={`flex flex-col items-center transition-all ${activeTab === "family" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <Users size={24} />
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center transition-all ${activeTab === "settings" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <Settings size={24} />
        </button>
      </nav>

      {/* FAB RADIAL */}
      <div className="fixed bottom-32 right-8 z-50">
        <div className="relative flex items-center justify-center">
          {isFabOpen && (
            <>
              <button onClick={() => handleFabAction('camera')} className="absolute bottom-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-in slide-in-from-bottom duration-200"><Camera size={20} className="text-blue-500" /></button>
              <button onClick={() => handleFabAction('manual')} className="absolute bottom-40 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg animate-in slide-in-from-bottom duration-300"><Edit size={20} className="text-blue-500" /></button>
            </>
          )}
          <button onClick={() => setIsFabOpen(!isFabOpen)} className={`w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isFabOpen ? 'rotate-45 bg-gray-800' : ''}`}>
            <Plus size={32} />
          </button>
        </div>
      </div>

      {/* DRAWERS */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-500 z-10">
            {dialogType === 'manual' ? (
              <ManualEventDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} members={familyMembers} onEventAdded={fetchAllData} />
            ) : (
              <UploadDocumentDrawer type={dialogType} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} members={familyMembers} onEventAdded={fetchAllData} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
