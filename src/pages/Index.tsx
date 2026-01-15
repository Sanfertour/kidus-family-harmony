import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import WaveBackground from "@/components/WaveBackground";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import FABRadial from "@/components/FABRadial";
import ChildrenSelector from "@/components/ChildrenSelector";
import UpcomingEvents from "@/components/UpcomingEvents";
import ZenState from "@/components/ZenState";
import { Child } from "@/components/ChildBadge";
import { EventData } from "@/components/EventCard";

// Mock data for demonstration
const mockChildren: Child[] = [
  {
    id: "1",
    name: "Lucía García",
    school: "CEIP San Fernando",
    grade: "3º Primaria",
    class: "3ºB",
    color: "hsl(340, 80%, 65%)", // Pink
  },
  {
    id: "2",
    name: "Pablo García",
    school: "CEIP San Fernando",
    grade: "1º Primaria",
    class: "1ºA",
    color: "hsl(211, 100%, 60%)", // Blue
  },
];

const mockEvents: EventData[] = [
  {
    id: "1",
    title: "Excursión al Zoo",
    date: "15 Ene",
    time: "09:00 - 14:00",
    location: "Zoo de Madrid",
    childName: "Lucía",
    childColor: "hsl(340, 80%, 65%)",
    type: "school",
    assignedTo: "Mamá",
  },
  {
    id: "2",
    title: "Clase de Natación",
    date: "15 Ene",
    time: "17:30 - 18:30",
    location: "Polideportivo Municipal",
    childName: "Pablo",
    childColor: "hsl(211, 100%, 60%)",
    type: "activity",
    hasConflict: true,
    assignedTo: "Papá",
  },
  {
    id: "3",
    title: "Reunión de Padres",
    date: "16 Ene",
    time: "16:00 - 17:00",
    location: "Aula 3ºB",
    childName: "Lucía",
    childColor: "hsl(340, 80%, 65%)",
    type: "school",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedChildId, setSelectedChildId] = useState<string>("all");
  const [events] = useState<EventData[]>(mockEvents);
  const [showZenState, setShowZenState] = useState(false);

  const handleFabOptionSelect = (optionId: string) => {
    const messages: Record<string, string> = {
      camera: "📷 Abriendo cámara para escanear documento...",
      gallery: "🖼️ Selecciona una imagen de tu galería",
      pdf: "📄 Selecciona un PDF (circular, menú escolar...)",
      manual: "✏️ Crear evento manualmente",
    };
    toast.info(messages[optionId] || "Opción seleccionada");
  };

  const handleDelegate = (eventId: string) => {
    toast.success("Solicitud de delegación enviada", {
      description: "El otro progenitor recibirá una notificación",
    });
  };

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
  };

  const handleAddChild = () => {
    toast.info("Añadir nuevo hijo", {
      description: "Próximamente podrás registrar nuevos perfiles",
    });
  };

  const filteredEvents =
    selectedChildId === "all"
      ? events
      : events.filter((e) => {
          const child = mockChildren.find((c) => c.id === selectedChildId);
          return child && e.childName === child.name.split(" ")[0];
        });

  return (
    <div className="min-h-screen relative">
      <WaveBackground />
      
      <div className="relative z-10 safe-bottom">
        <Header userName="Familia García" notificationCount={2} />
        
        <main className="pb-4">
          {/* Children selector */}
          <ChildrenSelector
            children={mockChildren}
            selectedChildId={selectedChildId}
            onChildSelect={handleChildSelect}
            onAddChild={handleAddChild}
          />

          {/* Quick stats */}
          <motion.section
            className="px-4 py-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-primary">{filteredEvents.length}</span>
                <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-accent">
                  {filteredEvents.filter((e) => e.hasConflict).length}
                </span>
                <p className="text-xs text-muted-foreground mt-1">Conflictos</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <span className="text-2xl font-bold text-success">2</span>
                <p className="text-xs text-muted-foreground mt-1">Delegados</p>
              </div>
            </div>
          </motion.section>

          {/* Events or Zen state */}
          {filteredEvents.length > 0 ? (
            <UpcomingEvents events={filteredEvents} onDelegate={handleDelegate} />
          ) : (
            <ZenState />
          )}
        </main>

        {/* FAB */}
        <FABRadial onOptionSelect={handleFabOptionSelect} />
        
        {/* Bottom nav */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default Index;
