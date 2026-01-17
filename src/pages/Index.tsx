import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Users, Calendar, Home as HomeIcon, Plus, Edit, User as UserIcon 
} from "lucide-react";
import Header from "@/components/Header";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [myNestId, setMyNestId] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      if (!user) return;

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
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, role, nest_id')
          .eq('nest_id', myProfile.nest_id);
        
        if (profilesError) throw profilesError;
        // Corregido: Usamos setFamilyMembers que es el estado definido arriba
        setFamilyMembers(profiles || []);
      }
    } catch (err) {
      console.error("Error en la brisa de datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewNest = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no encontrada");

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const randomPart = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      const newId = `KID-${randomPart}`;

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          nest_id: newId,
          display_name: user.user_metadata?.full_name || "Líder del Nido",
          role: 'admin',
          updated_at: new Date().toISOString() 
        });
      
      if (error) throw error;

      toast({ title: "Nido Creado", description: `Tu código: ${newId}` });
      setMyNestId(newId);
      setShowOnboarding(false);
      await fetchAllData(); 
    } catch (err: any) {
      console.error("Error en el nido:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('nest_id', inviteCode.toUpperCase())
        .limit(1)
        .maybeSingle();
      
      if (!partnerProfile) {
        toast({ title: "Error", description: "Ese nido no existe.", variant: "destructive" });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({ nest_id: partnerProfile.nest_id, role: 'autonomous' })
        .eq('id', user?.id);
      
      if (error) throw error;

      toast({ title: "¡Conectados!", description: "Te has unido al nido." });
      setMyNestId(partnerProfile.nest_id);
      setShowOnboarding(false);
      await fetchAllData();
    } catch (err) {
      toast({ title: "Error", description: "No se pudo vincular.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFBFF]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl rotate-12 shadow-lg" />
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Sincronizando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAFBFF] relative overflow-hidden">
        <div className="relative z-10 text-center space-y-10">
          <div className="w-24 h-24 bg-blue-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-12">
            <span className="text-4xl font-black text-white -rotate-12">K</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-gray-800 tracking-tighter">KidUs</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">Harmony & Focus</p>
          </div>
          <Button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} 
            className="w-full max-w-xs h-16 rounded-[2rem] bg-white border-2 border-gray-100 text-gray-700 font-black flex gap-4 shadow-xl active:scale-95 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            ENTRAR CON GOOGLE
          </Button>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
               <HomeIcon className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Tu Espacio</h2>
          </div>
          <div className="grid gap-4">
            <button onClick={handleCreateNewNest} className="p-6 bg-blue-50/50 hover:bg-blue-100 rounded-[2.5rem] border-2 border-blue-100/50 text-left transition-all active:scale-95 group">
              <h4 className="font-black text-blue-600 text-lg">Crear mi propio Nido</h4>
              <p className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Inicia una nueva aventura</p>
            </button>
            <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border-2 border-indigo-100/50 space-y-4">
              <h4 className="font-black text-indigo-600 text-lg">Unirme a un Nido</h4>
              <div className="flex gap-2">
                <input 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())} 
                  placeholder="KID-XXXXXX" 
                  className="flex-1 h-12 rounded-xl border-none px-4 font-black tracking-widest text-sm shadow-inner bg-white/80 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" 
                />
                <Button onClick={handleLinkNest} className="h-12 px-6 rounded-xl bg-indigo-600 text-white font-black">UNIRSE</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#FAFBFF] pb-32 font-nunito">
      <Header />
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-2">
              <h1 className="text-4xl font-black text-gray-800 leading-tight">Tu Nido está <br/> <span className="text-blue-500">en calma.</span></h1>
            </div>
            <div className="relative p-8 rounded-[3.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
                <div className="px-4 py-1.5 bg-orange-100 rounded-full w-fit mb-4">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Estado</span>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Todo en orden</h3>
                <p className="text-gray-500 font-medium">Hay {familyMembers.length} miembros activos.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="p-6 rounded-[3rem] flex flex-col items-center gap-3 bg-blue-500 text-white active:scale-95 transition-all shadow-xl shadow-blue-100">
                <Calendar size={24} />
                <span className="text-[11px] font-black uppercase tracking-widest">Agenda</span>
              </button>
              <button onClick={() => setActiveTab("family")} className="p-6 rounded-[3rem] flex flex-col items-center gap-3 bg-white active:scale-95 transition-all shadow-lg border border-gray-50">
                <Users size={24} className="text-orange-500" />
                <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <AgendaView />}
        
        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center px-2 pt-4">
              <h2 className="text-3xl font-black text-gray-800">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData}>
                <button className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all">
                  <Plus size={24} />
                </button>
              </AddMemberDialog>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {familyMembers.map((member) => (
                <div key={member.id} className="p-6 rounded-[3rem] flex flex-col items-center bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-white relative group">
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${member.role === 'autonomous' ? 'bg-blue-400' : 'bg-orange-300'}`} />
                  
                  {/* Avatar Inteligente que reconoce color e inicial */}
                  <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 mb-4 ${member.avatar_url?.startsWith('bg-') ? member.avatar_url : 'bg-slate-200'}`}>
                    {!member.avatar_url || member.avatar_url.startsWith('bg-') ? (
                      member.display_name?.charAt(0).toUpperCase()
                    ) : (
                      <img src={member.avatar_url} className="w-full h-full object-cover rounded-[2.5rem]" alt="" />
                    )}
                  </div>
                  
                  <span className="font-black text-gray-800 text-sm tracking-tight">{member.display_name}</span>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mt-1">
                    {member.role === 'autonomous' ? 'Autónomo' : 'Dependiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black px-2 text-gray-800">Ajustes</h2>
            <div className="p-10 space-y-8 bg-white rounded-[4rem] shadow-xl border border-gray-50">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.3em]">Tu Código Zen</p>
                <p className="text-2xl font-black tracking-[0.4em] text-slate-800">{myNestId}</p>
              </div>
              <Button onClick={() => supabase.auth.signOut()} className="w-full h-16 rounded-[2rem] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all border-none">
                CERRAR SESIÓN
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Navegación Zen */}
      <nav className="fixed bottom-0 left-0 right-0 h-28 bg-white/80 backdrop-blur-3xl border-t border-white/20 flex justify-around items-center px-10 z-40 rounded-t-[4rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: "home", icon: HomeIcon },
          { id: "agenda", icon: Calendar },
          { id: "family", icon: Users },
          { id: "settings", icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`p-4 transition-all duration-500 ${activeTab === tab.id ? "text-blue-500 scale-125 -translate-y-2" : "text-gray-300"}`}
          >
            <tab.icon size={26} strokeWidth={activeTab === tab.id ? 3 : 2} />
          </button>
        ))}
      </nav>

      {/* FAB (Botón Flotante) */}
      <div className="fixed bottom-32 right-8 z-50">
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)} 
            className={`w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-45 bg-gray-800' : 'hover:scale-110'}`}
          >
            <Plus size={32} />
          </button>
          {isFabOpen && (
            <div className="absolute bottom-20 right-0 animate-in slide-in-from-bottom-6 duration-300">
              <button 
                onClick={() => { setIsDrawerOpen(true); setIsFabOpen(false); }} 
                className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl hover:bg-gray-50 transition-colors"
              >
                <Edit size={22} className="text-blue-500" />
              </button>
            </div>
          )}
      </div>

      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        members={familyMembers} 
        onEventAdded={fetchAllData} 
      />
    </div>
  );
};

export default Index;
