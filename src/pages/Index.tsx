import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  Users, 
  Calendar, 
  Home as HomeIcon, 
  Plus, 
  Clock, // Corregido: de 'clock' a 'Clock'
  User,  // Corregido: de 'user' a 'User'
  Camera, 
  Image, 
  FileText, 
  Edit 
} from "lucide-react";
import Header from "@/components/Header";
import UpcomingEvents from "@/components/UpcomingEvents";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Importación de los nuevos Drawers para el procesamiento multimodal
import { ManualEventDrawer } from "@/components/ManualEventDrawer";
import { UploadDocumentDrawer } from "@/components/UploadDocumentDrawer";

// Logo
import KidusLogo from '@/assets/kidus-logo-C1AuyFb2.png';

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA EL FAB RADIAL Y DRAWERS
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
    } catch (err) {
      console.error("Error cargando nido:", err);
      toast({ title: "Error de conexión", description: "No se pudo cargar la información del nido.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAllData)
      .subscribe();
    
    const eventsChannel = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchAllData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  // Función para abrir la acción del FAB
  const handleFabAction = (type: 'manual' | 'camera' | 'gallery' | 'pdf') => {
    setDialogType(type);
    setIsDrawerOpen(true);
    setIsFabOpen(false); // Cerramos el radial al elegir
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-nunito">
      {/* FONDO WAVY DINÁMICO (Asegúrate de tener la clase en index.css) */}
      <div className="wave-bg" />

      {/* HEADER DINÁMICO */}
      <Header />
      
      <main className="container mx-auto px-6 pt-4 max-w-md relative z-10 pb-32">
        {/* VISTA: INICIO (Santuario de Calma) */}
       {activeTab === "home" && (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    {/* CABECERA DINÁMICA: EL ALMA DE LA PAZ MENTAL */}
    <div className="px-2">
      <h1 className="text-4xl font-black font-nunito tracking-tight text-gray-800 leading-tight">
        Tu Nido está <br/> 
        <span className="text-blue-500">en calma.</span>
      </h1>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
        Sábado, 17 de Enero
      </p>
    </div>

    {/* TARJETA DE PRÓXIMA DELEGACIÓN (EL "PLATO DEL DÍA") */}
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative glass-card p-8 rounded-[3rem] bg-white/80 backdrop-blur-xl border border-white/50">
        <div className="flex justify-between items-start mb-6">
          <div className="px-4 py-1.5 bg-orange-100 rounded-full">
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Próxima Tarea</span>
          </div>
          <div className="flex -space-x-2">
             {/* Aquí irían los mini-avatares de Sujeto y Responsable */}
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
          <button className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-xs font-black text-blue-600 active:scale-95 transition-all">
            MARCAR HECHO
          </button>
        </div>
      </div>
    </div>

    {/* ACCESO RÁPIDO A COORDINACIÓN */}
    <div className="grid grid-cols-2 gap-4">
      <button className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-blue-50/50 group active:scale-95 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform">
          <Calendar size={20} />
        </div>
        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Ver Agenda</span>
      </button>
      
      <button className="glass-card p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border-none bg-orange-50/50 group active:scale-95 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100 group-hover:-rotate-12 transition-transform">
          <User size={20} />
        </div>
        <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest">Mi Equipo</span>
      </button>
    </div>

  </div>
)}

        {/* VISTA: AGENDA */}
        {activeTab === "agenda" && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <AgendaView />
          </div>
        )}

       {/* VISTA: FAMILIA */}
{activeTab === "family" && (
  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
    <div className="flex justify-between items-center px-2">
      <h2 className="text-3xl font-black font-nunito tracking-tight text-gray-800">Mi Equipo</h2>
      
      {/* EL BOTÓN FENG SHUI ENVOLVIENDO EL DIALOG */}
      <AddMemberDialog onMemberAdded={fetchAllData}>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:bg-white/60 transition-all active:scale-95 group">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white group-hover:rotate-90 transition-transform duration-300">
            <Plus size={18} strokeWidth={3} />
          </div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Nuevo</span>
        </button>
      </AddMemberDialog>
    </div>

    {/* GRID DE MIEMBROS ESTILO GLASS-CARD */}
    <div className="grid grid-cols-2 gap-4">
      {familyMembers.map((member) => (
        <div 
          key={member.id} 
          className="glass-card p-6 flex flex-col items-center group transition-all hover:translate-y-[-4px]"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-blue-50 shadow-xl flex items-center justify-center mb-4 border-2 border-white relative overflow-hidden">
            {/* Efecto de brillo en el avatar */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="text-3xl font-black text-blue-500 drop-shadow-sm">
              {member.display_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-black text-gray-700 tracking-tight">{member.display_name}</span>
          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">
            {member.role || 'Miembro'}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

        {/* VISTA: AJUSTES */}
        {activeTab === "settings" && (
          <div className="animate-in zoom-in-95 space-y-4">
            <h2 className="text-2xl font-black px-2">Configuración</h2>
            <div className="glass-card p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl font-bold" onClick={() => supabase.auth.signOut()}>
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-3">🚪</div>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* FAB RADIAL MULTIMODAL (El Cerebro de KidUs) */}
      <div className="fixed bottom-32 right-8 z-50">
        <div className="relative flex items-center justify-center">
          {/* Sub-botones con transiciones manuales */}
          <button 
            className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} 
            style={{ transform: isFabOpen ? 'translateY(-270px)' : '' }}
            onClick={() => handleFabAction('camera')}
          >
            <Camera size={20} className="text-blue-500" />
          </button>
          
          <button 
            className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} 
            style={{ transform: isFabOpen ? 'translateY(-205px)' : '' }}
            onClick={() => handleFabAction('gallery')}
          >
            <Image size={20} className="text-blue-500" />
          </button>

          <button 
            className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} 
            style={{ transform: isFabOpen ? 'translateY(-140px)' : '' }}
            onClick={() => handleFabAction('pdf')}
          >
            <FileText size={20} className="text-blue-500" />
          </button>

          <button 
            className={`fab-sub-button ${isFabOpen ? 'visible' : ''}`} 
            style={{ transform: isFabOpen ? 'translateY(-75px)' : '' }}
            onClick={() => handleFabAction('manual')}
          >
            <Edit size={20} className="text-blue-500" />
          </button>

          {/* Botón Principal */}
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)} 
            className={`fab-main-button ${isFabOpen ? 'open' : ''}`}
          >
            <Plus size={32} className="text-white" />
          </button>
        </div>
      </div>

      {/* NAV INFERIOR FENG SHUI */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-white/60 backdrop-blur-2xl border-t border-white/30 flex justify-around items-center px-8 z-40 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center ${activeTab === "home" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <HomeIcon size={activeTab === "home" ? 28 : 24} />
          {activeTab === "home" && <span className="text-[10px] font-black mt-1 uppercase">Inicio</span>}
        </button>
        <button onClick={() => setActiveTab("agenda")} className={`flex flex-col items-center ${activeTab === "agenda" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <Calendar size={activeTab === "agenda" ? 28 : 24} />
          {activeTab === "agenda" && <span className="text-[10px] font-black mt-1 uppercase">Agenda</span>}
        </button>
        <button onClick={() => setActiveTab("family")} className={`flex flex-col items-center ${activeTab === "family" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <Users size={activeTab === "family" ? 28 : 24} />
          {activeTab === "family" && <span className="text-[10px] font-black mt-1 uppercase">Equipo</span>}
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center ${activeTab === "settings" ? "text-blue-500 scale-110" : "text-gray-300"}`}>
          <Settings size={activeTab === "settings" ? 28 : 24} />
          {activeTab === "settings" && <span className="text-[10px] font-black mt-1 uppercase">Ajustes</span>}
        </button>
      </nav>

      {/* DRAWERS MULTIMODALES (Cerebro IA) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="w-full max-w-md animate-in slide-in-from-bottom duration-500 z-10">
            {dialogType === 'manual' ? (
              <ManualEventDrawer 
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                members={familyMembers} 
                onEventAdded={fetchAllData} 
              />
            ) : (
              <UploadDocumentDrawer 
                type={dialogType}
                isOpen={isDrawerOpen} 
                onClose={() => setIsDrawerOpen(false)} 
                members={familyMembers} 
                onEventAdded={fetchAllData} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
