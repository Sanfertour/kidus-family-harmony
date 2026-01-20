import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2, Lock, Eye, Sparkles, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from "@/store/useNestStore"; // Importación esencial

export const AddEventDialog = ({ members, onEventAdded, children }: { members: any[], onEventAdded: () => void, children?: React.ReactNode }) => {
  // --- CAPA DE DATOS (Store Global) ---
  const { nestId, profile } = useNestStore();
  
  const [title, setTitle] = useState("");
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState(1440); // 1440 min = 24h (según tu SQL default)
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    // Validación de Verdad Única
    if (!nestId || !profile) {
      toast({ title: "Error de Sincronía", description: "No se detecta tu Nido.", variant: "destructive" });
      return;
    }

    if (!title || !memberId || !date || !time) {
      triggerHaptic('warning');
      toast({ title: "Faltan datos", description: "El Nido necesita saber qué, quién y cuándo.", variant: "destructive" });
      return;
    }
    
    setLoading(true);

    try {
      const fullStartTime = `${date}T${time}:00`;

      // Inserción limpia usando el esquema corregido
      const { error } = await supabase
        .from('events')
        .insert([{ 
          title: title.trim(), 
          assigned_to: memberId, 
          nest_id: nestId, 
          created_by: profile.id,
          start_time: fullStartTime,
          category: 'tribu', // Valor por defecto coherente
          reminder_minutes: reminder, // Nombre exacto de tu columna SQL
          is_private: isPrivate 
        }]);

      if (error) throw error;

      triggerHaptic('success');
      toast({ title: "Sincronía completada", description: "Evento integrado en la agenda familiar." });
      setOpen(false);
      resetForm();
      onEventAdded();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo guardar el evento.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMemberId("");
    setDate("");
    setTime("");
    setIsPrivate(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(v) triggerHaptic('soft'); }}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg" className="rounded-[2rem] bg-slate-900 hover:bg-sky-600 shadow-2xl transition-all duration-500 gap-2 px-8">
            <Plus className="w-5 h-5" /> 
            <span className="font-black text-[10px] tracking-[0.2em] uppercase">Añadir Evento</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-[480px] border-none bg-white/90 backdrop-blur-[40px] shadow-brisa rounded-[3.5rem] p-10 outline-none overflow-hidden">
        
        {/* Línea estética superior */}
        <div className={`absolute top-0 left-0 w-full h-2 transition-colors duration-500 ${isPrivate ? 'bg-orange-500' : 'bg-sky-500'}`} />

        <DialogClose className="absolute right-8 top-8 p-3 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-90 z-50">
          <X size={20} strokeWidth={3} />
        </DialogClose>

        <DialogHeader className="mb-8">
          <div className="flex items-center gap-3 mb-2">
             <Sparkles size={16} className="text-sky-500" />
             <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Nueva Entrada</p>
          </div>
          <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter leading-tight italic">Crea Sincronía</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Input 
            placeholder="¿Qué planes hay?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="h-16 rounded-[2rem] border-none bg-slate-50 px-8 font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-sky-500/10 transition-all text-xl text-center shadow-inner" 
          />
          
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Asignar a</label>
            <select 
              className="w-full h-16 rounded-[1.8rem] border-none bg-slate-50 px-6 font-black text-slate-600 focus:ring-4 focus:ring-sky-500/10 transition-all cursor-pointer appearance-none text-center shadow-inner"
              value={memberId}
              onChange={(e) => { triggerHaptic('soft'); setMemberId(e.target.value); }}
            >
              <option value="">Selecciona un miembro</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option> // Cambiado m.display_name -> m.name
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-16 rounded-[1.8rem] border-none bg-slate-50 px-4 font-black text-slate-600 shadow-inner" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-16 rounded-[1.8rem] border-none bg-slate-50 px-4 font-black text-slate-600 shadow-inner" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* RECORDATORIO */}
            <div className="p-4 bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-inner">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aviso</span>
              <div className="flex gap-2">
                {[60, 1440].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => { triggerHaptic('soft'); setReminder(mins); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${reminder === mins ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                  >
                    {mins === 60 ? '1h' : '24h'}
                  </button>
                ))}
              </div>
            </div>

            {/* MODO PRIVADO */}
            <button
              onClick={() => { triggerHaptic('soft'); setIsPrivate(!isPrivate); }}
              className={`p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 shadow-inner ${isPrivate ? 'bg-orange-500 text-white shadow-orange-100' : 'bg-slate-50 text-slate-400'}`}
            >
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Privacidad</span>
              <div className="flex items-center gap-2">
                {isPrivate ? <Lock size={14} /> : <Eye size={14} />}
                <span className="text-[10px] font-black uppercase">{isPrivate ? "Privado" : "Público"}</span>
              </div>
            </button>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-sky-500 text-white font-black text-lg tracking-[0.2em] shadow-2xl active:scale-[0.97] transition-all duration-500 mt-2 group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <div className="flex items-center gap-3">
                SINCRONIZAR
                <ChevronRight className="group-hover:translate-x-2 transition-transform" size={20} />
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
