import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Calendar, Home as HomeIcon, Plus } from "lucide-react";
import Header from "@/components/Header";
import UpcomingEvents from "@/components/UpcomingEvents";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [familyMembers, setFamilyMembers] = useState([]);
  const { toast } = useToast();

  // Cargar miembros de la familia desde Supabase
  useEffect(() => {
    const fetchFamily = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (data) setFamilyMembers(data);
    };
    fetchFamily();
  }, []);

  return (
    <div className="min-h-screen wave-bg pb-24 font-sans antialiased">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 animate-in fade-in duration-700">
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-2xl font-bold text-kidus-blue mb-1">¡Hola, Familia! 👋</h2>
              <p className="text-muted-foreground italic">"Un nido en calma es un equipo fuerte."</p>
            </div>
            <UpcomingEvents />
          </div>
        )}

        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-nunito">Mi Familia</h2>
              <Button size="sm" className="rounded-full bg-kidus-blue hover:bg-kidus-blue/90">
                <Plus className="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member: any) => (
                <div key={member.id} className="glass-card p-4 rounded-2xl flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-kidus-teal/20 flex items-center justify-center mb-2 border-2 border-white">
                    <Users className="w-8 h-8 text-kidus-blue" />
                  </div>
                  <span className="font-bold">{member.display_name || 'Miembro'}</span>
                  <span className="text-xs text-muted-foreground uppercase">{member.role || 'Sin rol'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4 animate-in fade-in">
            <h2 className="text-2xl font-bold mb-4">Ajustes del Nido</h2>
            <div className="glass-card p-4 rounded-2xl space-y-3">
              <Button variant="ghost" className="w-full justify-start text-left hover:bg-white/20">Perfil de Usuario</Button>
              <Button variant="ghost" className="w-full justify-start text-left hover:bg-white/20">Vincular Pareja (Delegación)</Button>
              <Button variant="ghost" className="w-full justify-start text-left text-red-500 hover:bg-red-50/50" onClick={() => supabase.auth.signOut()}>Cerrar Sesión</Button>
            </div>
          </div>
        )}
      </main>

      {/* Navegación Inferior Estilo Cockpit */}
      <nav className="fixed bottom-0 left-0 right-0 px-6 py-4 flex justify-around items-center backdrop-blur-2xl border-t border-white/30 bg-white/40 rounded-t-[32px] shadow-2xl z-50">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center transition-all ${activeTab === "home" ? "text-kidus-blue scale-110" : "text-gray-400"}`}>
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Inicio</span>
        </button>
        <button onClick={() => setActiveTab("agenda")} className={`flex flex-col items-center transition-all ${activeTab === "agenda" ? "text-kidus-blue scale-110" : "text-gray-400"}`}>
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Agenda</span>
        </button>
        <button onClick={() => setActiveTab("family")} className={`flex flex-col items-center transition-all ${activeTab === "family" ? "text-kidus-blue scale-110" : "text-gray-400"}`}>
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Familia</span>
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center transition-all ${activeTab === "settings" ? "text-kidus-blue scale-110" : "text-gray-400"}`}>
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default Index;
