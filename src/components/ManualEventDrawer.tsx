import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    const fullEventDate = new Date(`${date}T${time}:00`).toISOString();

    // Mapeo optimizado para evitar Error 400
    const { error } = await supabase
      .from('events')
      .insert([{ 
        description: title,
        event_date: fullEventDate,
        assigned_to: subjectId,
        nest_id: currentNestId,
        status: 'pending',
        is_work_conflict: false
      }]);

    if (error) {
      console.error("❌ Fallo en Supabase:", error);
      toast({ 
        title: "Error de conexión", 
        description: "No pudimos guardar el evento.", 
        variant: "destructive" 
      });
    } else {
      toast({ title: "¡Paz Mental!", description: "Evento guardado con éxito." });
      setTitle(''); setSubjectId(''); setDate(''); setTime('');
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-nunito">
      {/* Overlay con desenfoque Apple Style */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out max-h-[92vh] overflow-y-auto border-t border-white/50">
        {/* Handle superior */}
        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Nuevo Evento</h2>
            <p className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.2em] mt-1">Sincronización Zen</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-[1.2rem] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-8">
          {/* Título */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">¿Qué vamos a hacer?</label>
            <Input 
              placeholder="Ej: Logística Cumpleaños..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rounded-3xl h-16 bg-slate-50/50 border-none font-bold text-slate-700 focus-visible:ring-[#0EA5E9] shadow-inner" 
            />
          </div>
          
          {/* Selector de Miembro */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
              <User size={14} strokeWidth={3} /> ¿Para quién es?
            </label>
            <div className="relative">
              <select 
                className="w-full h-16 rounded-3xl bg-violet-50/30 border-none px-6 text-sm font-bold text-[#8B5CF6] outline-none focus:ring-2 focus:ring-violet-200 transition-all appearance-none" 
                value={subjectId} 
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Selecciona un miembro...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-violet-300">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Calendar size={14} /> Fecha
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-3xl h-16 bg-slate-50/50 border-none font-bold text-slate-700 shadow-inner appearance-none" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Clock size={14} /> Hora
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-3xl h-16 bg-slate-50/50 border-none font-bold text-slate-700 shadow-inner" />
            </div>
          </div>

          {/* Botón Principal */}
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full h-20 rounded-[2.5rem] bg-[#0EA5E9] hover:bg-slate-900 text-white font-black text-xl shadow-xl shadow-blue-100 active:scale-95 transition-all mt-8 group"
          >
            {loading ? (
              <span className="flex items-center gap-2 uppercase tracking-tight text-sm">
                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                Sincronizando...
              </span>
            ) : (
              "Confirmar en el Nido"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
