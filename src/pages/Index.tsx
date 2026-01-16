import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, UserPlus, Settings as SettingsIcon, Trash2 } from "lucide-react";

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
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [nestName, setNestName] = useState("Cargando Nido...");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [members, setMembers] = useState<NestMember[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // 🔄 SINCRONIZACIÓN REALTIME
  useEffect(() => {
    fetchNidoData();

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => fetchNidoData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchNidoData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchNidoData = async () => {
    try {
      // 1. Obtener datos del Nido
      const { data: nestData } = await supabase.from('nests').select('name').single();
      if (nestData) setNestName(nestData.name);

      // 2. Obtener Miembros
      const { data: membersData } = await supabase.from('members').select('*');
      if (membersData) {
        setMembers(membersData.map(m => ({
          id: m.id,
          name: m.name,
          role: m.role,
          color: m.color || "#94a3b8",
          avatar: m.avatar_url
        })));
      }

      // 3. Obtener Eventos
      const { data: eventsData } = await supabase.from('events').select('*');
      if (eventsData) {
        setEvents(eventsData.map(e => ({
          id: e.id,
          title: e.title,
          date: e.date,
          startTime: e.start_time,
          endTime: e.end_time,
          memberId: e.member_id,
          memberName: membersData?.find(m => m.id === e.member_id)?.name || "Alguien",
          memberColor: membersData?.find(m => m.id === e.member_id)?.color || "#000",
          type: e.type,
          isPrivate: e.is_private
        })));
      }
    } catch (error) {
      console.error("Error cargando el Nido:", error);
    }
  };

  const { eventsWithConflicts, conflicts } = useConflictDetection(events);

  // Filtrar eventos por miembro seleccionado
  const filteredEvents = selectedMemberId 
    ? eventsWithConflicts.filter(e => e.memberId === selectedMemberId)
    : eventsWithConflicts;

  const handleAddMember = async () => {
    const name = prompt("Nombre del nuevo miembro:");
    if (!name) return;
    
    const { error } = await supabase.from('members').insert([
      { name, role: 'child', color: '#FF6B6B' }
    ]);
    
    if (error) toast.error("Error al añadir miembro");
    else toast.success(`${name} se ha unido al Nido`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden relative flex flex-col bg-slate-50">
      <WaveBackground />

      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <Header 
          nestName={nestName} 
          notificationCount={conflicts.length} 
          onSettingsClick={() => setShowSettings(true)}
        />

        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {/* Dashboard Principal */}
          {activeTab === "home" && (
            <div className="p-4 space-y-6">
              {/* Filtro Rápido de Miembros */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedMemberId(null)}
                  className={`flex-shrink-0 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    !selectedMemberId ? "bg-slate-900 text-white shadow-lg" : "bg-white/40 text-slate-500"
                  }`}
                >
                  EL NIDO
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

              {filteredEvents.length > 0 ? (
                <UpcomingEvents events={filteredEvents} members={members} />
              ) : (
                <ZenState message={selectedMemberId ? "Sin tareas pendientes" : "Tu Nido está en paz"} />
              )}
            </div>
          )}

          {/* Vista de Calendario */}
          {activeTab === "calendar" && (
            <div className="p-4">
              <CalendarView events={eventsWithConflicts} members={members} selectedMemberId={selectedMemberId} />
            </div>
          )}

          {/* Vista de Familia (Gestión Real) */}
          {activeTab === "family" && (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-900">Miembros</h2>
                <Button onClick={handleAddMember} className="rounded-full h-10 w-10 p-0 bg-primary shadow-lg">
                  <UserPlus size={20} />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {members.map(member => (
                  <motion.div 
                    key={member.id}
                    className="bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white flex items-center justify-between shadow-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-4">
                      <MemberAvatar member={member} size="md" />
                      <div>
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="text-[10px] font-bold uppercase
