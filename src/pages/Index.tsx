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

// PALETA MAESTRO KIDUS UNIFICADA
const KIDUS_COLORS = {
  primary: "#0EA5E9",
  secondary: "#F97316",
  accent: "#8B5CF6",
  success: "#10B981",
  danger: "#F43F5E",
  background: "#F8FAFC"
};

const TEAM_COLORS = [
  KIDUS_COLORS.primary, 
  KIDUS_COLORS.secondary, 
  KIDUS_COLORS.accent, 
  KIDUS_COLORS.success, 
  "#EC4899", 
  "#F59E0B"
];

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

      const { data: myProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

      if (!myProfile || !myProfile.nest_id) {
        setShowOnboarding(true);
      } else {
        setMyNestId(myProfile.nest_id);
        setShowOnboarding(false);
        const { data: profiles } = await supabase.from('profiles').select('*').eq('nest_id', myProfile.nest_id);
        
        const unifedMembers = profiles?.map(m => ({
          ...m,
          avatar_url: m.avatar_url?.startsWith('#') ? m.avatar_url : TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)]
        })) || [];
        
        setFamilyMembers(unifedMembers);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: editingMember.display_name, avatar_url: editingMember.avatar_url })
      .eq('id', editingMember.id);

    if (!error) {
      toast({ title: "Perfil actualizado" });
      setEditingMember(null);
      fetchAllData();
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <ZenBackground />
      <div className="animate-bounce w-12 h-12 bg-[#0EA5E9] rounded-[1.5rem] shadow-xl shadow-blue-200" />
    </div>
  );

  // --- PANTALLA DE LOGOTIPO Y REGISTRO ---
  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden font-nunito">
        <ZenBackground />
        <div className="relative z-10 text-center space-y-12 w-full max-w-sm">
          <div className="relative group">
            <div className="absolute -inset-6 bg-blue-100/40 rounded-[4rem] blur-2xl group-hover:bg-blue-200/50 transition-all duration-700" />
            <div className="relative w-36 h-36 bg-white/80 backdrop-blur-md rounded-[3.5rem] flex items-center justify-center mx-auto shadow-xl border border-white rotate-2 group-hover:rotate-0 transition-all duration-500">
              <img src="/kidus-logo-C1AuyFb2.png" alt="KidUs Logo" className="w-24 h-24 object-contain" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black text-slate-800 tracking-tighter">KidUs</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Harmony & Focus</p>
          </div>

          <Button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} 
            className="w-full h-20 rounded-[2.5rem] bg-white border border-slate-100 text-slate-700 font-black flex gap-4 shadow-xl active:scale-95 transition-all hover:bg-slate-50 group"
          >
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            </div>
            <span className="tracking-tight text-lg uppercase">Entrar con Google</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-32 font-nunito bg-[#F8FAFC]">
      {/* Las ondas ahora son más estrechas y visibles gracias a los ajustes de color en ZenBackground */}
      <ZenBackground />
      <Header />
      
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-2">
              <h1 className="text-4xl font-black text-slate-800 leading-tight">Tu Nido está <br/> <span style={{color: KIDUS_COLORS.primary}}>en calma.</span></h1>
            </div>
            
            <div className="relative p-8 rounded-[3.5rem] bg-white/70 backdrop-blur-md shadow-xl shadow-slate-200/50 border border-white">
                <div className="px-4 py-1.5 bg-sky-100 rounded-full w-fit mb-4">
                  <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Resumen</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Estado del equipo</h3>
                <p className="text-slate-500 font-medium">{familyMembers.length} integrantes activos.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="p-6 rounded-[3rem] flex flex-col items-center gap-3 bg-[#0EA5E9] text-white shadow-xl shadow-blue-100 active:scale-95 transition-all">
                <Calendar size={24} />
                <span className="text-[11px] font-black uppercase tracking-widest">Agenda</span>
              </button>
              <button onClick={() => setActiveTab("family")} className="p-6 rounded-[3rem] flex flex-col items-center gap-3 bg-white/80 text-[#F97316] border border-orange-50 active:scale-95 transition-all shadow-lg">
                <Users size={24} />
                <span className="text-[11px] font-black uppercase tracking-widest">Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <AgendaView />}

        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-black text-slate-800">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData}>
                <button className="w-12 h-12 bg-[#0EA5E9] rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all">
                  <Plus size={24} />
                </button>
              </AddMemberDialog>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {familyMembers.map((member) => (
                <div 
                  key={member.id} 
                  onClick={() => setEditingMember(member)}
                  className="p-6 rounded-[3rem] flex flex-col items-center bg-white/70 backdrop-blur-md border border-white relative group transition-all cursor-pointer hover:shadow-xl active:scale-95"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); /* lógica borrar */ }}
                    className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div 
                    className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-2xl font-black text-white shadow-inner mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: member.avatar_url }}
                  >
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-black text-slate-800 text-sm">{member.display_name}</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                    {member.role === 'admin' ? 'Líder' : 'Miembro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL EDICIÓN UNIFICADO */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-[340px] rounded-[3.5rem] border-none bg-white/95 backdrop-blur-2xl p-8 shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black text-center text-slate-800">Perfil</DialogTitle></DialogHeader>
          <div className="space-y-8 py-4 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[3rem] flex items-center justify-center text-4xl font-black text-white shadow-2xl"
              style={{ backgroundColor: editingMember?.avatar_url }}
            >
              {editingMember?.display_name?.charAt(0).toUpperCase()}
            </div>
            <Input 
              value={editingMember?.display_name || ""}
              onChange={(e) => setEditingMember({...editingMember, display_name: e.target.value})}
              className="h-14 rounded-2xl border-none bg-slate-100 font-bold text-center text-lg focus-visible:ring-[#0EA5E9]"
            />
            <div className="flex flex-wrap justify-center gap-3">
              {TEAM_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setEditingMember({...editingMember, avatar_url: color})}
                  className={`w-10 h-10 rounded-xl transition-all ${editingMember?.avatar_url === color ? 'scale-125 ring-4 ring-white shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: color }}
                >
                  {editingMember?.avatar_url === color && <Check className="text-white mx-auto" size={18} />}
                </button>
              ))}
            </div>
            <Button onClick={handleUpdateMember} className="w-full h-14 rounded-2xl bg-[#0EA5E9] hover:bg-sky-600 text-white font-black tracking-widest shadow-lg">
              ACTUALIZAR
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navegación Zen KidUs */}
      <nav className="fixed bottom-0 left-0 right-0 h-28 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-10 z-40 rounded-t-[4rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        {[
          { id: "home", icon: HomeIcon },
          { id: "agenda", icon: Calendar },
          { id: "family", icon: Users },
          { id: "settings", icon: Settings }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`p-4 transition-all duration-300 ${activeTab === tab.id ? "text-[#0EA5E9] scale-125 -translate-y-2" : "text-slate-300"}`}
          >
            <tab.icon size={26} strokeWidth={activeTab === tab.id ? 3 : 2} />
          </button>
        ))}
      </nav>

      <div className="fixed bottom-32 right-8 z-50">
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)} 
          className={`w-16 h-16 bg-[#0EA5E9] rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isFabOpen ? 'rotate-45 bg-slate-800' : 'hover:scale-110'}`}
        >
          <Plus size={32} />
        </button>
      </div>

      <ManualEventDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} members={familyMembers} onEventAdded={fetchAllData} />
    </div>
  );
};

export default Index;

export default Index;
