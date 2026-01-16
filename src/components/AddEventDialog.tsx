import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AddEventDialog = ({ members, onEventAdded }: { members: any[], onEventAdded: () => void }) => {
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
    
    // Aquí iría la llamada a checkConflicts que creamos antes
    const { error } = await supabase
      .from('events')
      .insert([{ 
        title, 
        member_id: memberId, 
        start_time: fullStartTime,
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
        <button className="fab-button fixed bottom-28 right-6 z-50 scale-110 active:scale-95 transition-all">
          <Plus className="text-white w-8 h-8" />
        </button>
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
