import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, Calendar, Clock, User, CheckCircle2, Shield, EyeOff, 
  MapPin, AlignLeft, Sparkles, Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";

export const ManualEventDrawer = ({ 
  isOpen, 
  onClose, 
  onEventAdded, 
  members,
  initialData // Prop vital para la IA
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onEventAdded: () => void;
  members: any[];
  initialData?: any;
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentNestId, setCurrentNestId] = useState<string | null>(null);
  const { toast } = useToast();

  // Sincronización con la IA e ID del Nido
  useEffect(() => {
    const prepareDrawer = async () => {
      // 1. Cargar datos de la IA si existen
      if (initialData) {
        setTitle(initialData.description || '');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        if (initialData.location) setLocation(initialData.location);
        if (initialData.notes) setNotes(initialData.notes);
      }

      // 2. Obtener el Nido
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
    if (isOpen) prepareDrawer();
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!title || !date || !time) {
      toast({ 
        title: "Faltan piezas", 
        description: "El título, la fecha y la hora son obligatorios para el equipo.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    const fullEventDate = new Date(`${date}T${time}:00`).toISOString();

    const { error } = await supabase
      .from('events')
      .insert([{ 
        description: title,
        event_date: fullEventDate,
        assigned_to: subjectId || null,
        nest_id: currentNestId,
        status: 'pending',
        is_private: isPrivate,
        // Si añadiste estas columnas a tu DB, descoméntalas:
        // location: location,
        // notes: notes 
      }]);

    if (error) {
      toast({ title: "Error de conexión", variant: "destructive" });
    } else {
      toast({ 
        title: isPrivate ? "Evento Privado Guardado" : "¡Sincronización Exitosa!", 
        description: "El Nido ha sido actualizado." 
      });
      resetForm();
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle(''); setSubjectId(''); setDate(''); setTime('');
    setLocation(''); setNotes(''); setIsPrivate(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-nunito">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className={`relative w-full max-w-md transition-all duration-500 rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto border-t border-white/50 ${isPrivate ? 'bg-[#1E293B] text-white' : 'bg-white/95 text-slate-800 backdrop-blur-2xl'}`}>
        
        <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isPrivate ? 'bg-slate-700' : 'bg-slate-200'}`} />
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {initialData && <Sparkles size={16} className="text-[#0EA5E9] animate-pulse" />}
              <h2 className={`text-2xl font-black tracking-tight ${isPrivate ? 'text-white' : 'text-slate-800'}`}>
                {initialData ? 'Validar Escaneo' : isPrivate ? 'Evento Privado' : 'Añadir al Nido'}
              </h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Gestión de Carga Mental</p>
          </div>
          <button onClick={onClose} className="p-2 hover:rotate-90 transition-transform">
            <X size={24} className="opacity-30" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* MODO PRIVADO */}
          <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${isPrivate ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isPrivate ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                {isPrivate ? <EyeOff size={18} /> : <Shield size={18} />}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase">Privacidad</p>
                <p className="text-[9px] opacity-60">Solo tú verás los detalles</p>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} className="data-[state=checked]:bg-orange-500" />
          </div>

          {/* TÍTULO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-3 opacity-50">¿Qué evento es?</label>
            <Input 
              placeholder="Ej: Dentista, Entrenamiento, Cumple..."
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`rounded-2xl h-14 border-none font-bold shadow-inner ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/50'}`} 
            />
          </div>

          {/* ASIGNACIÓN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-3 opacity-50 flex items-center gap-2">
              <User size={12} /> Responsable
            </label>
            <select 
              className={`w-full h-14 rounded-2xl border-none px-5 text-sm font-bold outline-none appearance-none ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/50 text-slate-700'}`} 
              value={subjectId} 
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Sin asignar (al grupo)</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
            </select>
          </div>

          {/* FECHA Y HORA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-3 opacity-50 flex items-center gap-2">
                <Calendar size={12} /> Fecha
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`rounded-2xl h-14 border-none font-bold shadow-inner ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/50'}`} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-3 opacity-50 flex items-center gap-2">
                <Clock size={12} /> Hora
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`rounded-2xl h-14 border-none font-bold shadow-inner ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/50'}`} />
            </div>
          </div>

          {/* UBICACIÓN (Nuevo) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-3 opacity-50 flex items-center gap-2">
              <MapPin size={12} /> Ubicación
            </label>
            <Input 
              placeholder="¿Dónde?" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className={`rounded-2xl h-14 border-none font-bold shadow-inner ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/50'}`} 
            />
          </div>

          {/* NOTAS (Nuevo - Ideal para el desbordamiento de la IA) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-3 opacity-50 flex items-center gap-2">
              <AlignLeft size={12} /> Notas adicionales
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full p-4 rounded-2xl border-none font-medium text-sm shadow-inner min-h-[80px] outline-none ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/50'}`}
              placeholder="Detalles que no queremos olvidar..."
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-16 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all mt-4 ${isPrivate ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-900/20' : 'bg-[#0EA5E9] hover:bg-slate-900 text-white shadow-blue-200/50'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : initialData ? "Confirmar Escaneo" : "Sincronizar Equipo"}
          </Button>
        </div>
      </div>
    </div>
  );
};
