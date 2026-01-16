import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Calendar, Home as HomeIcon, Plus, Camera, Image, FileText, Edit } from "lucide-react";
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
          <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="glass-card p-8 rounded-[2.5rem] sanctuary-breeze shadow-xl border-white/40">
              <div className="flex items-center gap-3 mb-4">
                <img src={KidusLogo} alt="Kidus Logo" className="w-10 h-10 object-contain drop-shadow-md" />
                <h2 className="text-2xl font-black tracking-tight">Armonía en el Nido</h2>
              </div>
              <div className="inline-block px-3 py-1 bg-white/50 rounded-full text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
                Estado Actual
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {events.length === 0 
                  ? "Tu nido está en completa calma. No hay tareas pendientes para hoy." 
                  : `Tienes ${events.length} compromisos detectados. Todo bajo control.`}
              </p>
            </div>
            
            {events.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Próximos Eventos</h3>
                <UpcomingEvents events={events.slice(0, 3)} />
              </div>
            )}
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
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-black">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="glass-card p-6 flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-3 border-2 border-blue-50">
                    <span className="text-2xl font-black text-blue-500">{member.display_name?.charAt(0)}</span>
                  </div>
                  <span className="font-bold text-gray-800">{member.display_name}</span>
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
