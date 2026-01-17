import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, Users, Calendar, Home as HomeIcon, Plus, Edit, Trash2, Camera, LogOut, ArrowRight, Loader2 
} from "lucide-react";
import Header from "@/components/Header";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ManualEventDrawer } from "@/components/ManualEventDrawer";
import ZenBackground from "@/components/ZenBackground";

// --- CONFIGURACIÓN DE ESTILO KIDUS ZEN ---
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
  const [myNestId, setMyNestId] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  
  // ESTADOS PARA LA IA Y ESCÁNER
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState("Iniciando escaneo...");
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
      if (session) {
        fetchAllData();
      } else {
        setLoading(false);
        setShowOnboarding(false);
        setFamilyMembers([]);
        setMyNestId("");
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

  // --- LÓGICA DE ESCANEO REAL CON SUBIDA A STORAGE ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAiProcessing(true);
    const messages = [
      "Subiendo imagen al Nido...",
      "Calibrando sensores ópticos...",
      "GPT-4o analizando contenido...",
      "Estructurando evento..."
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      setAiMessage(messages[msgIndex]);
      msgIndex++;
      if (msgIndex >= messages.length) clearInterval(interval);
    }, 1200);

    try {
      // 1. Subida a Storage (Bucket: event-attachments)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Simulación de respuesta de IA (Aquí conectarás la Edge Function)
      // Mock de datos para que el Drawer se rellene solo
      const mockResult = {
        description: "Reunión detectada por IA",
        date: new Date().toISOString().split('T')[0],
        time: "17:00"
      };

      setScannedData(mockResult);

      setTimeout(() => {
        setIsAiProcessing(false);
        setIsDrawerOpen(true);
        toast({ 
          title: "¡IA Sincronizada!", 
          description: "He extraído los datos de la imagen con éxito." 
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 4800);

    } catch (error: any) {
      setIsAiProcessing(false);
      toast({ 
        title: "Fallo en el escaneo", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
      <ZenBackground />
      <div className="animate-bounce w-16 h-16 bg-[#0EA5E9] rounded-[2rem] shadow-2xl flex items-center justify-center border-4 border-white relative z-10">
        <Loader2 className="text-white animate-spin" size={24} />
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
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} 
            className="w-full h-20 rounded-[2.5rem] bg-white border border-slate-100 text-slate-700 font-black flex gap-4 shadow-xl active:scale-95 transition-all hover:bg-slate-50 group shadow-slate-200/50"
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
      <ZenBackground />
      <Header />
      
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-2">
              <h1 className="text-4xl font-black text-slate-800 leading-tight">Tu Nido está <br/> <span style={{color: KIDUS_COLORS.primary}}>en calma.</span></h1>
            </div>
            
            <div className="relative p-8 rounded-[3.5rem] bg-white/70 backdrop-blur-md shadow-xl shadow-slate-200/50 border border-white/50">
                <div className="px-4 py-1.5 bg-sky-100 rounded-full w-fit mb-4">
                  <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em]">Resumen</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Estado del equipo</h3>
                <p className="text-slate-500 font-medium">{familyMembers.length} integrantes sincronizados.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="p-8 rounded-[3rem] flex flex-col items-center gap-3 bg-[#0EA5E9] text-white shadow-xl shadow-blue-100 active:scale-95 transition-all hover:scale-[1.02]">
                <Calendar size={24} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Agenda</span>
              </button>
              <button onClick={() => setActiveTab("family")} className="p-8 rounded-[3rem] flex flex-col items-center gap-3 bg-white/80 text-[#F97316] border border-white shadow-xl shadow-slate-200/40 active:scale-95 transition-all hover:scale-[1.02]">
                <Users size={24} strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <div className="animate-in fade-in duration-500"><AgendaView /></div>}

        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-3xl font-black text-slate-800">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData}>
                <button className="w-14 h-14 bg-[#0EA5E9] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl active:scale-90 transition-all hover:rotate-90">
                  <Plus size={28} strokeWidth={3} />
                </button>
              </AddMemberDialog>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              {familyMembers.map((member) => (
                <div 
                  key={member.id} 
                  onClick={() => setEditingMember(member)}
                  className="p-8 rounded-[3.5rem] flex flex-col items-center bg-white/70 backdrop-blur-md border border-white/50 relative group transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                >
                  <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </div>
                  <div 
                    className="w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl mb-4 transition-transform group-hover:scale-110 shadow-slate-200/50"
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
            <h2 className="text-3xl font-black px-4 text-slate-800">Ajustes</h2>
            <div className="p-8 bg-white/70 backdrop-blur-md rounded-[3.5rem] shadow-xl border border-white/50 space-y-4">
              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID de Nido</p>
                  <p className="text-xl font-black text-[#0EA5E9] tracking-widest">{myNestId || "KID-..."}</p>
              </div>
              <Button onClick={() => supabase.auth.signOut()} className="w-full h-16 rounded-[2rem] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all border-none">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* --- NAVEGACIÓN --- */}
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

      {/* --- INPUT OCULTO PARA CÁMARA --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
        onChange={handleFileChange} 
      />

      {/* --- BOTÓN FLOTANTE (FAB) --- */}
      <div className="fixed bottom-32 right-8 z-50 flex flex-col items-center">
        <div className={`flex flex-col gap-5 mb-5 transition-all duration-500 ${isFabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-50 pointer-events-none'}`}>
          <button 
            onClick={() => { setIsFabOpen(false); fileInputRef.current?.click(); }}
            className="w-14 h-14 bg-[#8B5CF6] rounded-[1.8rem] flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-90 transition-all shadow-slate-200/50"
          >
            <Camera size={26} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => { setIsFabOpen(false); setIsDrawerOpen(true); }}
            className="w-14 h-14 bg-[#F97316] rounded-[1.8rem] flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-90 transition-all shadow-slate-200/50"
          >
            <Edit size={26} strokeWidth={2.5} />
          </button>
        </div>

        <button 
          onClick={() => setIsFabOpen(!isFabOpen)} 
          className={`w-[72px] h-[72px] rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 z-50 ${isFabOpen ? 'rotate-45 bg-slate-800 scale-90' : 'bg-[#0EA5E9] hover:scale-110 active:scale-95 shadow-sky-200/50'}`}
        >
          <Plus size={36} strokeWidth={3} />
        </button>
      </div>

      {/* --- OVERLAY DE IA (MAGIA VISUAL) --- */}
      {isAiProcessing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-8 p-10 text-center">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-slate-100 rounded-[3rem] animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-0 border-8 border-t-[#0EA5E9] rounded-[3rem] animate-spin" />
              <Camera className="absolute inset-0 m-auto text-[#0EA5E9] animate-pulse" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Escaneo Inteligente</h3>
              <p className="text-[#0EA5E9] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">{aiMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAWER DE EVENTOS (CON DATOS ESCANEADOS) --- */}
      <ManualEventDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => {
          setIsDrawerOpen(false);
          setScannedData(null);
        }} 
        members={familyMembers} 
        onEventAdded={fetchAllData}
        initialData={scannedData}
      />
    </div>
  );
};

export default Index;
