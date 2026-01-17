import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Users, Calendar, Home as HomeIcon, Plus, Edit, Trash2, Check, LogOut, ArrowRight
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

// --- CONFIGURACIÓN DE EQUIPO (MANUAL DE ESTILO) ---
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
        
        const unifiedMembers = profiles?.map(m => ({
          ...m,
          avatar_url: m.avatar_url?.startsWith('#') ? m.avatar_url : TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)]
        })) || [];
        
        setFamilyMembers(unifiedMembers);
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

  // --- COMPONENTES DE INTERFAZ UNIFICADOS ---

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <ZenBackground />
      <div className="animate-bounce w-16 h-16 bg-[#0EA5E9] rounded-[2rem] shadow-2xl flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden font-nunito">
        <ZenBackground />
        <div className="relative z-10 text-center space-y-12 w-full max-w-sm animate-in fade-in zoom-in duration-700">
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

  if (showOnboarding) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] relative overflow-hidden font-nunito">
        <ZenBackground />
        <div className="relative z-10 w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-[#F97316] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
               <HomeIcon className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Crea tu Nido</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">El comienzo de la calma</p>
          </div>
          <div className="grid gap-6">
            <button onClick={() => {}} className="p-8 bg-white/70 backdrop-blur-md hover:bg-white rounded-[3.5rem] border border-white text-left transition-all active:scale-95 shadow-xl shadow-slate-200/50 group">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-black text-[#0EA5E9] text-xl">Iniciar Nido Nuevo</h4>
                <ArrowRight size={20} className="text-[#0EA5E9] group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Para nuevas familias</p>
            </button>
            <div className="p-8 bg-white/70 backdrop-blur-md rounded-[3.5rem] border border-white space-y-6 shadow-xl shadow-slate-200/50">
              <h4 className="font-black text-[#8B5CF6] text-xl">Unirme a un Nido</h4>
              <div className="flex gap-3">
                <input 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())} 
                  placeholder="KID-XXXXXX" 
                  className="flex-1 h-14 rounded-2xl border-none px-6 font-black tracking-[0.2em] text-sm bg-slate-100 focus:ring-2 focus:ring-violet-200 transition-all outline-none" 
                />
                <Button className="h-14 px-6 rounded-2xl bg-[#8B5CF6] text-white font-black hover:bg-violet-600 transition-all">UNIRSE</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-32 font-nunito bg-[#F8FAFC]">
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
                  <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest tracking-[0.2em]">Resumen</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Estado del equipo</h3>
                <p className="text-slate-500 font-medium">{familyMembers.length} integrantes sincronizados.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="p-8 rounded-[3rem] flex flex-col items-center gap-3 bg-[#0EA5E9] text-white shadow-xl shadow-blue-100 active:scale-95 transition-all">
                <Calendar size={24} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Agenda</span>
              </button>
              <button onClick={() => setActiveTab("family")} className="p-8 rounded-[3rem] flex flex-col items-center gap-3 bg-white/80 text-[#F97316] border border-white shadow-xl shadow-slate-200/40 active:scale-95 transition-all">
                <Users size={24} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <AgendaView />}

        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-3xl font-black text-slate-800">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData}>
                <button className="w-14 h-14 bg-[#0EA5E9] rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-all hover:rotate-90">
                  <Plus size={28} strokeWidth={3} />
                </button>
              </AddMemberDialog>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {familyMembers.map((member) => (
                <div 
                  key={member.id} 
                  onClick={() => setEditingMember(member)}
                  className="p-8 rounded-[3.5rem] flex flex-col items-center bg-white/70 backdrop-blur-md border border-white relative group transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div 
                    className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: member.avatar_url }}
                  >
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-black text-slate-800 text-sm">{member.display_name}</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                    {member.role === 'admin' ? 'Líder' : 'Miembro'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="px-4">
              <h2 className="text-3xl font-black text-slate-800">Ajustes</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configuración del nido</p>
            </div>
            <div className="p-8 space-y-10 bg-white/70 backdrop-blur-md rounded-[4rem] shadow-xl border border-white">
              <div className="p-8 bg-slate-50/80 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center group transition-all hover:border-sky-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Código de Invitación</p>
                <p className="text-3xl font-black tracking-[0.3em] text-slate-800 group-hover:text-[#0EA5E9] transition-colors">{myNestId}</p>
              </div>
              <Button onClick={() => supabase.auth.signOut()} className="w-full h-16 rounded-[2rem] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all border-none shadow-sm flex gap-3">
                <LogOut size={18} />
                <span className="tracking-widest text-xs uppercase">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-28 bg-white/80 backdrop-blur-xl border-t border-slate-50 flex justify-around items-center px-10 z-40 rounded-t-[4rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
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

{/* --- INFRAESTRUCTURA DE ENTRADA (MANUAL DE ESTILO KIDUS) --- */}
      
      {/* INPUT OCULTO: El motor de captura de imágenes */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileChange} 
      />

      {/* FAB RADIAL: Sistema de abanico en cascada */}
      <div className="fixed bottom-32 right-8 z-50 flex flex-col items-center">
        
        {/* BOTONES SECUNDARIOS (Abanico) */}
        <div className={`flex flex-col gap-5 mb-5 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
          isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-50 pointer-events-none'
        }`}>
          
          {/* Acción: Cámara / Escaneo */}
          <button 
            onClick={() => {
              setIsFabOpen(false);
              fileInputRef.current?.click();
            }}
            className="w-14 h-14 bg-[#8B5CF6] rounded-3xl flex items-center justify-center text-white shadow-fab hover:scale-110 active:scale-95 transition-all border-4 border-white group"
          >
            <Camera size={26} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          </button>

          {/* Acción: Entrada Manual */}
          <button 
            onClick={() => {
              setIsFabOpen(false);
              setIsDrawerOpen(true);
            }}
            className="w-14 h-14 bg-[#F97316] rounded-3xl flex items-center justify-center text-white shadow-fab hover:scale-110 active:scale-95 transition-all border-4 border-white group"
          >
            <Edit size={26} strokeWidth={2.5} className="group-hover:-rotate-12 transition-transform" />
          </button>
        </div>

        {/* BOTÓN MAESTRO (TRIGGER) */}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)} 
          className={`w-18 h-18 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 z-50 ${
            isFabOpen 
              ? 'rotate-45 bg-slate-800 scale-90' 
              : 'bg-[#0EA5E9] hover:scale-110 active:scale-95 shadow-sky-200/50'
          }`}
          style={{ width: '72px', height: '72px' }}
        >
          <Plus size={36} strokeWidth={3} />
        </button>
      </div>

      {/* COMPONENTES EMERGENTES */}
      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        members={familyMembers} 
        onEventAdded={fetchAllData} 
      />
      
    </div> // Cierre del contenedor principal (relative min-h-screen)
  );
};

export default Index;
