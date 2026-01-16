import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Calendar, Clock, Tag, User } from 'lucide-react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Fondo con desenfoque */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer con estilo Glassmorphism y bordes de la imagen */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto border-t border-white/50">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black font-nunito tracking-tight text-gray-800">Nuevo Evento</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Qué vamos a hacer
            </label>
            <Input 
              placeholder="Ej: Entrenamiento MTB" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="rounded-2xl h-14 bg-white/50 border-gray-100 focus:ring-blue-500 focus:border-blue-500 font-bold" 
            />
          </div>
          
          {/* Miembro */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <User className="w-3 h-3" /> Quién participa
            </label>
            <select 
              className="w-full h-14 rounded-2xl border border-gray-100 bg-white/50 px-4 font-bold appearance-none"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">Selecciona un miembro</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.display_name}</option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora en Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Cuándo
              </label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="rounded-2xl h-14 bg-white/50 border-gray-100 font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Clock className="w-3 h-3" /> A qué hora
              </label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="rounded-2xl h-14 bg-white/50 border-gray-100 font-bold" 
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white text-lg font-black shadow-xl shadow-orange-100 mt-4 transition-all active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validando Agenda...
              </div>
            ) : (
              "Guardar en el Nido"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
