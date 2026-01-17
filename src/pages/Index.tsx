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
        
        // Traemos perfiles con los nuevos campos de rol y avatar
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, role, nest_id')
          .eq('nest_id', myProfile.nest_id);
        
        if (profilesError) throw profilesError;
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
          role: 'admin', // El creador es el admin por defecto
          updated_at: new Date().toISOString() 
        }, { onConflict: 'id' });
      
      if (error) throw error;

      toast({ title: "Nido Creado", description: `Tu código: ${newId}` });
      
      setMyNestId(newId);
      setShowOnboarding(false);
      await fetchAllData(); 
    } catch (err: any) {
      console.error("Error en el nido:", err);
      toast({ 
        title: "Error de Sincronización", 
        description: "La base de datos rechazó el registro.", 
        variant: "destructive" 
      });
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
        toast({ title: "Error", description: "Ese nido no existe todavía.", variant: "destructive" });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({ 
          nest_id: partnerProfile.nest_id,
          role: 'member' 
        })
        .eq('id', user?.id);
      
      if (error) throw error;

      toast({ title: "¡Tándem Conectado!", description: "Nido vinculado con éxito." });
      setMyNestId(partnerProfile.nest_id);
      setShowOnboarding(false);
      await fetchAllData();
    } catch (err) {
      toast({ title: "Error", description: "No pudimos unir los nidos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFBFF]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl rotate-12 shadow-lg shadow-blue-200" />
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Sincronizando equipo...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAFBFF] font-nunito relative overflow-hidden">
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white font-nunito relative overflow-hidden">
        <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
               <HomeIcon className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Tu Espacio</h2>
            <p className="text-gray-500 font-medium text-sm px-8">Define tu base de operaciones familiar.</p>
          </div>
          <div className="grid gap-4">
            <button onClick={handleCreateNewNest} className="p-6 bg-blue-50/50 hover:bg-blue-100 rounded-[2.5rem] border-2 border-blue-100/50 text-left transition-all active:scale-95 group">
              <h4 className="font-black text-blue-600 text-lg group-hover:translate-x-1 transition-transform">Crear mi propio Nido</h4>
              <p className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Inicia una nueva aventura</p>
            </button>
            <div className="p-6 bg-indigo-50/50 rounded-[2.5rem] border-2 border-indigo-100/50 space-y-4">
              <div>
                <h4 className="font-black text-indigo-600 text-lg">Unirme a un Nido</h4>
                <p className="text-[10px] text-indigo-400 font-bold uppercase mt-1 tracking-widest">Introduce el código KID-</p>
              </div>
              <div className="flex gap-2">
                <input 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())} 
                  placeholder="KID-XXXXXX" 
                  className="flex-1 h-12 rounded-xl border-none px-4 font-black tracking-widest text-sm shadow-inner bg-white/80 focus:ring-2 focus:ring-indigo-200 transition-all outline-none" 
                />
                <Button onClick={handleLinkNest} className="h-12 px-6 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors">CONECTAR</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-nunito bg-[#FAFBFF]">
      <Header />
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10 pb-32">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-2">
              <h1 className="text-4xl font-black text-gray-800 leading-tight">Tu Nido está <br/> <span className="text-blue-500">en calma.</span></h1>
            </div>
            <div className="relative glass-card p-8 rounded-[3rem] bg-white border border-white/50 shadow-sm">
                <div className="px-4 py-1.5 bg-orange-100 rounded-full w-fit mb-4">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Estado</span>
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Todo en orden</h3>
                <p className="text-gray-500 font-medium">Hay {familyMembers.length} miembros activos en tu equipo.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 bg-blue-50/50 active:scale-95 transition-all border-none">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white"><Calendar size={20} /></div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Agenda</span>
              </button>
              <button onClick={() => setActiveTab("family")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 bg-orange-50/50 active:scale-95 transition-all border-none">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white"><Users size={20} /></div>
                <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <AgendaView />}
        
        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-black text-gray-800">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData}>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <Plus size={18} className="text-blue-500" />
                  <span className="text-[10px] font-black text-blue-600 uppercase">Añadir</span>
                </button>
              </AddMemberDialog>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="glass-card p-6 flex flex-col items-center bg-white shadow-sm border-none relative group overflow-hidden">
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-50 rounded-full">
                    <span className="text-[7px] font-black text-blue-400 uppercase tracking-tighter">{member.role || 'miembro'}</span>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-3 text-2xl font-black text-blue-500 shadow-inner border-2 border-white overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <UserIcon size={30} className="text-blue-200" />
                    )}
                  </div>
                  <span className="font-black text-gray-700 text-sm text-center">{member.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black px-2 text-gray-800">Ajustes</h2>
            <div className="glass-card p-8 space-y-6 bg-indigo-50/30 border-none rounded-[3rem]">
              <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-indigo-200 text-center">
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Código Compartido</p>
                <p className="text-2xl font-black tracking-[0.3em] text-indigo-600">{myNestId}</p>
              </div>
              <Button onClick={() => supabase.auth.signOut()} variant="destructive" className="w-full h-14 rounded-2xl font-black">CERRAR SESIÓN</Button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-2xl border-t border-white/20 flex justify-around items-center px-8 z-40 rounded-t-[3rem] shadow-xl">
        {[
          { id: "home", icon: HomeIcon },
          { id: "agenda", icon: Calendar },
          { id: "family", icon: Users },
          { id: "settings", icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`p-4 transition-all ${activeTab === tab.id ? "text-blue-500 scale-125" : "text-gray-300"}`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 3 : 2} />
          </button>
        ))}
      </nav>

      <div className="fixed bottom-32 right-8 z-50">
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)} 
            className={`w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${isFabOpen ? 'rotate-45 bg-gray-800' : ''}`}
          >
            <Plus size={32} />
          </button>
          {isFabOpen && (
            <div className="absolute bottom-20 right-0 animate-in slide-in-from-bottom-6 duration-300">
              <button 
                onClick={() => { setIsDrawerOpen(true); setIsFabOpen(false); }} 
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:bg-gray-50 transition-colors"
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
