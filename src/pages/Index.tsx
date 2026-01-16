import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

// Mock data for demonstration
const mockMembers: NestMember[] = [
  {
    id: "adult-1",
    name: "Ana García",
    role: "adult",
    color: "hsl(270, 70%, 60%)",
    custodyDays: [1, 2, 3],
  },
  {
    id: "adult-2",
    name: "Carlos García",
    role: "adult",
    color: "hsl(211, 100%, 50%)",
    custodyDays: [4, 5, 6, 0],
  },
  {
    id: "child-1",
    name: "Lucía García",
    role: "child",
    color: "hsl(340, 80%, 65%)",
    school: "CEIP San Fernando",
    grade: "3º Primaria",
    class: "3ºB",
  },
  {
    id: "child-2",
    name: "Pablo García",
    role: "child",
    color: "hsl(142, 60%, 50%)",
    school: "CEIP San Fernando",
    grade: "1º Primaria",
    class: "1ºA",
  },
];

const mockEvents: EventData[] = [
  {
    id: "1",
    title: "Excursión al Zoo",
    date: "2026-01-16",
    startTime: "09:00",
    endTime: "14:00",
    location: "Zoo de Madrid",
    memberId: "child-1",
    memberName: "Lucía",
    memberColor: "hsl(340, 80%, 65%)",
    type: "school",
    assignedToId: "adult-1",
    assignedToName: "Ana",
  },
  {
    id: "2",
    title: "Clase de Natación",
    date: "2026-01-16",
    startTime: "10:00",
    endTime: "11:30",
    location: "Polideportivo Municipal",
    memberId: "child-2",
    memberName: "Pablo",
    memberColor: "hsl(142, 60%, 50%)",
    type: "activity",
    assignedToId: "adult-2",
    assignedToName: "Carlos",
  },
  {
    id: "3",
    title: "Reunión de Padres",
    date: "2026-01-17",
    startTime: "16:00",
    endTime: "17:00",
    location: "Aula 3ºB",
    memberId: "child-1",
    memberName: "Lucía",
    memberColor: "hsl(340, 80%, 65%)",
    type: "school",
  },
  {
    id: "4",
    title: "Reunión Trabajo",
    date: "2026-01-16",
    startTime: "09:30",
    endTime: "11:00",
    memberId: "adult-1",
    memberName: "Ana",
    memberColor: "hsl(270, 70%, 60%)",
    type: "work",
    assignedToId: "adult-1",
    assignedToName: "Ana",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>(mockEvents);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [isConflictMode, setIsConflictMode] = useState(false);

  // Use conflict detection hook
  const { eventsWithConflicts, conflicts } = useConflictDetection(events);

  const handleFabOptionSelect = (optionId: string) => {
    const messages: Record<string, string> = {
      camera: "📷 Abriendo cámara para escanear documento...",
      gallery: "🖼️ Selecciona una imagen de tu galería",
      pdf: "📄 Selecciona un PDF (circular, menú escolar...)",
      manual: "✏️ Crear evento manualmente",
    };
    toast.info(messages[optionId] || "Opción seleccionada");
    
    if (optionId === "manual") {
      setIsConflictMode(false);
      setShowAssignDialog(true);
    }
  };

  const handleDelegate = (eventId: string) => {
    setCurrentEventId(eventId);
    setIsConflictMode(false);
    setShowAssignDialog(true);
  };

  const handleConflictResolve = (eventId: string) => {
    setCurrentEventId(eventId);
    setIsConflictMode(true);
    setShowAssignDialog(true);
  };

  const handleAssignConfirm = (memberId: string) => {
    if (currentEventId) {
      const member = mockMembers.find((m) => m.id === memberId);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === currentEventId
            ? {
                ...e,
                assignedToId: memberId,
                assignedToName: memberId === "family" ? "Nido" : member?.name.split(" ")[0] || "",
              }
            : e
        )
      );
      toast.success(
        isConflictMode
          ? "Evento delegado correctamente"
          : "Responsable asignado",
        {
          description: memberId === "family" 
            ? "Todo el Nido es responsable"
            : `Asignado a ${member?.name.split(" ")[0]}`,
        }
      );
    }
    setCurrentEventId(null);
    setShowAssignDialog(false);
  };

  const handleMemberFilter = (memberId: string | null) => {
    setSelectedMemberId(memberId);
  };

  const handleDateSelect = (date: Date) => {
    toast.info(`Fecha seleccionada: ${date.toLocaleDateString("es-ES")}`);
  };

  const handleAddMember = () => {
    toast.info("Añadir nuevo miembro", {
      description: "Próximamente podrás registrar nuevos perfiles",
    });
  };

  // Filter events by selected member
  const filteredEvents = selectedMemberId
    ? eventsWithConflicts.filter((e) => e.memberId === selectedMemberId)
    : eventsWithConflicts;

  const currentEvent = currentEventId
    ? events.find((e) => e.id === currentEventId)
    : undefined;

  return (
    <div className="min-h-screen max-h-screen overflow-hidden relative flex flex-col">
      <WaveBackground />

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <Header nestName="Familia García" notificationCount={conflicts.length} />

        <main className="flex-1 overflow-y-auto pb-20">
          {/* Members filter bar */}
          <motion.section
            className="px-4 py-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => handleMemberFilter(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !selectedMemberId
                    ? "bg-primary text-white shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Todos
              </button>
              {mockMembers.map((member) => (
                <MemberAvatar
                  key={member.id}
                  member={member}
                  size="sm"
                  isSelected={selectedMemberId === member.id}
                  onClick={() => handleMemberFilter(member.id)}
                  showName
                />
              ))}
              <button
                onClick={handleAddMember}
                className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
              >
                +
              </button>
            </div>
          </motion.section>

          {/* Quick stats - compact */}
          <motion.section
            className="px-4 py-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="glass-card rounded-xl p-3 text-center">
                <span className="text-xl font-bold text-primary">
                  {filteredEvents.length}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Esta semana</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <span className="text-xl font-bold text-accent">
                  {filteredEvents.filter((e) => e.hasConflict).length}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Conflictos</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <span className="text-xl font-bold text-success">
                  {filteredEvents.filter((e) => e.assignedToId).length}
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Asignados</p>
              </div>
            </div>
          </motion.section>

          {/* Calendar view (shown in calendar tab) */}
          {activeTab === "calendar" ? (
            <CalendarView
              events={eventsWithConflicts}
              members={mockMembers}
              selectedMemberId={selectedMemberId}
              onMemberFilter={handleMemberFilter}
              onDateSelect={handleDateSelect}
            />
          ) : (
            /* Events or Zen state */
            filteredEvents.length > 0 ? (
              <UpcomingEvents
                events={filteredEvents}
                members={mockMembers}
                onDelegate={handleDelegate}
                onConflictResolve={handleConflictResolve}
              />
            ) : (
              <ZenState />
            )
          )}
        </main>

        {/* FAB */}
        <FABRadial onOptionSelect={handleFabOptionSelect} />

        {/* Bottom nav */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Assign responsible dialog */}
        <AssignResponsibleDialog
          isOpen={showAssignDialog}
          onClose={() => {
            setShowAssignDialog(false);
            setCurrentEventId(null);
          }}
          onConfirm={handleAssignConfirm}
          members={mockMembers}
          eventData={currentEvent}
          isConflict={isConflictMode}
        />
      </div>
    </div>
  );
};

export default Index;
