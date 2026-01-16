import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, Tag } from 'lucide-react';
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
  const [memberId, setMemberId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    
    const { error } = await supabase
      .from('events')
      .insert([{ 
        title, 
        member_id: memberId, 
        start_time: fullStartTime,
        end_time: endTime,
        category: 'logistics' 
      }]);

    if (error) {
      toast({ title: "Error", description: "No se pudo guardar el evento.", variant: "destructive" });
    } else {
      toast({ title: "¡Evento creado!", description: "La agenda se ha actualizado." });
      setTitle(''); setMemberId(''); setDate(''); setTime('');
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="glass-card rounded-t-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-nunito">Nuevo Evento Manual</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold mb-1 flex items-center gap-1"><Tag className="w-4 h-4" /> Título</label>
            <Input placeholder="Ej: Entrenamiento MTB" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl h-12" />
          </div>
          
          <div>
            <label className="text-sm font-semibold mb-1">Para quién</label>
            <select 
              className="w-full h-12 rounded-xl border border-input bg-background px-3"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Selecciona un miembro</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.display_name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-semibold mb-1 flex items-center gap-1"><Calendar className="w-4 h-4" /> Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl h-12" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold mb-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Hora</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl h-12" />
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full h-14 rounded-2xl bg-kidus-blue hover:bg-kidus-blue/90 text-lg font-bold shadow-lg mt-6">
            {loading ? "Calculando..." : "Añadir al Nido"}
          </Button>
        </div>
      </div>
    </div>
  );
};
