import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Bell, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkConflicts } from "@/lib/nest-logic";

export const AddEventDialog = ({ members, onEventAdded, children }: { members: any[], onEventAdded: () => void, children?: React.ReactNode }) => {
  const [title, setTitle] = useState("");
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // Mantenemos la funcionalidad: Añadimos el estado de recordatorio sin alterar lo demás
  const [reminder, setReminder] = useState("24h"); 
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const triggerHaptic = (type: 'soft' | 'success') => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (type === 'soft') navigator.vibrate(10);
      else navigator.vibrate([20, 30, 20]);
    }
  };

  const handleSave = async () => {
    if (!title || !memberId || !date || !time) {
      toast({ title: "Faltan datos", description: "Completa todos los campos, capitán.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const fullStartTime = `${date}T${time}:00`;
    const endTime = new Date(new Date(fullStartTime).getTime() + 60 * 60 * 1000).toISOString(); 

    const conflicts = await checkConflicts(memberId, fullStartTime, endTime);

    if (conflicts.length > 0) {
      toast({ 
        title: "¡Conflicto de Agenda!", 
        description: `${members.find(m => m.id === memberId)?.display_name} ya tiene un evento a esa hora.`, 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }
    
    // Mantenemos tu estructura de tabla exacta:
    const { error } = await supabase
      .from('events')
      .insert([{ 
        title, 
        member_id: memberId, 
        start_time: fullStartTime,
        end_time: endTime,
        category: 'logistics',
        reminder_setting: reminder // Se añade el valor del selector
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
      <DialogTrigger asChild onClick={() => triggerHaptic('soft')}>
        {children || (
          <Button size="sm" className="rounded-full bg-slate-800 hover:bg-slate-700 shadow-lg">
            <Plus className="w-4 h-4 mr-1" /> Añadir Evento
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[90vw] sm:max-w-[440px] border-none bg-white/95 backdrop-blur-2xl shadow-2xl rounded-[3.5rem] p-10 outline-none overflow-hidden font-sans">
        
        <DialogClose className="absolute right-8 top-8 p-2 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-800 transition-all active:scale-90 z-50">
          <X size={20} strokeWidth={3} />
        </DialogClose>

        <DialogHeader className="mb-8">
          <DialogTitle className="text-4xl font-black text-slate-800 tracking-tighter font-nunito leading-tight">Nuevo Evento</DialogTitle>
          <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mt-2">Sincronía KidUs</p>
        </DialogHeader>

        <div className="space-y-6">
          <Input 
            placeholder="¿Qué hay que hacer?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="h-16 rounded-[1.8rem] border-none bg-slate-100/50 px-8 font-black text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-sky-500/10 transition-all text-lg text-center" 
          />
          
          <select 
            className="w-full h-16 rounded-[1.8rem] border-none bg-slate-100/50 px-6 font-black text-slate-600 focus:ring-4 focus:ring-sky-500/10 transition-all cursor-pointer appearance-none text-center"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          >
            <option value="">¿Para quién?</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.display_name}</option>
            ))}
          </select>

          <div className="flex gap-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-16 rounded-[1.8rem] border-none bg-slate-100/50 px-4 font-black text-slate-600 focus:ring-4 focus:ring-sky-500/10" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-16 rounded-[1.8rem] border-none bg-slate-100/50 px-4 font-black text-slate-600 focus:ring-4 focus:ring-sky-500/10" />
          </div>

          {/* CONFIGURADOR DE RECORDATORIO ESTÉTICO */}
          <div className="p-6 bg-slate-50 rounded-[2.5rem] space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <Bell size={14} className="text-sky-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aviso previo</span>
            </div>
            <div className="flex gap-2">
              {['30m', '1h', '24h'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { triggerHaptic('soft'); setReminder(opt); }}
                  className={`flex-1 py-3 rounded-2xl text-[10px] font-black transition-all ${reminder === opt ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-white text-slate-400 hover:bg-white/80'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="w-full h-20 rounded-[2.5rem] bg-slate-800 hover:bg-slate-900 text-white font-black text-sm tracking-[0.2em] shadow-xl active:scale-95 transition-all duration-400 uppercase"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Añadir al Nido"}
            </Button>

            <DialogClose asChild>
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => triggerHaptic('soft')}
                className="w-full h-14 rounded-[2rem] font-black text-slate-400 uppercase tracking-widest text-[9px] hover:bg-transparent"
              >
                Volver a la Agenda
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
