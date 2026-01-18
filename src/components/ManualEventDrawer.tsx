import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, Users, UserCheck, Shield, EyeOff, 
  Calendar, Clock, BookOpen, Trophy, HeartPulse, ListChecks, Sparkles, Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    type === 'soft' ? navigator.vibrate(10) : navigator.vibrate([20, 30, 20]);
  }
};

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
  const [preparation, setPreparation] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentNestId, setCurrentNestId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const prepareDrawer = async () => {
      if (initialData) {
        setTitle(initialData.title || '');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        setPreparation(initialData.description || '');
        if (initialData.event_type) setEventType(initialData.event_type);
        if (initialData.assigned_to) setSubjectId(initialData.assigned_to);
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
      toast({ title: "Faltan piezas", description: "Título, fecha y hora son vitales.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('events').insert([{ 
      title,
      description: preparation,
      event_date: new Date(`${date}T${time}:00`).toISOString(),
      event_type: eventType,
      assigned_to: subjectId || null, 
      nest_id: currentNestId,
      is_private: isPrivate,
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-md rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[92vh] overflow-y-auto no-scrollbar ${isPrivate ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800 border-t border-white'}`}>
        
        {/* BOTÓN DE CIERRE TÁCTIL (KidUs Style) */}
        <button 
          onClick={() => { triggerHaptic('soft'); onClose(); }}
          className={`absolute top-6 right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 z-20 ${isPrivate ? 'bg-white/10 text-white' : 'bg-slate-200/50 text-slate-600'}`}
        >
          <X size={24} strokeWidth={3} />
        </button>

        <div className="w-12 h-1.5 bg-slate-300/50 rounded-full mx-auto mb-8" />

        <div className="space-y-6 pb-12">
          {/* CATEGORÍAS */}
          <div className="flex justify-between gap-2 pr-12"> {/* pr-12 para que no choque con la X */}
             <h2 className="text-xl font-black tracking-tight">Nuevo en el Nido</h2>
          </div>

          <div className="flex justify-between gap-2">
            {EVENT_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => { triggerHaptic('soft'); setEventType(cat.id); }} 
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-[2rem] border-2 transition-all ${eventType === cat.id ? `${cat.border} ${cat.bg} scale-105 shadow-md` : 'border-transparent bg-white opacity-40'}`}>
                <cat.icon size={22} className={cat.color} />
              </button>
            ))}
          </div>

          {/* TÍTULO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-sky-500 font-nunito">Actividad</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="¿Qué vamos a hacer?" className="rounded-[2rem] h-16 border-2 font-black text-lg px-8 focus:ring-0 bg-white border-slate-200 text-slate-800" />
          </div>

          {/* PROTAGONISTAS */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 flex items-center gap-2 opacity-50"><Users size={12} /> Protagonista</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { triggerHaptic('soft'); setSubjectId(''); }} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!subjectId ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>Toda la tribu</button>
              {members.map(m => (
                <button key={m.id} onClick={() => { triggerHaptic('soft'); setSubjectId(m.id); }} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${subjectId === m.id ? 'bg-sky-500 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* GUÍA RESPONSABLE */}
          {!isPrivate && (
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 flex items-center gap-2 opacity-50"><UserCheck size={12} /> Guía Responsable</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { triggerHaptic('soft'); setAssignedTo(''); }} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!assignedTo ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>Cualquier Guía</button>
                {members.filter(m => m.role === 'guía' || m.role === 'autonomous').map(m => (
                  <button key={m.id} onClick={() => { triggerHaptic('soft'); setAssignedTo(m.id); }} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${assignedTo === m.id ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    {m.display_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FECHA Y HORA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" size={16} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-slate-400 font-black text-sm focus:outline-none bg-white text-slate-900" />
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={16} />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-2 border-slate-400 font-black text-sm focus:outline-none bg-white text-slate-900" />
            </div>
          </div>

          {/* PREPARACIÓN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 flex items-center gap-2 text-orange-500"><ListChecks size={14} /> Preparación y Notas</label>
            <Textarea value={preparation} onChange={(e) => setPreparation(e.target.value)} placeholder="Ej: No olvidar las botas, llevar agua..." className="rounded-[2.5rem] min-h-[100px] border-2 border-slate-200 font-bold p-6 focus:ring-0 bg-white text-slate-800" />
          </div>

          {/* PRIVACIDAD */}
          <div className={`flex items-center justify-between p-5 rounded-[2.5rem] border-2 transition-all ${isPrivate ? 'bg-slate-900 border-orange-500/30' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPrivate ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{isPrivate ? <EyeOff size={18} /> : <Shield size={18} />}</div>
              <span className="text-[11px] font-black uppercase">Solo para mí</span>
            </div>
            <Switch checked={isPrivate} onCheckedChange={(v) => { triggerHaptic('soft'); setIsPrivate(v); }} />
          </div>

          <Button onClick={handleSave} disabled={loading} className={`w-full h-20 rounded-[3rem] font-black text-lg tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4 ${isPrivate ? 'bg-orange-500' : 'bg-slate-800 text-white'}`}>
            {loading ? <Loader2 className="animate-spin" /> : "SINCRONIZAR NIDO"}
          </Button>
        </div>
      </div>
    </div>
  );
};
