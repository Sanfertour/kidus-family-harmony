import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, Sparkles, Loader2, Users, UserCheck, 
  Shield, EyeOff, MapPin, Calendar, Clock 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    type === 'soft' ? navigator.vibrate(10) : navigator.vibrate([20, 30, 20]);
  }
};

export const ManualEventDrawer = ({ 
  isOpen, onClose, onEventAdded, members, initialData 
}: { 
  isOpen: boolean; onClose: () => void; onEventAdded: () => void;
  members: any[]; initialData?: any;
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(''); // Protagonista (Peques/Tribu)
  const [assignedTo, setAssignedTo] = useState(''); // Guía Responsable
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
      }

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
      triggerHaptic('soft');
      toast({ 
        title: "Faltan piezas", 
        description: "El título, la fecha y la hora son vitales.", 
        variant: "destructive" 
      });
      return;
    }

    if (!currentNestId) {
      toast({ title: "Error de Nido", description: "No se encontró tu identificador de tribu.", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    // Sincronía con la DB: Enviamos title y description para evitar el 400
    const { error } = await supabase.from('events').insert([{ 
      title: title,
      description: title, 
      event_date: new Date(`${date}T${time}:00`).toISOString(),
      assigned_to: subjectId || null, 
      nest_id: currentNestId,
      status: 'pending',
      is_private: isPrivate,
      location: location,
      created_by: assignedTo || null 
    }]);

    if (error) {
      console.error("Error en el Nido:", error);
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
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className={`relative w-full max-w-md transition-all duration-500 rounded-t-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom max-h-[95vh] overflow-y-auto border-t ${isPrivate ? 'bg-slate-950 text-white border-white/10' : 'bg-slate-50 text-slate-800 border-white'}`}>
        
        <div className={`w-16 h-1.5 rounded-full mx-auto mb-8 ${isPrivate ? 'bg-slate-800' : 'bg-slate-200'}`} />
        
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {initialData && <Sparkles size={24} className="text-[#0EA5E9] animate-pulse" />}
              <h2 className="text-4xl font-black tracking-tighter">
                {initialData ? 'Validar' : isPrivate ? 'Privado' : 'Actividad'}
              </h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0EA5E9]">Gestión de la Tribu</p>
          </div>
          <button onClick={() => { triggerHaptic('soft'); onClose(); }} className="p-3 bg-white/10 rounded-2xl active:scale-90 transition-all">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* MODO PRIVADO */}
          <div className={`flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all ${isPrivate ? 'bg-slate-900 border-[#F97316]/40' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPrivate ? 'bg-[#F97316] text-white' : 'bg-slate-100 text-slate-400'}`}>
                {isPrivate ? <EyeOff size={22} /> : <Shield size={22} />}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider">Solo para mis ojos</p>
                <p className="text-[9px] font-bold opacity-50">Privado en el nido</p>
              </div>
            </div>
            <Switch 
              checked={isPrivate} 
              onCheckedChange={(val) => { triggerHaptic('soft'); setIsPrivate(val); }} 
              className="data-[state=checked]:bg-[#F97316]" 
            />
          </div>

          {/* TÍTULO */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50 text-sky-500">¿Qué vamos a hacer?</label>
            <Input 
              placeholder="Ej: Natación, Cumpleaños..."
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`rounded-[2rem] h-16 border-2 font-black text-lg px-8 transition-all ${isPrivate ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 focus:border-[#0EA5E9]'}`} 
            />
          </div>

          {/* PROTAGONISTA (IGUAL QUE ANTES) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 opacity-50">
              <Users size={12} /> Protagonista
            </label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => { triggerHaptic('soft'); setSubjectId(''); }}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!subjectId ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
              >
                Toda la tribu
              </button>
              {members.map(m => (
                <button 
                  key={m.id}
                  onClick={() => { triggerHaptic('soft'); setSubjectId(m.id); }}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${subjectId === m.id ? 'bg-[#0EA5E9] text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
                >
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* GUÍA RESPONSABLE (ESTÉTICA IGUAL A PROTAGONISTA) */}
          {!isPrivate && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 opacity-50">
                <UserCheck size={12} /> Guía Responsable
              </label>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => { triggerHaptic('soft'); setAssignedTo(''); }}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!assignedTo ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
                >
                  Cualquiera
                </button>
                {/* Filtrar solo por adultos/guías si es necesario */}
                {members.filter(m => m.role === 'guía' || m.role === 'autonomous').map(m => (
                  <button 
                    key={m.id}
                    onClick={() => { triggerHaptic('soft'); setAssignedTo(m.id); }}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${assignedTo === m.id ? 'bg-vital-orange bg-[#F97316] text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
                  >
                    {m.display_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FECHA Y HORA */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`rounded-[1.5rem] h-14 border-2 font-black ${isPrivate ? 'bg-slate-900 border-slate-800' : 'bg-white'}`} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-50">Hora</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`rounded-[1.5rem] h-14 border-2 font-black ${isPrivate ? 'bg-slate-900 border-slate-800' : 'bg-white'}`} />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-[2.5rem] font-black text-lg tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4 ${isPrivate ? 'bg-[#F97316] text-white' : 'bg-slate-800 text-white'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : initialData ? "CONFIRMAR SINCRO" : "SUBIR AL NIDO"}
          </Button>
        </div>
      </div>
    </div>
  );
};
