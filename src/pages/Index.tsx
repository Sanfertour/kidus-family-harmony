import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Users, Calendar, Home as HomeIcon, LayoutDashboard } from "lucide-react";
import Header from "@/components/Header";
import UpcomingEvents from "@/components/UpcomingEvents";
import { AgendaView } from "@/components/AgendaView";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import { AddEventDialog } from "@/components/AddEventDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen wave-bg pb-32 font-sans antialiased">
      <Header />
      
      <main className="container mx-auto px-4 pt-4 max-w-md">
        {/* VISTA: INICIO */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-2">
                <LayoutDashboard className="w-5 h-5 text-kidus-blue" />
                <h2 className="text-xl font-bold font-nunito">Resumen Diario</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Tienes <span className="text-kidus-blue font-bold">{events.length} eventos</span> programados hoy.
              </p>
            </div>
            <UpcomingEvents events={events.slice(0, 3)} />
          </div>
        )}

        {/* VISTA: AGENDA */}
        {activeTab === "agenda" && (
          <div className="animate-in slide-in-from-right-4">
            <AgendaView />
          </div>
        )}

        {/* VISTA: FAMILIA */}
        {activeTab === "family" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-2xl font-bold font-nunito">Mi Equipo</h2>
              <AddMemberDialog onMemberAdded={fetchAllData} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="glass-card p-4 rounded-[2rem] flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-kidus-blue/10 flex items-center justify-center mb-2">
                    <Users className="text-kidus-blue w-8 h-8" />
                  </div>
                  <span className="font-bold text-sm">{member.display_name}</span>
                  <span className="text-[10px] opacity-50 uppercase">{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* BOTÓN FLOTANTE REAL: Solo visible si hay familia */}
      {familyMembers.length > 0 && (
        <AddEventDialog members={familyMembers} onEventAdded={fetchAllData} />
      )}

      {/* NAV INFERIOR */}
      <nav className="fixed bottom-0 left-0 right-0 px-6 py-4 flex justify-around items-center backdrop-blur-3xl bg-white/50 border-t border-white/20 z-40">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center ${activeTab === "home" ? "text-kidus-blue" : "text-gray-400"}`}>
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Inicio</span>
        </button>
        <button onClick={() => setActiveTab("agenda")} className={`flex flex-col items-center ${activeTab === "agenda" ? "text-kidus-blue" : "text-gray-400"}`}>
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Agenda</span>
        </button>
        <button onClick={() => setActiveTab("family")} className={`flex flex-col items-center ${activeTab === "family" ? "text-kidus-blue" : "text-gray-400"}`}>
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Familia</span>
        </button>
      </nav>
    </div>
  );
};

export default Index;
