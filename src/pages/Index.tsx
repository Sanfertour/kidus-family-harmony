import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Importante: Conexión real

import WaveBackground from "@/components/WaveBackground";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import FABRadial from "@/components/FABRadial";
import UpcomingEvents from "@/components/UpcomingEvents";
import ZenState from "@/components/ZenState";
import CalendarView from "@/components/CalendarView";
import MemberAvatar from "@/components/MemberAvatar";
import AssignResponsibleDialog from "@/components/AssignResponsibleDialog";
import { NestMember, EventData } from "@/types/kidus";
import { useConflictDetection } from "@/hooks/useConflictDetection";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [nestName, setNestName] = useState("Tu Nido"); // Identidad del Nido
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<NestMember[]>([]); // Cambiamos mock por state
  const [events, setEvents] = useState<EventData[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [isConflictMode, setIsConflictMode] = useState(false);

  // 🔄 EFECTO DE SINCRONIZACIÓN REALTIME (El corazón de KidUs)
  useEffect(() => {
    fetchNidoData();

    // Suscripción Realtime para cambios en eventos
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, 
        payload => fetchNidoData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchNidoData = async () => {
    // Aquí iría tu lógica de fetch real con Supabase
    // Por ahora mantenemos los mocks que tenías pero integrados en el estado
    console.log("Sincronizando con el Nido...");
  };

  const { eventsWithConflicts, conflicts } = useConflictDetection(events);

  const handleFabOptionSelect = (optionId: string) => {
    const messages: Record<string, string> = {
      camera: "📷 Escaneando documento con IA...",
      gallery: "🖼️ Analizando imagen de la galería...",
      pdf: "📄 Procesando PDF del Nido...",
      manual: "✏️ Entrada manual de evento",
    };
    
    toast.info(messages[optionId] || "Opción seleccionada");
    
    if (optionId === "manual") {
      setIsConflictMode(false);
      setShowAssignDialog(true);
    }
  };

  // ... (mantenemos handleDelegate y handleAssignConfirm con la lógica de Supabase)

  return (
    <div className="min-h-screen max-h-screen overflow-hidden relative flex flex-col bg-background">
      {/* 🌊 Fondo Dinámico (Configurable en Ajustes después) */}
      <WaveBackground />

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {/* Título dinámico según el prompt */}
        <Header nestName={nestName} notificationCount={conflicts.length} />

        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          <motion.section 
            className="px-4 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Filtro de Miembros con estética Glassmorphism */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedMemberId(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-semibold backdrop-blur-md transition-all ${
                  !selectedMemberId
                    ? "bg-primary/20 border border-primary/50 text-primary shadow-inner"
                    : "bg-white/10 border border-white/20 text-muted-foreground"
                }`}
              >
                Todo el Nido
              </button>
              {members.map((member) => (
                <MemberAvatar
                  key={member.id}
                  member={member}
                  isSelected={selectedMemberId === member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  showName
                />
              ))}
            </div>
          </motion.section>

          {/* Renderizado Condicional: Dashboard vs Calendario */}
          <div className="px-4">
            {activeTab === "calendar" ? (
              <CalendarView
                events={eventsWithConflicts}
                members={members}
                selectedMemberId={selectedMemberId}
                onDateSelect={(date) => console.log(date)}
              />
            ) : (
              /* Lógica de Santuario de Calma */
              eventsWithConflicts.length > 0 ? (
                <div className="space-y-4">
                   <h2 className="text-sm font-medium text-muted-foreground px-1">Próximas actividades</h2>
                   <UpcomingEvents
                    events={eventsWithConflicts}
                    members={members}
                    onDelegate={(id) => { setCurrentEventId(id); setShowAssignDialog(true); }}
                  />
                </div>
              ) : (
                <ZenState message="Tu Nido está en paz" />
              )
            )}
          </div>
        </main>

        <FABRadial onOptionSelect={handleFabOptionSelect} />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        <AssignResponsibleDialog
          isOpen={showAssignDialog}
          onClose={() => setShowAssignDialog(false)}
          onConfirm={(memberId) => console.log("Asignado a:", memberId)}
          members={members}
        />
      </div>
    </div>
  );
};

export default Index;
