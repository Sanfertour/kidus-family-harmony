import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Bell, X, Loader2, Lock, Eye, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/utils/haptics";

export const AddEventDialog = ({ members, onEventAdded, children }: { members: any[], onEventAdded: () => void, children?: React.ReactNode }) => {
  const [title, setTitle] = useState("");
  const [memberId, setMemberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reminder, setReminder] = useState("24h"); 
  const [isPrivate, setIsPrivate] = useState(false); // NUEVO: Modo Privado
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title || !memberId || !date || !time) {
      toast({ title: "Faltan datos", description: "El Nido necesita saber qué y cuándo.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('nest_id').eq('id', user?.id).single();

      if (!profile?.nest_id) throw new Error("No tienes un Nido vinculado");

      const fullStartTime = `${date}T${time}:00`;
      const endTime = new Date(new Date(fullStartTime).getTime() + 60 * 60 * 1000).toISOString(); 

      // Insertamos con la nueva lógica de Sincronía
      const { error } = await supabase
        .from('events')
        .insert([{ 
          title, 
          assigned_to: memberId, // Cambiado de member_id a assigned_to según el esquema Élite
          nest_id: profile.nest_id, // CRÍTICO: Vinculación al Nido
          created_by: user?.id,
          start_time: fullStartTime,
          end_time: endTime,
          category: 'general',
          reminder_setting: reminder,
          is_private: isPrivate // NUEVO
        }]);

      if (error) throw error;

      triggerHaptic('medium');
      toast({ title: "Sincronía completada", description: "El evento ya está en el Nido." });
      setOpen(false);
      resetForm();
      onEventAdded();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={() => triggerHaptic('soft')}>
        {children || (
          <Button size="lg" className="rounded-[2rem] bg-slate-900 hover:bg-sky-600 shadow-2xl transition-all duration-500 gap-2 px-8">
            <Plus className="w-5 h-5" /> 
            <span className="font-black text-[10px] tracking-[0.2em] uppercase">Añadir Evento</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-[480px] border-none bg-white/80 backdrop-blur-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] rounded-[4rem] p-10 outline-none overflow-hidden">
        
        <DialogClose className="absolute right-10 top-10 p-3 rounded-2xl bg-white/50 text-slate-400 hover:text-slate-900 transition-all active:scale-90 z-50">
          <X size={20} strokeWidth={3} />
        </DialogClose>

        <DialogHeader className="mb-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-sky-500/10 rounded-lg">
                <Sparkles size={16} className="text-sky-500" />
             </div>
             <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Nueva Entrada</p>
          </div>
          <DialogTitle className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Crea Sincronía</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* TÍTULO - Más grande y central */}
          <Input 
            placeholder="¿Qué planes hay?" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="h-20 rounded-[2rem] border-none bg-white/60 px-8 font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-sky-500/10 transition-all text-2xl text-center" 
          />
          
          <select 
            className="w-full h-16 rounded-[1.8rem] border-none bg-white/60 px-6 font-black text-slate-600 focus:ring-4 focus:ring-sky-500/10 transition-all cursor-pointer appearance-none text-center"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          >
            <option value="">¿A quién asignamos?</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.display_name}</option>
            ))}
          </select>

          <div className="flex gap-4">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-16 rounded-[1.8rem] border-none bg-white/60 px-4 font-black text-slate-600" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-16 rounded-[1.8rem] border-none bg-white/60 px-4 font-black text-slate-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* RECORDATORIO */}
            <div className="p-4 bg-slate-900/5 rounded-[2rem] flex flex-col items-center justify-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aviso</span>
              <div className="flex gap-1">
                {['1h', '24h'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { triggerHaptic('soft'); setReminder(opt); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${reminder === opt ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* MODO PRIVADO */}
            <button
              onClick={() => { triggerHaptic('soft'); setIsPrivate(!isPrivate); }}
              className={`p-4 rounded-[2rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 ${isPrivate ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-900/5 text-slate-400'}`}
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
            className="w-full h-24 rounded-[2.8rem] bg-slate-900 hover:bg-sky-500 text-white font-black text-lg tracking-[0.1em] shadow-2xl active:scale-[0.97] transition-all duration-500 mt-4 group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <div className="flex items-center gap-3">
                AÑADIR AL NIDO
                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
