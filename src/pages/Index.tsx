import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Users, Calendar, Home as HomeIcon, Plus, Edit, Trash2, Check
} from "lucide-react";
import Header from "@/components/Header";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";
import ZenBackground from "@/components/ZenBackground";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Paleta de colores para el equipo
const TEAM_COLORS = ["#0EA5E9", "#F97316", "#8B5CF6", "#10B981", "#EC4899", "#F43F5E", "#F59E0B"];

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
  const [editingMember, setEditingMember] = useState<any>(null);

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
        
        // CORRECCIÓN DE GRISES: Si un miembro no tiene color (#), le asignamos uno aleatorio de la paleta
        const membersWithColor = profiles?.map(m => ({
          ...m,
          avatar_url: m.avatar_url?.startsWith('#') ? m.avatar_url : TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)]
        })) || [];
        
        setFamilyMembers(membersWithColor);
      }
    } catch (err) {
      console.error("Error en la brisa de datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string, name: string) => {
    if (!confirm(`¿Seguro que quieres eliminar a ${name} del equipo?`)) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', memberId);
      if (error) throw error;
      toast({ title: "Miembro eliminado" });
      fetchAllData();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: editingMember.display_name,
          avatar_url: editingMember.avatar_url 
        })
        .eq('id', editingMember.id);

      if (error) throw error;
      toast({ title: "Perfil actualizado" });
      setEditingMember(null);
      fetchAllData();
    } catch (err) {
      toast({ title: "Error al actualizar", variant: "destructive" });
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
          avatar_url: TEAM_COLORS[0], // Color inicial
          updated_at: new Date().toISOString() 
        });
      
      if (error) throw error;
      setMyNestId(newId);
      setShowOnboarding(false);
      await fetchAllData(); 
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkNest = async () => {
    if (!inviteCode.startsWith('KID-')) {
      toast({ title: "Código inválido", variant: "destructive" });
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
      setMyNestId(partnerProfile.nest_id);
      setShowOnboarding(false);
      await fetchAllData();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFBFF]">
        <ZenBackground />
        <div className="animate-pulse flex flex-col items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl rotate-12 shadow-lg" />
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Sincronizando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-transparent relative overflow-hidden">
        <ZenBackground />
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-transparent relative overflow-hidden">
        <ZenBackground />
        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl rotate-3">
               <HomeIcon className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Tu Espacio</h2>
          </div>
          <div className="grid gap-4">
            <button onClick={handleCreateNewNest} className="p-6 bg-white/60 backdrop-blur-md hover:bg-white/80 rounded-[2.5rem] border-2 border-blue-100/50 text-left transition-all active:scale-95 group shadow-sm">
              <h4 className="font-black text-blue-600 text-lg">Crear mi propio Nido</h4>
              <p className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-widest">Inicia una nueva aventura</p>
            </button>
            <div className="p-6 bg-white/60 backdrop-blur-md rounded-[2.5rem] border-2 border-indigo-100/50 space-y-4 shadow-sm">
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
    <div className="relative min-h-screen w-full overflow-hidden pb-32 font-nunito">
      <ZenBackground />
      <Header />
      
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-2">
              <h1 className="text-4xl font-black text-gray-800 leading-tight">Tu Nido está <br/> <span className="text-blue-500">en calma.</span></h1>
            </div>
            <div className="relative p-8 rounded-[3.5rem] bg-white/70 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50">
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
              <button onClick={() => setActiveTab("family")} className="p-6 rounded-[3rem] flex flex-col items-center gap-3 bg-white/80 backdrop-blur-sm active:scale-95 transition-all shadow-lg border border-white/50">
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
                <div 
                  key={member.id} 
                  onClick={() => setEditingMember(member)}
                  className="p-6 rounded-[3rem] flex flex-col items-center bg-white/70 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-white/50 relative group transition-all cursor-pointer hover:scale-[1.02] hover:bg-white active:scale-95"
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evita abrir el editor al borrar
                      handleDeleteMember(member.id, member.display_name);
                    }}
                    className="absolute top-4 left-4 p-2 opacity-0 group-hover:opacity-100 transition-all text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${member.role === 'autonomous' ? 'bg-blue-400' : 'bg-orange-300'}`} />
                  
                  <div 
                    className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl transition-all duration-500 mb-4"
                    style={{ backgroundColor: member.avatar_url }}
                  >
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  
                  <span className="font-black text-gray-800 text-sm tracking-tight text-center">{member.display_name}</span>
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
            <div className="p-10 space-y-8 bg-white/70 backdrop-blur-md rounded-[4rem] shadow-xl border border-white/50">
              <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
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

      {/* MODAL DE EDICIÓN DE MIEMBRO */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-[340px] rounded-[3rem] border-none bg-white/90 backdrop-blur-xl p-8 outline-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center text-gray-800">Editar Miembro</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-4 flex flex-col items-center">
            {/* Vista Previa del Avatar */}
            <div 
              className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl transition-all duration-500"
              style={{ backgroundColor: editingMember?.avatar_url }}
            >
              {editingMember?.display_name?.charAt(0).toUpperCase()}
            </div>

            <Input 
              placeholder="Nombre del miembro"
              value={editingMember?.display_name || ""}
              onChange={(e) => setEditingMember({...editingMember, display_name: e.target.value})}
              className="h-14 rounded-2xl border-none bg-gray-100 font-bold text-center text-lg"
            />

            <div className="space-y-3 w-full">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Elige un color</p>
              <div className="flex flex-wrap justify-center gap-3">
                {TEAM_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditingMember({...editingMember, avatar_url: color})}
                    className={`w-10 h-10 rounded-xl transition-all ${editingMember?.avatar_url === color ? 'scale-125 ring-4 ring-white shadow-lg' : 'opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: color }}
                  >
                    {editingMember?.avatar_url === color && <Check className="text-white mx-auto" size={20} />}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleUpdateMember}
              className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black text-sm tracking-widest transition-all"
            >
              GUARDAR CAMBIOS
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navegación Zen */}
      <nav className="fixed bottom-0 left-0 right-0 h-28 bg-white/60 backdrop-blur-3xl border-t border-white/20 flex justify-around items-center px-10 z-40 rounded-t-[4rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
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

      {/* FAB */}
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
