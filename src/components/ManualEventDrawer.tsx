import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Shield, EyeOff, BookOpen, Trophy, HeartPulse, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Switch } from "@/components/ui/switch";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from '@/store/useNestStore';

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
  const { nestId, profile } = useNestStore();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('tribu');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        setDescription(initialData.description || '');
        setCategory(initialData.category || 'tribu');
        setSubjectId(initialData.assigned_to || '');
        setIsPrivate(initialData.is_private || false);
      } else {
        setTitle('');
        setDescription('');
        setSubjectId('');
        setIsPrivate(false);
        setCategory('tribu');
        setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      }
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    const currentNestId = nestId || profile?.nest_id;

    if (!currentNestId || !profile) {
      triggerHaptic('warning');
      toast({ title: "Error de Nido", description: "No se encontró un Nido vinculado.", variant: "destructive" });
      return;
    }

    if (!title.trim() || !date || !time) {
      triggerHaptic('medium');
      toast({ title: "Datos incompletos", description: "Rellena título, fecha y hora.", variant: "destructive" });
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      const startDateTime = new Date(`${date}T${time}:00`).toISOString();

      const { error } = await supabase.from('events').insert([{ 
        title: title.trim(),
        description: description.trim(),
        start_time: startDateTime,
        category,
        assigned_to: subjectId || null, 
        nest_id: currentNestId,
        is_private: isPrivate,
        created_by: profile.id
      }]);

      if (error) throw error;

      triggerHaptic('success');
      toast({ title: "Sincronía completada", description: "Evento guardado en el Nido." });
      onEventAdded(); 
      onClose(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[92vh] overflow-y-auto no-scrollbar transition-all duration-700 ${isPrivate ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <div className={`w-12 h-1.5 rounded-full mx-auto mb-8 ${isPrivate ? 'bg-white/20' : 'bg-slate-300/50'}`} />
        <button onClick={onClose} className={`absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center active:scale-90 z-20 ${isPrivate ? 'bg-white/10 text-white' : 'bg-slate-200/50 text-slate-600'}`}>
          <X size={20} />
        </button>

        <div className="space-y-6 pb-10">
          <header className="mb-2 text-center">
             <h2 className="text-3xl font-black tracking-tighter italic">Nuevo Evento</h2>
             <p className={`text-xs font-bold uppercase tracking-widest ${isPrivate ? 'text-orange-400' : 'text-sky-500'}`}>
               {isPrivate ? 'Modo Invisible' : 'Sincronía Familiar'}
             </p>
          </header>

          <div className="grid grid-cols-4 gap-3">
            {EVENT_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => { triggerHaptic('soft'); setCategory(cat.id); }} 
                className={`flex flex-col items-center gap-2 py-4 rounded-[2rem] border-2 transition-all ${category === cat.id ? `${cat.border} ${cat.bg} scale-105` : 'border-transparent bg-white/40 grayscale opacity-50'}`}>
                <cat.icon size={20} className={cat.color} />
              </button>
            ))}
          </div>

          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="¿Qué vamos a hacer?" className={`rounded-[2rem] h-16 border-none font-bold text-lg px-8 ${isPrivate ? 'bg-white/10 text-white placeholder:text-white/30' : 'bg-white text-slate-900'}`} />

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase opacity-40 ml-4">¿Para quién?</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSubjectId('')} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${!subjectId ? 'bg-slate-800 text-white' : 'bg-white/50 text-slate-400'}`}>Toda la Tribu</button>
              {members.map(m => (
                <button key={m.id} onClick={() => setSubjectId(m.id)} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${subjectId === m.id ? 'bg-sky-500 text-white' : 'bg-white/50 text-slate-400'}`}>{m.display_name}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`h-14 px-5 rounded-[1.5rem] border-none font-bold text-sm ${isPrivate ? 'bg-white/10 text-white' : 'bg-white text-slate-900'}`} />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`h-14 px-5 rounded-[1.5rem] border-none font-bold text-sm ${isPrivate ? 'bg-white/10 text-white' : 'bg-white text-slate-900'}`} />
          </div>

          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notas adicionales..." className={`rounded-[2rem] min-h-[100px] border-none p-6 ${isPrivate ? 'bg-white/10 text-white' : 'bg-white text-slate-900'}`} />

          <div className={`flex items-center justify-between p-5 rounded-[2.5rem] border-2 transition-all ${isPrivate ? 'bg-slate-950 border-orange-500/30' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-3">
              {isPrivate ? <EyeOff size={18} className="text-orange-400" /> : <Shield size={18} className="text-slate-400" />}
              <span className={`text-[10px] font-black uppercase ${isPrivate ? 'text-orange-400' : 'text-slate-900'}`}>Evento Privado</span>
            </div>
            <Switch checked={isPrivate} onCheckedChange={(v) => { triggerHaptic('soft'); setIsPrivate(v); }} />
          </div>

          <Button onClick={handleSave} disabled={loading} className={`w-full h-20 rounded-[3rem] font-black text-lg tracking-[0.2em] transition-all ${isPrivate ? 'bg-orange-500' : 'bg-slate-900'}`}>
            {loading ? <Loader2 className="animate-spin" /> : "SINCRONIZAR"}
          </Button>
        </div>
      </div>
    </div>
  );
};
