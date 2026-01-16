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
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [myNestId, setMyNestId] = useState("");
  
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'manual' | 'camera' | 'gallery' | 'pdf'>('manual');

  const { toast } = useToast();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: eventData } = await supabase.from('events').select('*').order('start_time', { ascending: true });
      setFamilyMembers(profiles || []);
      setEvents(eventData || []);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const myProfile = profiles?.find(p => p.id === user.id);
        if (myProfile) setMyNestId(myProfile.nest_id);
      }
    } catch (err) {
      console.error("Error cargando nido:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const channel = supabase
      .channel('nido-compartido')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchAllData();
        toast({ title: "Nido actualizado", description: "Sincronización en tiempo real activa." });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAllData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
      setMyNestId(partnerProfile.nest_id);
      fetchAllData();
    }
  };

  const handleFabAction = (type: 'manual' | 'camera' | 'gallery' | 'pdf') => {
    setDialogType(type);
    setIsDrawerOpen(true);
    setIsFabOpen(false);
  };

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
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2 italic">Sábado, 17 de Enero</p>
            </div>

            {/* TARJETA PRÓXIMA TAREA CON GRADIENTE */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative glass-card p-8 rounded-[3rem] bg-white/80 backdrop-blur-xl border border-white/50 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="px-4 py-1.5 bg-orange-100 rounded-full">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Próxima Tarea</span>
                  </div>
                  <div className="flex -space-x-2">
                     <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">L</div>
                     <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">P</div>
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
                  <button className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-xs font-black text-blue-600 active:scale-95 transition-all">MARCAR HECHO</button>
                </div>
              </div>
            </div>

            {/* ACCESO RÁPIDO GRID */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab("agenda")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-blue-50/50 group active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform">
                  <Calendar size={20} />
                </div>
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest text-center">Ver Agenda</span>
              </button>
              
              <button onClick={() => setActiveTab("family")} className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-orange-50/50 group active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100 group-hover:-rotate-12 transition-transform">
                  <Users size={20} />
                </div>
                <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest text-center">Mi Equipo</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "agenda" && <div className="animate-in slide-in-from-right-4 duration-500"><AgendaView /></div>}

        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-3xl font-black text-gray-800">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData}>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm active:scale-95 group">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white group-hover:rotate-90 transition-all">
                    <Plus size={18} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nuevo</span>
                </button>
              </AddMemberDialog>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="glass-card p-6 flex flex-col items-center group transition-all hover:translate-y-[-4px]">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-blue-50 shadow-xl flex items-center justify-center mb-4 border-2 border-white relative">
                    <span className="text-3xl font-black text-blue-500">{member.display_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="font-black text-gray-700 tracking-tight">{member.display_name}</span>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">{member.role || 'Miembro'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-in zoom-in-95 space-y-6">
            <h2 className="text-3xl font-black px-2 text-gray-800">Sincronizar</h2>
            <div className="glass-card p-8 space-y-6 bg-indigo-50/30 border-none shadow-sm rounded-[3rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600"><Users size={24} /></div>
                <div>
                  <h4 className="font-black text-gray-800 uppercase text-[10px] tracking-widest">Vincular Pareja</h4>
                  <p className="text-[11px] text-gray-400 font-bold uppercase">Dos pilotos, un nido</p>
                </div>
              </div>
              <div className="p-4 bg-white/80 rounded-2xl border-2 border-dashed border-indigo-200 text-center">
                <p className="text-[9px] font-black text-indigo-400 uppercase mb-2">Tu código de nido</p>
                <p className="text-2xl font-black tracking-[0.3em] text-indigo-600 uppercase">{myNestId || "KID-LINK"}</p>
              </div>
              <div className="space-y-3">
                <input 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="CÓDIGO PAREJA..." 
                  className="w-full h-14 rounded-2xl bg-white border-none px-4 text-center font-black uppercase tracking-widest text-sm shadow-sm focus:ring-2 focus:ring-indigo-200 transition-all" 
                />
                <Button onClick={handleLinkNest} className="w-full h-14 rounded-2xl bg-gray-800 hover:bg-black text-white font-black transition-all shadow-lg">FUSIONAR NIDOS</Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start h-16 rounded-[2rem] font-bold text-red-500 hover:bg-red-50" onClick={() => supabase.auth.signOut()}>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mr-4">🚪</div>
              Cerrar Sesión
            </Button>
          </div>
        )}
      </main>

      {/* FAB RADIAL MULTIMODAL COMPLETO */}
      <div className="fixed bottom-32 right-8 z-50">
        <div className="relative flex items-center justify-center">
          <button className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} style={{ transform: isFabOpen ? 'translateY(-270px)' : '' }} onClick={() => handleFabAction('camera')}><Camera size={20} className="text-blue-500" /></button>
          <button className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} style={{ transform: isFabOpen ? 'translateY(-205px)' : '' }} onClick={() => handleFabAction('gallery')}><Image size={20} className="text-blue-500" /></button>
          <button className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} style={{ transform: isFabOpen ? 'translateY(-140px)' : '' }} onClick={() => handleFabAction('pdf')}><FileText size={20} className="text-blue-500" /></button>
          <button className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} style={{ transform: isFabOpen ? 'translateY(-75px)' : '' }} onClick={() => handleFabAction('manual')}><Edit size={20} className="text-blue-500" /></button>
          <button onClick={() => setIsFabOpen(!isFabOpen)} className={`fab-main-button ${isFabOpen ? 'open' : ''}`}><Plus size={32} className="text-white" /></button>
        </div>
      </div>

      {/* NAV INFERIOR FENG SHUI */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/60 backdrop-blur-2xl border-t border-white/30 flex justify-around items-center px-8 z-40 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center transition-all ${activeTab === "home" ? "text-blue-500 scale-110" : "text-gray-300 hover:text-gray-400"}`}>
          <HomeIcon size={24} /><span className={`text-[9px] font-black mt-1 uppercase ${activeTab === "home" ? "opacity-100" : "opacity-0"}`}>Inicio</span>
        </button>
        <button onClick={() => setActiveTab("agenda")} className={`flex flex-col items-center transition-all ${activeTab === "agenda" ? "text-blue-500 scale-110" : "text-gray-300 hover:text-gray-400"}`}>
          <Calendar size={24} /><span className={`text-[9px] font-black mt-1 uppercase ${activeTab === "agenda" ? "opacity-100" : "opacity-0"}`}>Agenda</span>
        </button>
        <button onClick={() => setActiveTab("family")} className={`flex flex-col items-center transition-all ${activeTab === "family" ? "text-blue-500 scale-110" : "text-gray-300 hover:text-gray-400"}`}>
          <Users size={24} /><span className={`text-[9px] font-black mt-1 uppercase ${activeTab === "family" ? "opacity-100" : "opacity-0"}`}>Equipo</span>
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center transition-all ${activeTab === "settings" ? "text-blue-500 scale-110" : "text-gray-300 hover:text-gray-400"}`}>
          <Settings size={24} /><span className={`text-[9px] font-black mt-1 uppercase ${activeTab === "settings" ? "opacity-100" : "opacity-0"}`}>Ajustes</span>
        </button>
      </nav>

      {/* DRAWERS MULTIMODALES */}
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
