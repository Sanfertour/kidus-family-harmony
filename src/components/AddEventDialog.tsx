import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkConflicts } from "@/lib/nest-logic"; // Importa la función de conflicto

// Añadido 'children' para el botón personalizado
export const AddEventDialog = ({ members, onEventAdded, children }: { members: any[], onEventAdded: () => void, children?: React.ReactNode }) => {
  const [title, setTitle] = useState("");
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title || !memberId || !date || !time) {
      toast({ title: "Faltan datos", description: "Completa todos los campos, capitán.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const fullStartTime = `${date}T${time}:00`;
    // Asumimos una duración de 1 hora para el conflicto
    const endTime = new Date(new Date(fullStartTime).getTime() + 60 * 60 * 1000).toISOString(); 

    // Aquí usamos la función de detección de conflictos
    const conflicts = await checkConflicts(memberId, fullStartTime, endTime);

    if (conflicts.length > 0) {
      toast({ 
        title: "¡Conflicto de Agenda!", 
        description: `${members.find(m => m.id === memberId)?.display_name} ya tiene un evento a esa hora.`, 
        variant: "destructive" 
      });
      setLoading(false);
      return; // Detenemos el guardado si hay conflicto
    }
    
    const { error } = await supabase
      .from('events')
      .insert([{ 
        title, 
        member_id: memberId, 
        start_time: fullStartTime,
        end_time: endTime, // Guardamos la hora de fin para el conflicto
        category: 'logistics' 
      }]);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el evento.", variant: "destructive" });
    } else {
      toast({ title: "¡Evento creado!", description: "La agenda se ha actualizado." });
      setOpen(false);
      onEventAdded();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || ( // Renderiza el children si existe, si no, un botón por defecto
          <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Plus className="w-4 h-4 mr-1" /> Añadir Evento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-nunito font-black">Nuevo Evento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="¿Qué hay que hacer?" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-12" />
          
          <select 
            className="w-full h-12 rounded-xl border border-input bg-background px-3"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          >
            <option value="">¿Para quién?</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.display_name}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl" />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full h-14 rounded-2xl bg-kidus-blue hover:bg-blue-600 text-lg font-bold shadow-lg">
            {loading ? "Calculando..." : "Añadir al Nido"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
