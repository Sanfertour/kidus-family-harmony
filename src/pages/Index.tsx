import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Calendar, Home as HomeIcon, LayoutDashboard, Plus } from "lucide-react";
import Header from "@/components/Header";
import UpcomingEvents from "@/components/UpcomingEvents";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { AddEventDialog } from "@/components/AddEventDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Importa tu logo si lo tienes en assets
import KidusLogo from '@/assets/kidus-logo-C1AuyFb2.png'; // Asegúrate de que esta ruta sea correcta

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    // Opcional: Suscribirse a cambios en Supabase para realtime
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

  return (
    <div className="min-h-screen wave-bg pb-32 font-sans antialiased text-foreground">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 max-w-md animate-in fade-in duration-700">
        {/* VISTA: INICIO */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                {/* ICONO DEL NIDO (Si tienes un SVG o PNG, aquí iría) */}
                <img src={KidusLogo} alt="Kidus Logo" className="w-8 h-8 opacity-90" />
                <h2 className="text-xl font-bold font-nunito">Armonía en el Nido</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gestiona la logística familiar con calma. Tienes <span className="text-kidus-blue font-bold">{familyMembers.length} miembros</span> y <span className="text-kidus-blue font-bold">{events.length} tareas</span> activas.
              </p>
            </div>
            {/* Solo muestra UpcomingEvents si hay eventos */}
            {events.length > 0 && <UpcomingEvents events={events.slice(0, 3)} />}
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
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-bold font-nunito">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                <p className="col-span-2 text-center py-8 opacity-60 italic">Cargando nido...</p>
              ) : familyMembers.length === 0 ? (
                <div className="col-span-2 glass-card p-8 text-center opacity-70">
                  <p className="font-nunito text-sm">Aún no hay nadie en el nido.</p>
                  <p className="text-xs text-muted-foreground mt-1">¡Añade a tu primer familiar para empezar!</p>
                </div>
              ) : (
                familyMembers.map((member) => (
                  <div key={member.id} className="glass-card p-4 rounded-[2rem] flex flex-col items-center justify-center text-center group transition-all hover:scale-[1.02] active:scale-98">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-kidus-blue/10 flex items-center justify-center mb-2 border-2 border-white shadow-inner">
                      {/* Avatar del miembro con su inicial */}
                      <span className="text-2xl font-bold text-kidus-blue">{member.display_name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-bold text-sm block">{member.display_name}</span>
                    <span className="text-[10px] bg-kidus-blue/10 text-kidus-blue px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider font-bold">
                      {member.role || 'Miembro'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA: AJUSTES (Mantener por ahora para completar la navegación) */}
        {activeTab === "settings" && (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold font-nunito px-2">Configuración</h2>
            <div className="glass-card p-2 rounded-[2rem] overflow-hidden">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl text-left hover:bg-white/40 px-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">👤</div>
                  Mi Perfil
                </Button>
                <Button variant="ghost" className="w-full justify-start h-14 rounded-2xl text-left hover:bg-white/40 px-4">
                  <div className="w-8 h-8 rounded-lg bg-kidus-blue/10 flex items-center justify-center mr-3">🔗</div>
                  Emparejar con Pareja
                </Button>
                <div className="h-[1px] bg-white/20 my-2 mx-4" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-14 rounded-2xl text-left text-red-500 hover:bg-red-50/50 px-4"
                  onClick={() => supabase.auth.signOut()}
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">🚪</div>
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTÓN FLOTANTE: Añadir Evento o Miembro (Lógica condicional) */}
      <div className="fixed bottom-28 right-6 z-50">
        {activeTab === "family" ? (
          <AddMemberDialog onMemberAdded={fetchAllData}>
            <button className="fab-button w-14 h-14 rounded-full shadow-2xl flex items-center justify-center scale-110 active:scale-95 transition-all bg-gradient-to-br from-kidus-blue to-kidus-teal">
              <Users className="text-white w-7 h-7" />
            </button>
          </AddMemberDialog>
        ) : (
          <AddEventDialog members={familyMembers} onEventAdded={fetchAllData}>
            <button className="fab-button w-14 h-14 rounded-full shadow-2xl flex items-center justify-center scale-110 active:scale-95 transition-all bg-gradient-to-br from-orange-500 to-orange-400">
              <Plus className="text-white w-8 h-8" />
            </button>
          </AddEventDialog>
        )}
      </div>

      {/* NAV INFERIOR CON ANIMACIONES Y ETIQUETAS */}
      <nav className="fixed bottom-0 left-0 right-0 px-6 py-4 flex justify-around items-center backdrop-blur-3xl bg-white/50 border-t border-white/20 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[40px]">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center transition-all duration-300 ${activeTab === "home" ? "text-kidus-blue scale-110" : "text-gray-400 hover:text-gray-600"}`}>
          <HomeIcon className={`${activeTab === "home" ? "w-7 h-7" : "w-6 h-6"}`} />
          <span className={`text-[10px] font-bold mt-1.5 transition-opacity ${activeTab === "home" ? "opacity-100" : "opacity-0"}`}>Inicio</span>
        </button>
        <button onClick={() => setActiveTab("agenda")} className={`flex flex-col items-center transition-all duration-300 ${activeTab === "agenda" ? "text-kidus-blue scale-110" : "text-gray-400 hover:text-gray-600"}`}>
          <Calendar className={`${activeTab === "agenda" ? "w-7 h-7" : "w-6 h-6"}`} />
          <span className={`text-[10px] font-bold mt-1.5 transition-opacity ${activeTab === "agenda" ? "opacity-100" : "opacity-0"}`}>Agenda</span>
        </button>
        <button onClick={() => setActiveTab("family")} className={`flex flex-col items-center transition-all duration-300 ${activeTab === "family" ? "text-kidus-blue scale-110" : "text-gray-400 hover:text-gray-600"}`}>
          <Users className={`${activeTab === "family" ? "w-7 h-7" : "w-6 h-6"}`} />
          <span className={`text-[10px] font-bold mt-1.5 transition-opacity ${activeTab === "family" ? "opacity-100" : "opacity-0"}`}>Familia</span>
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center transition-all duration-300 ${activeTab === "settings" ? "text-kidus-blue scale-110" : "text-gray-400 hover:text-gray-600"}`}>
          <Settings className={`${activeTab === "settings" ? "w-7 h-7" : "w-6 h-6"}`} />
          <span className={`text-[10px] font-bold mt-1.5 transition-opacity ${activeTab === "settings" ? "opacity-100" : "opacity-0"}`}>Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default Index;
