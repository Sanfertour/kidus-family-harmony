import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, Sparkles, Loader2, Users, UserCheck, 
  Shield, EyeOff, MapPin, Calendar, Clock, BookOpen, Trophy, HeartPulse
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    type === 'soft' ? navigator.vibrate(10) : navigator.vibrate([20, 30, 20]);
  }
};

// Categorías KidUs para la Sincronía
const EVENT_CATEGORIES = [
  { id: 'escolar', label: 'Cole / Menú', icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'deporte', label: 'Deporte / Extra', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'salud', label: 'Salud / Citas', icon: HeartPulse, color: 'text-slate-800', bg: 'bg-slate-100' },
  { id: 'tribu', label: 'General / Tribu', icon: Sparkles, color: 'text-slate-400', bg: 'bg-slate-50' },
];

export const ManualEventDrawer = ({ 
  isOpen, onClose, onEventAdded, members, initialData 
}: { 
  isOpen: boolean; onClose: () => void; onEventAdded: () => void;
  members: any[]; initialData?: any;
}) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('tribu'); // Categoría por defecto
  const [subjectId, setSubjectId] = useState(''); 
  const [assignedTo, setAssignedTo] = useState(''); 
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentNestId, setCurrentNestId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const prepareDrawer = async () => {
      if (initialData) {
        setTitle(initialData.description || initialData.title || '');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        if (initialData.location) setLocation(initialData.location);
        if (initialData.event_type) setEventType(initialData.event_type);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('nest_id').eq('id', user.id).maybeSingle();
        if (profile) setCurrentNestId(profile.nest_id);
      }
    };
    if (isOpen) prepareDrawer();
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!title || !date || !time) {
      triggerHaptic('soft');
      toast({ title: "Faltan piezas", description: "El título, la fecha y la hora son vitales.", variant: "destructive" });
      return;
    }

    if (!currentNestId) {
      toast({ title: "Error de Nido", description: "No se encontró tu identificador de tribu.", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from('events').insert([{ 
      title: title,
      description: title, 
      event_date: new Date(`${date}T${time}:00`).toISOString(),
      event_type: eventType, // ¡Aquí se guarda el color!
      assigned_to: subjectId || null, 
      nest_id: currentNestId,
      status: 'pending',
      is_private: isPrivate,
      location: location,
      created_by: assignedTo || null,
      reminder_sent: false // El robot lo pondrá a true cuando avise
    }]);

    if (error) {
      toast({ title: "Error de sincronía", description: "La base de datos rechazó el pulso.", variant: "destructive" });
    } else {
      triggerHaptic('success');
      toast({ title: isPrivate ? "Privacidad activada" : "¡Tribu sincronizada!" });
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-sans">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md rounded-t-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom max-h-[95vh] overflow-y-auto border-t transition-colors duration-500 ${isPrivate ? 'bg-slate-950 text-white border-white/10' : 'bg-slate-50 text-slate-800 border-white'}`}>
        
        <div className="w-16 h-1.5 rounded-full mx-auto mb-8 bg-slate-200/20" />
        
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter">Nueva Misión</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0EA5E9]">Agenda de la Tribu</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl"><X size={24} /></button>
        </div>

        <div className="space-y-8">
          {/* CATEGORÍA (NUEVO) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50 text-sky-500">Categoría</label>
            <div className="grid grid-cols-2 gap-3">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { triggerHaptic('soft'); setEventType(cat.id); }}
                  className={`flex items-center gap-3 p-4 rounded-3xl border-2 transition-all ${eventType === cat.id ? 'border-sky-500 bg-white shadow-lg scale-105' : 'border-transparent bg-white/50 opacity-60'}`}
                >
                  <div className={`p-2 rounded-xl ${cat.bg} ${cat.color}`}><cat.icon size={18} /></div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TÍTULO */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50 text-sky-500">¿Qué vamos a hacer?</label>
            <Input 
              placeholder="Ej: Natación de los peques..."
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`rounded-[2rem] h-16 border-2 font-black text-lg px-8 ${isPrivate ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'}`} 
            />
          </div>

          {/* PRIVACIDAD */}
          <div className={`flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all ${isPrivate ? 'bg-slate-900 border-[#F97316]/40' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPrivate ? 'bg-[#F97316] text-white' : 'bg-slate-100 text-slate-400'}`}>
                {isPrivate ? <EyeOff size={22} /> : <Shield size={22} />}
              </div>
              <p className="text-[11px] font-black uppercase tracking-wider">Modo Privado</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={(val) => { triggerHaptic('soft'); setIsPrivate(val); }} />
          </div>

          {/* PROTAGONISTA */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50 flex items-center gap-2">
              <Users size={12} /> ¿Para quién es?
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <button 
                  key={m.id}
                  onClick={() => { triggerHaptic('soft'); setSubjectId(m.id); }}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${subjectId === m.id ? 'bg-[#0EA5E9] text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400'}`}
                >
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* FECHA Y HORA */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-[1.5rem] h-14 border-2 font-black" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50">Hora</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-[1.5rem] h-14 border-2 font-black" />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-[2.5rem] font-black text-lg tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4 ${isPrivate ? 'bg-[#F97316]' : 'bg-slate-800'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "SUBIR AL NIDO"}
          </Button>
        </div>
      </div>
    </div>
  );
};
