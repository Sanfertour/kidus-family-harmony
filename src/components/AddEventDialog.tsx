import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, Lock, Eye, Sparkles, ChevronRight, Baby, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from "@/store/useNestStore";

export const AddEventDialog = ({ members, onEventAdded, children }: { members: any[], onEventAdded: () => void, children?: React.ReactNode }) => {
  const { nestId, profile } = useNestStore();
  
  const [title, setTitle] = useState("");
  const [protagonistaId, setProtagonistaId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!nestId || !title || !protagonistaId || !date || !time) {
      triggerHaptic('warning');
      toast({ title: "Datos incompletos", description: "El Nido necesita saber qué, quién y cuándo.", variant: "destructive" });
      return;
    }
    
    setLoading(true);

    try {
      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      const { error } = await supabase
        .from('events')
        .insert([{ 
          title: title.trim(), 
          nest_id: nestId,
          assigned_to: protagonistaId,
          created_by: profile?.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          is_private: isPrivate,
          category: 'sincronía'
        }]);

      if (error) throw error;

      triggerHaptic('success');
      toast({ title: "Sincronía Élite", description: "Evento guardado en el Nido." });
      setOpen(false);
      resetForm();
      onEventAdded();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: "La base de datos rechazó el evento.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle(""); setProtagonistaId(""); setDate(""); setTime(""); setIsPrivate(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(v) triggerHaptic('soft'); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-[500px] border-none bg-slate-50 shadow-2xl rounded-[3.5rem] p-8 outline-none overflow-y-auto max-h-[90vh]">
        <div className={`absolute top-0 left-0 w-full h-3 transition-colors duration-500 rounded-t-[3.5rem] ${isPrivate ? 'bg-orange-500' : 'bg-sky-500'}`} />
        
        <DialogHeader className="mb-6 pt-4">
          <div className="flex items-center gap-2 mb-1">
             <Sparkles size={14} className="text-sky-500" />
             <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em]">Nueva Actividad</p>
          </div>
          <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Agendar Nido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Input 
            placeholder="¿Qué evento es?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="h-16 rounded-[2rem] border-none bg-white px-8 font-black text-slate-900 text-xl shadow-sm focus:ring-2 focus:ring-sky-500/20" 
          />

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 flex items-center gap-2">
              <Baby size={12} /> Seleccionar Miembro
            </label>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { triggerHaptic('soft'); setProtagonistaId(m.id); }}
                  className={`flex-shrink-0 min-w-[100px] p-5 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 ${
                    protagonistaId === m.id 
                    ? "bg-slate-900 border-sky-400 scale-105 shadow-xl" 
                    : "bg-white border-transparent text-slate-400 opacity-60"
                  }`}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                    style={{ backgroundColor: m.color || m.avatar_url || '#0EA5E9' }}
                  >
                    {m.name ? m.name.charAt(0).toUpperCase() : <User size={20} />}
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${protagonistaId === m.id ? "text-white" : "text-slate-800"}`}>
                      {m.name || "Sin nombre"}
                    </p>
                    <p className={`text-[8px] font-bold opacity-60 ${protagonistaId === m.id ? "text-sky-300" : "text-slate-400"}`}>
                      {m.role === 'adult' ? 'GUÍA' : 'TRIBU'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 rounded-[1.5rem] border-none bg-white px-4 font-black text-slate-700 shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Hora</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-14 rounded-[1.5rem] border-none bg-white px-4 font-black text-slate-700 shadow-sm" />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-sky-500 text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-[0.97] transition-all duration-500"
            >
              {loading ? <Loader2 className="animate-spin" /> : "SINCRONIZAR EVENTO"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
