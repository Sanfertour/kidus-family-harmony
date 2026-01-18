import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, Sparkles, Loader2, Users, UserCheck, 
  Shield, EyeOff, MapPin, Calendar, Clock, 
  Camera, Wand2, BookOpen, Trophy, HeartPulse 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    type === 'soft' ? navigator.vibrate(10) : navigator.vibrate([20, 30, 20]);
  }
};

// Categorías con Colores Vivos KidUs
const EVENT_CATEGORIES = [
  { id: 'escolar', label: 'Cole', icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
  { id: 'deporte', label: 'Deporte', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'salud', label: 'Salud', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'tribu', label: 'Tribu', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
];

export const ManualEventDrawer = ({ 
  isOpen, onClose, onEventAdded, members, initialData 
}: { 
  isOpen: boolean; onClose: () => void; onEventAdded: () => void;
  members: any[]; initialData?: any;
}) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('tribu');
  const [subjectId, setSubjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    triggerHaptic('soft');

    // Aquí llamaríamos a la Edge Function 'nest-vision' que configuramos
    // Simulamos una respuesta de la IA para la demo
    setTimeout(() => {
      setIsScanning(false);
      triggerHaptic('success');
      toast({ title: "IA: Circular Leída", description: "He detectado una actividad de Deporte para mañana." });
      setEventType('deporte'); // Ejemplo de auto-detección
    }, 2000);
  };

  const handleSave = async () => {
    if (!title || !date || !time) {
      triggerHaptic('soft');
      toast({ title: "Faltan piezas", description: "Título, fecha y hora son obligatorios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('events').insert([{ 
      title,
      description: title, 
      event_date: new Date(`${date}T${time}:00`).toISOString(),
      event_type: eventType,
      assigned_to: subjectId || null, 
      nest_id: currentNestId,
      is_private: isPrivate,
      location: location,
      created_by: assignedTo || null 
    }]);

    if (!error) {
      triggerHaptic('success');
      onClose();
      onEventAdded();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className={`relative w-full max-w-md rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[92vh] overflow-y-auto ${isPrivate ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* LECTOR IA (OCR) */}
        <div className="relative mb-8 group">
          <input type="file" accept="image/*" capture="environment" onChange={handleScanImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="w-full h-28 rounded-[2.5rem] border-2 border-dashed border-sky-200 bg-white/50 flex items-center justify-center gap-4 group-active:scale-95 transition-transform">
            {isScanning ? (
              <Loader2 className="animate-spin text-sky-500" size={32} />
            ) : (
              <>
                <div className="p-4 bg-sky-500 text-white rounded-3xl shadow-lg shadow-sky-200"><Camera size={24} /></div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-tighter text-sky-600">Escaneo de la Tribu</p>
                  <p className="text-[10px] font-bold opacity-60">Sube una foto y la IA hará el resto</p>
                </div>
                <Wand2 className="text-orange-400 animate-pulse" size={20} />
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* CATEGORÍAS */}
          <div className="grid grid-cols-4 gap-2">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { triggerHaptic('soft'); setEventType(cat.id); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-[2rem] border-2 transition-all ${eventType === cat.id ? `${cat.border} ${cat.bg} scale-105 shadow-sm` : 'border-transparent bg-white opacity-40'}`}
              >
                <cat.icon size={20} className={cat.color} />
                <span className={`text-[8px] font-black uppercase ${cat.color}`}>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* TÍTULO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-sky-500">¿Qué actividad es?</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`rounded-[2rem] h-16 border-2 font-black text-lg px-8 focus:ring-0 ${isPrivate ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} 
            />
          </div>

          {/* PROTAGONISTAS (PEQUES/TRIBU) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 flex items-center gap-2 opacity-50"><Users size={12} /> Protagonista</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSubjectId('')} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!subjectId ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}>Toda la tribu</button>
              {members.map(m => (
                <button key={m.id} onClick={() => setSubjectId(m.id)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${subjectId === m.id ? 'bg-sky-500 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* GUÍA RESPONSABLE (SOLO ADULTOS) */}
          {!isPrivate && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 flex items-center gap-2 opacity-50"><UserCheck size={12} /> Guía Responsable</label>
              <div className="flex flex-wrap gap-2">
                {members.filter(m => m.role === 'guía').map(m => (
                  <button key={m.id} onClick={() => setAssignedTo(m.id)} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${assignedTo === m.id ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                    {m.display_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FECHA Y HORA */}
          <div className="grid grid-cols-2 gap-4">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-[1.5rem] h-14 border-2 font-black text-center" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-[1.5rem] h-14 border-2 font-black text-center" />
          </div>

          {/* PRIVACIDAD */}
          <div className={`flex items-center justify-between p-5 rounded-[2.5rem] border-2 transition-all ${isPrivate ? 'bg-slate-900 border-orange-500/30' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPrivate ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{isPrivate ? <EyeOff size={18} /> : <Shield size={18} />}</div>
              <span className="text-[11px] font-black uppercase">Solo para mí</span>
            </div>
            <Switch checked={isPrivate} onCheckedChange={(v) => { triggerHaptic('soft'); setIsPrivate(v); }} />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-[2.5rem] font-black text-lg tracking-[0.2em] shadow-xl active:scale-95 transition-all ${isPrivate ? 'bg-orange-500' : 'bg-slate-800'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "SUBIR AL NIDO"}
          </Button>
        </div>
      </div>
    </div>
  );
};
