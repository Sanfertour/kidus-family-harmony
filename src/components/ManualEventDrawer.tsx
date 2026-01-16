import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { checkConflicts } from '@/lib/nest-logic';

export const ManualEventDrawer = ({ isOpen, onClose, onEventAdded, members }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEventAdded: () => void;
  members: any[];
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(''); // El niño / El interesado
  const [responsibleId, setResponsibleId] = useState(''); // El padre que ejecuta
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title || !subjectId || !responsibleId || !date || !time) {
      toast({ title: "Faltan piezas", description: "En el nido todos debemos saber quién hace qué.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const fullStartTime = `${date}T${time}:00`;
    const endTime = new Date(new Date(fullStartTime).getTime() + 60 * 60 * 1000).toISOString(); 

    // Verificamos conflictos para el responsable (el que tiene que ir)
    const conflicts = await checkConflicts(responsibleId, fullStartTime, endTime);

    if (conflicts.length > 0) {
      toast({ 
        title: "¡Alerta Naranja de Conflicto!", 
        description: `El responsable ya tiene otra tarea en ese nido a esa hora.`, 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }
    
    const { error } = await supabase
      .from('events')
      .insert([{ 
        title, 
        member_id: subjectId, // Sujeto del color
        responsible_id: responsibleId, // El que delega/asume
        start_time: fullStartTime,
        end_time: endTime,
        category: 'logistics' 
      }]);

    if (error) {
      toast({ title: "Error", description: "No se pudo sincronizar el nido.", variant: "destructive" });
    } else {
      toast({ title: "Paz Mental Activada", description: "Evento coordinado y notificado." });
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto border-t border-white/50">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        
        <h2 className="text-2xl font-black font-nunito mb-6 text-gray-800">Coordinar Actividad</h2>
        
        <div className="space-y-5">
          {/* Título */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">¿Qué ocurre?</label>
            <Input placeholder="Ej: Recoger del fútbol" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-2xl h-12 bg-gray-50/50 border-none font-bold" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Sujeto (Para quién es) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <User size={10} /> ¿Para quién?
              </label>
              <select className="w-full h-12 rounded-2xl bg-blue-50/50 border-none px-3 text-sm font-bold appearance-none" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Elegir...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
            </div>

            {/* Responsable (Quién lo hace) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <ShieldCheck size={10} /> ¿Quién va?
              </label>
              <select className="w-full h-12 rounded-2xl bg-orange-50/50 border-none px-3 text-sm font-bold appearance-none" value={responsibleId} onChange={(e) => setResponsibleId(e.target.value)}>
                <option value="">Elegir...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl h-12 bg-gray-50/50 border-none font-bold" />
            </div>
            <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hora</label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-2xl h-12 bg-gray-50/50 border-none font-bold" />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-black text-lg shadow-xl active:scale-95 transition-all mt-4"
          >
            {loading ? "Validando Agenda..." : "Sincronizar el Nido"}
          </Button>
        </div>
      </div>
    </div>
  );
};
