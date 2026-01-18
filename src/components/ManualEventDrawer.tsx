import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, Calendar, Clock, User, CheckCircle2, Shield, EyeOff, 
  MapPin, AlignLeft, Sparkles, Loader2, Users 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";

// Función de vibración para feedback táctil
const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else navigator.vibrate([20, 30, 20]);
  }
};

export const ManualEventDrawer = ({ 
  isOpen, onClose, onEventAdded, members, initialData 
}: { 
  isOpen: boolean; onClose: () => void; onEventAdded: () => void;
  members: any[]; initialData?: any;
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

  useEffect(() => {
    const prepareDrawer = async () => {
      if (initialData) {
        setTitle(initialData.description || '');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        if (initialData.location) setLocation(initialData.location);
        if (initialData.notes) setNotes(initialData.notes);
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
      toast({ title: "Faltan piezas", description: "El título, la fecha y la hora son vitales para la tribu.", variant: "destructive" });
      return;
    }

    setLoading(true);
    triggerHaptic('success');
    const fullEventDate = new Date(`${date}T${time}:00`).toISOString();

    const { error } = await supabase.from('events').insert([{ 
      description: title,
      event_date: fullEventDate,
      assigned_to: subjectId || null,
      nest_id: currentNestId,
      status: 'pending',
      is_private: isPrivate,
    }]);

    if (error) {
      toast({ title: "Error de sincronía", variant: "destructive" });
    } else {
      toast({ 
        title: isPrivate ? "Privacidad activada" : "¡Tribu sincronizada!", 
        description: "El Nido ha recibido la actualización." 
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
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className={`relative w-full max-w-md transition-all duration-500 rounded-t-[3.5rem] p-10 shadow-tribu-card animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto border-t border-white/20 ${isPrivate ? 'bg-slate-900 text-white' : 'bg-white/95 text-slate-800 backdrop-blur-2xl'}`}>
        
        <div className={`w-16 h-1.5 rounded-full mx-auto mb-8 ${isPrivate ? 'bg-slate-800' : 'bg-slate-100'}`} />
        
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {initialData && <Sparkles size={20} className="text-primary animate-pulse" />}
              <h2 className="text-3xl font-black tracking-tight">
                {initialData ? 'Validar Sincro' : isPrivate ? 'Solo para ti' : 'Nueva Actividad'}
              </h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Gestión de la Tribu</p>
          </div>
          <button onClick={() => { triggerHaptic('soft'); onClose(); }} className="p-2 active:scale-90 transition-all">
            <X size={28} className="opacity-20" />
          </button>
        </div>
        
        <div className="space-y-8">
          {/* MODO PRIVADO */}
          <div className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${isPrivate ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-white/40 shadow-inner'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPrivate ? 'bg-secondary text-white' : 'bg-white text-slate-400 shadow-brisa'}`}>
                {isPrivate ? <EyeOff size={22} /> : <Shield size={22} />}
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-black uppercase tracking-wider">Privacidad</p>
                <p className="text-[9px] font-bold opacity-50">Activa el modo invisible</p>
              </div>
            </div>
            <Switch 
              checked={isPrivate} 
              onCheckedChange={(val) => { triggerHaptic('soft'); setIsPrivate(val); }} 
              className="data-[state=checked]:bg-secondary" 
            />
          </div>

          {/* TÍTULO */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40">¿Qué actividad es?</label>
            <Input 
              placeholder="Ej: Natación, Dentista, Entreno..."
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`rounded-3xl h-16 border-none font-black text-lg shadow-inner px-8 ${isPrivate ? 'bg-slate-800 text-white placeholder:text-slate-600' : 'bg-slate-100/60 text-slate-800 placeholder:text-slate-300'}`} 
            />
          </div>

          {/* ASIGNACIÓN A LA TRIBU */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40 flex items-center gap-2">
              <Users size={12} /> ¿Para quién es?
            </label>
            <div className="relative">
              <select 
                className={`w-full h-16 rounded-3xl border-none px-8 text-sm font-black outline-none appearance-none shadow-inner ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/60 text-slate-700'}`} 
                value={subjectId} 
                onChange={(e) => { triggerHaptic('soft'); setSubjectId(e.target.value); }}
              >
                <option value="">Toda la tribu</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
              </select>
            </div>
          </div>

          {/* FECHA Y HORA */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40 flex items-center gap-2">
                <Calendar size={12} /> Fecha
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`rounded-3xl h-16 border-none font-black shadow-inner ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/60'}`} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40 flex items-center gap-2">
                <Clock size={12} /> Hora
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`rounded-3xl h-16 border-none font-black shadow-inner ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/60'}`} />
            </div>
          </div>

          {/* UBICACIÓN */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest ml-4 opacity-40 flex items-center gap-2">
              <MapPin size={12} /> Lugar
            </label>
            <Input 
              placeholder="¿Dónde quedamos?" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className={`rounded-3xl h-16 border-none font-black shadow-inner px-8 ${isPrivate ? 'bg-slate-800 text-white' : 'bg-slate-100/60'}`} 
            />
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-5xl font-black text-lg tracking-[0.2em] shadow-haptic active:scale-95 transition-all mt-6 ${isPrivate ? 'bg-secondary hover:bg-orange-600 text-white' : 'bg-primary hover:bg-slate-900 text-white'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : initialData ? "CONFIRMAR SINCRO" : "SUBIR AL NIDO"}
          </Button>
        </div>
      </div>
    </div>
  );
};
