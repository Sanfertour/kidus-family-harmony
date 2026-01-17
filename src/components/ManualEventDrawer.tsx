import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, User, ShieldCheck } from 'lucide-react';
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
  const [responsibleId, setResponsibleId] = useState('');
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
    // Validación de seguridad antes de la carrera
    if (!title || !subjectId || !date || !time) {
      toast({ 
        title: "Faltan piezas", 
        description: "Asegúrate de rellenar todos los campos para una coordinación perfecta.", 
        variant: "destructive" 
      });
      return;
    }

    if (!currentNestId) {
      toast({ title: "Sincronizando...", description: "Estamos localizando tu Nido." });
      return;
    }

    setLoading(true);

    // Formateamos la fecha al estilo ISO que espera Supabase
    const fullEventDate = new Date(`${date}T${time}:00`).toISOString();

    // MAPEO EXACTO PARA ELIMINAR EL ERROR 400
    // Usamos las columnas que confirmaste en tu Table Editor de Supabase
    const { error } = await supabase
      .from('events')
      .insert([{ 
        description: title,           // Tu tabla usa 'description' para el texto
        event_date: fullEventDate,    // Tu tabla usa 'event_date'
        assigned_to: subjectId,       // Tu tabla usa 'assigned_to'
        nest_id: currentNestId,       // Relación obligatoria
        status: 'pending',            // Columna detectada en tu tabla
        is_work_conflict: false       // Columna detectada en tu tabla
      }]);

    if (error) {
      console.error("❌ Fallo en Supabase:", error);
      toast({ 
        title: "Error de conexión", 
        description: "No pudimos guardar el evento. Revisa la red.", 
        variant: "destructive" 
      });
    } else {
      toast({ title: "¡Paz Mental!", description: "Evento guardado en el Nido." });
      // Reset de estados
      setTitle('');
      setSubjectId('');
      setResponsibleId('');
      setDate('');
      setTime('');
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-nunito">
      {/* Overlay con desenfoque Apple Style */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 ease-out max-h-[92vh] overflow-y-auto border-t border-white/20">
        {/* Handle de arrastre visual */}
        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-10" />
        
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Nuevo Evento</h2>
            <span className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-[0.2em] mt-1">Sincronización Manual</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-8">
          {/* Título de la actividad */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">¿Qué vamos a hacer?</label>
            <Input 
              placeholder="Ej: Logística Cumpleaños..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rounded-3xl h-16 bg-slate-50 border-none font-bold text-slate-700 focus-visible:ring-[#0EA5E9] shadow-inner-soft" 
            />
          </div>
          
          {/* Selector de Miembro */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              <User size={14} strokeWidth={3} /> ¿Para quién es?
            </label>
            <select 
              className="w-full h-16 rounded-3xl bg-sky-50/50 border-none px-6 text-sm font-bold text-[#0EA5E9] outline-none focus:ring-2 focus:ring-sky-200 transition-all appearance-none shadow-inner-soft" 
              value={subjectId} 
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Selecciona un miembro...</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Calendar size={14} /> Fecha
                </label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-3xl h-16 bg-slate-50 border-none font-bold text-slate-700 shadow-inner-soft appearance-none" />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Clock size={14} /> Hora
                </label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-3xl h-16 bg-slate-50 border-none font-bold text-slate-700 shadow-inner-soft" />
            </div>
          </div>

          {/* Botón de Acción Principal */}
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full h-20 rounded-[2.5rem] bg-slate-900 hover:bg-[#0EA5E9] text-white font-black text-xl shadow-2xl shadow-slate-200/50 active:scale-[0.97] transition-all mt-8 group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
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
