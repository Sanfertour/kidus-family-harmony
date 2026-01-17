import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { checkConflicts } from '@/lib/nest-logic';

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

  // Obtenemos el nest_id solo si es necesario, 
  // aunque lo ideal será pasarlo por props en la siguiente iteración
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
    if (!title || !subjectId || !responsibleId || !date || !time) {
      toast({ title: "Faltan piezas", description: "En el nido todos debemos saber quién hace qué.", variant: "destructive" });
      return;
    }

    if (!currentNestId) {
      toast({ title: "Nido no identificado", description: "Espera un segundo a que sincronicemos tu código.", variant: "destructive" });
      return;
    }

    setLoading(true);

    const fullStartTime = `${date}T${time}:00`;
    const endTime = new Date(new Date(fullStartTime).getTime() + 60 * 60 * 1000).toISOString(); 

    // Verificamos conflictos de "tráfico"
    const conflicts = await checkConflicts(responsibleId, fullStartTime, endTime);

    if (conflicts.length > 0) {
      toast({ 
        title: "¡Conflicto de Agenda!", 
        description: `Esta persona ya tiene una tarea asignada a esa hora.`, 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }
    
    const { error } = await supabase
      .from('events')
      .insert([{ 
        title, 
        member_id: subjectId, 
        responsible_id: responsibleId, 
        start_time: fullStartTime,
        end_time: endTime,
        category: 'logistics',
        nest_id: currentNestId 
      }]);

    if (error) {
      toast({ title: "Error de conexión", description: "No pudimos guardar el evento en la nube.", variant: "destructive" });
    } else {
      toast({ title: "Paz Mental Activada", description: "Evento coordinado con éxito." });
      // Reset de campos
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Nuevo Evento</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Título de la actividad</label>
            <Input 
              placeholder="Ej: Dentista, Extraescolar..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rounded-2xl h-14 bg-gray-50 border-none font-bold text-gray-700 focus-visible:ring-blue-500 transition-all" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                <User size={12} /> ¿Para quién?
              </label>
              <select 
                className="w-full h-14 rounded-2xl bg-blue-50/50 border-none px-4 text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-200 transition-all" 
                value={subjectId} 
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                <ShieldCheck size={12} /> ¿Responsable?
              </label>
              <select 
                className="w-full h-14 rounded-2xl bg-orange-50/50 border-none px-4 text-sm font-bold text-orange-700 outline-none focus:ring-2 focus:ring-orange-200 transition-all" 
                value={responsibleId} 
                onChange={(e) => setResponsibleId(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                  <Calendar size={12} /> Fecha
                </label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl h-14 bg-gray-50 border-none font-bold text-gray-700" />
            </div>
            <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                  <Clock size={12} /> Hora
                </label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-2xl h-14 bg-gray-50 border-none font-bold text-gray-700" />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full h-16 rounded-3xl bg-gray-900 hover:bg-black text-white font-black text-lg shadow-xl active:scale-95 transition-all mt-6"
          >
            {loading ? "Sincronizando..." : "Guardar en el Nido"}
          </Button>
        </div>
      </div>
    </div>
  );
};
