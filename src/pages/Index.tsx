import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Calendar, Home as HomeIcon, LayoutDashboard } from "lucide-react";
import Header from "@/components/Header";
import UpcomingEvents from "@/components/UpcomingEvents";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Función para cargar los miembros (la usaremos al iniciar y al añadir uno nuevo)
  const fetchFamily = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (data) setFamilyMembers(data);
    } catch (err) {
      console.error("Error cargando familia:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  return (
    <div className="min-h-screen wave-bg pb-24 font-sans antialiased selection:bg-kidus-blue/20">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 max-w-md animate-in fade-in duration-700">
        {/* VISTA: INICIO */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-kidus-blue/10 rounded-xl">
                  <LayoutDashboard className="w-5 h-5 text-kidus-blue" />
                </div>
                <h2 className="text-2xl font-bold font-nunito text-foreground">Tu Nido</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Gestiona la logística familiar con calma. Tienes <span className="text-kidus-blue font-bold">{familyMembers.length} miembros</span> activos.
              </p>
            </div>
            <UpcomingEvents />
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
              <h2 className="text-2xl font-bold font-nunito">Mi Familia</h2>
              <AddMemberDialog onMemberAdded={fetchFamily} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                <p className="col-span-2 text-center py-10 opacity-50 italic">Cargando equipo...</p>
              ) : familyMembers.length > 0 ? (
                familyMembers.map((member: any) => (
                  <div key={member.id} className="glass-card p-5 rounded-[2rem] flex flex-col items-center text-center group transition-all hover:scale-105">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white to-kidus-blue/10 flex items-center justify-center mb-3 border-2 border-white shadow-inner">
                      <Users className="w-10 h-10 text-kidus-blue group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-bold text-foreground block">{member.display_name}</span>
                    <span className="text-[10px] bg-kidus-blue/10 text-kidus-blue px-2 py-0.5 rounded-full mt-1 uppercase tracking-wider font-bold">
                      {member.role || 'Miembro'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 glass-card p-8 text-center opacity-70">
                  <p>Aún no hay nadie en el nido.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: AJUSTES */}
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

      {/* NAVEGACIÓN INFERIOR (ESTILO COCKPIT) */}
      <nav className="fixed bottom-0 left-0 right-0 px-8 py-5 flex justify-around items-center backdrop-blur-3xl border-t border-white/20 bg-white/30 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
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
