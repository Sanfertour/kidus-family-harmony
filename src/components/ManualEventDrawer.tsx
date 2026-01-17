import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, User, CheckCircle2, Lock, EyeOff, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";

export const ManualEventDrawer = ({ 
  isOpen, 
  onClose, 
  onEventAdded, 
  members 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEventAdded: () => void;
  members: any[];
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentNestId, setCurrentNestId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getNestId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nest_id')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) setCurrentNestId(profile.nest_id);
      }
    };
    if (isOpen) getNestId();
  }, [isOpen]);

  const handleSave = async () => {
    if (!title || !subjectId || !date || !time) {
      toast({ 
        title: "Faltan piezas", 
        description: "Rellena todos los campos para una coordinación perfecta.", 
        variant: "destructive" 
      });
      return;
    }

    if (!currentNestId) {
      toast({ title: "Sincronizando...", description: "Localizando tu Nido." });
      return;
    }

    setLoading(true);
    
    // Ajuste de fecha y hora para evitar desfases
    const fullEventDate = new Date(`${date}T${time}:00`).toISOString();

    const { error } = await supabase
      .from('events')
      .insert([{ 
        description: title,
        event_date: fullEventDate,
        assigned_to: subjectId,
        nest_id: currentNestId,
        status: 'pending',
        is_work_conflict: false,
        is_private: isPrivate 
      }]);

    if (error) {
      console.error("❌ Fallo en Supabase:", error);
      toast({ title: "Error de conexión", variant: "destructive" });
    } else {
      toast({ 
        title: isPrivate ? "Shhh... Guardado en secreto" : "¡Paz Mental!", 
        description: isPrivate ? "Nadie verá los detalles, solo que estás ocupado." : "Evento guardado en el Nido." 
      });
      
      // Limpiamos el formulario para la próxima carrera
      setTitle(''); 
      setSubjectId(''); 
      setDate(''); 
      setTime(''); 
      setIsPrivate(false);
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-nunito">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className={`relative w-full max-w-md transition-all duration-500 rounded-t-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto border-t border-white/50 ${isPrivate ? 'bg-[#1E293B] text-white' : 'bg-white/90 text-slate-800 backdrop-blur-2xl'}`}>
        
        <div className={`w-16 h-1.5 rounded-full mx-auto mb-8 ${isPrivate ? 'bg-slate-700' : 'bg-slate-100'}`} />
        
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <h2 className={`text-3xl font-black tracking-tight ${isPrivate ? 'text-white' : 'text-slate-800'}`}>
              {isPrivate ? 'Evento Privado' : 'Nuevo Evento'}
            </h2>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isPrivate ? 'text-slate-400' : 'text-[#0EA5E9]'}`}>
              {isPrivate ? 'Solo tú verás los detalles' : 'Sincronización Zen'}
            </p>
          </div>
          <button onClick={onClose} className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all active:scale-90 ${isPrivate ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-8">
          {/* MODO PRIVADO TOGGLE */}
          <div className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${isPrivate ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPrivate ? 'bg-orange-500 text-white' : 'bg-white text-slate-400'}`}>
                {isPrivate ? <EyeOff size={20} /> : <Shield size={20} />}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Privacidad Inteligente</p>
                <p className={`text-[10px] font-medium ${isPrivate ? 'text-slate-400' : 'text-slate-500'}`}>Ocultar detalles al equipo</p>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} className="data-[state=checked]:bg-orange-500" />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 opacity-50">¿Qué vamos a hacer?</label>
            <Input 
              placeholder={isPrivate ? "Título privado..." : "Ej: Logística Cumpleaños..."}
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`rounded-3xl h-16 border-none font-bold shadow-inner transition-colors ${isPrivate ? 'bg-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-50/50 text-slate-700'}`} 
            />
          </div>
          
          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2 ${isPrivate ? 'text-slate-400' : 'text-[#8B5CF6]'}`}>
              <User size={14} strokeWidth={3} /> ¿Quién se encarga?
            </label>
            <div className="relative">
              <select 
                className={`w-full h-16 rounded-3xl border-none px-6 text-sm font-bold outline-none appearance-none transition-colors ${isPrivate ? 'bg-slate-800 text-white' : 'bg-violet-50/30 text-[#8B5CF6]'}`} 
                value={subjectId} 
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Selecciona un miembro...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2 opacity-50">
                <Calendar size={14} /> Fecha
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`rounded-3xl h-16 border-none font-bold shadow-inner appearance-none transition-colors ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-50/50 text-slate-700'}`} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-2 flex items-center gap-2 opacity-50">
                <Clock size={14} /> Hora
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`rounded-3xl h-16 border-none font-bold shadow-inner transition-colors ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-50/50 text-slate-700'}`} />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all mt-8 ${isPrivate ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-900/20' : 'bg-[#0EA5E9] hover:bg-slate-900 text-white shadow-blue-100'}`}
          >
            {loading ? "Sincronizando..." : isPrivate ? "Guardar Privado" : "Confirmar en el Nido"}
          </Button>
        </div>
      </div>
    </div>
  );
};
