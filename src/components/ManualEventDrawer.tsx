import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, Users, Shield, EyeOff, 
  Calendar, Clock, BookOpen, Trophy, HeartPulse, ListChecks, Sparkles, Loader2 
} from 'lucide-react';
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
    if (!nestId || !profile) {
      triggerHaptic('warning');
      toast({ title: "Sin Nido", description: "Vuelve a entrar en la app.", variant: "destructive" });
      return;
    }

    if (!title.trim() || !date || !time) {
      triggerHaptic('medium');
      toast({ title: "Datos incompletos", description: "¿Qué? ¿Cuándo? ¿A qué hora?", variant: "destructive" });
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      // Combinamos fecha y hora para el formato TIMESTAMPTZ de Postgres
      const startDateTime = new Date(`${date}T${time}:00`).toISOString();

      const { error } = await supabase.from('events').insert([{ 
        title: title.trim(),
        description: description.trim(),
        start_time: startDateTime,
        category,
        assigned_to: subjectId || null, 
        nest_id: nestId,
        is_private: isPrivate,
        created_by: profile.id
      }]);

      if (error) throw error;

      triggerHaptic('success');
      toast({ title: "Sincronía completada", description: "El Nido ha sido actualizado." });
      
      onEventAdded(); 
      onClose(); 

    } catch (error: any) {
      toast({ title: "Error en el Nido", description: error.message, variant: "destructive" });
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

        <button 
          onClick={onClose}
          className={`absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 z-20 ${isPrivate ? 'bg-white/10 text-white' : 'bg-slate-200/50 text-slate-600'}`}
        >
          <X size={20} />
        </button>

        <div className="space-y-6 pb-10">
          <header className="mb-2">
             <h2 className="text-3xl font-black tracking-tighter italic">Evento</h2>
             <p className={`text-brisa ${isPrivate ? 'text-orange-400' : 'text-sky-500'}`}>
               {isPrivate ? 'Modo Invisible Activo' : 'Sincronía Familiar'}
             </p>
          </header>

          {/* Selector de Categoría */}
          <div className="grid grid-cols-4 gap-3">
            {EVENT_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => { triggerHaptic('soft'); setCategory(cat.id); }} 
                className={`flex flex-col items-center gap-2 py-4 rounded-[2rem] border-2 transition-all ${category === cat.id ? `${cat.border} ${cat.bg} scale-105 shadow-sm` : 'border-transparent bg-white/40 grayscale opacity-50'}`}>
                <cat.icon size={20} className={cat.color} />
              </button>
            ))}
          </div>

          {/* Campo Principal */}
          <div className="space-y-2">
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="¿Qué vamos a hacer?" 
              className={`rounded-[2rem] h-16 border-none font-bold text-lg px-8 shadow-sm ${isPrivate ? 'bg-white/10 text-white placeholder:text-white/30' : 'bg-white text-slate-900'}`} 
            />
          </div>

          {/* Miembros de la Tribu */}
          <div className="space-y-3">
            <label className="text-brisa opacity-50 ml-4">¿Quién?</label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSubjectId('')} 
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!subjectId ? 'bg-slate-800 text-white shadow-lg' : 'bg-white/50 text-slate-400 border border-slate-100'}`}
              >
                Toda la Tribu
              </button>
              {members.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSubjectId(m.id)} 
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${subjectId === m.id ? 'bg-sky-500 text-white shadow-lg' : 'bg-white/50 text-slate-400 border border-slate-100'}`}
                >
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-brisa opacity-50 ml-4 italic text-[8px]">Día</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`h-14 px-5 rounded-[1.5rem] border-none font-bold text-sm shadow-sm ${isPrivate ? 'bg-white/10 text-white' : 'bg-white text-slate-900'}`} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-brisa opacity-50 ml-4 italic text-[8px]">Hora</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`h-14 px-5 rounded-[1.5rem] border-none font-bold text-sm shadow-sm ${isPrivate ? 'bg-white/10 text-white' : 'bg-white text-slate-900'}`} />
            </div>
          </div>

          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Notas del Nido..." 
            className={`rounded-[2.5rem] min-h-[100px] border-none font-medium p-6 shadow-sm ${isPrivate ? 'bg-white/10 text-white placeholder:text-white/30' : 'bg-white text-slate-900'}`} 
          />

          {/* Toggle Privado - Look Elite */}
          <div className={`flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all duration-700 ${isPrivate ? 'bg-slate-950 border-orange-500/30' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPrivate ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {isPrivate ? <EyeOff size={18} /> : <Shield size={18} />}
              </div>
              <div>
                <span className={`text-[11px] font-black uppercase block ${isPrivate ? 'text-orange-400' : 'text-slate-900'}`}>Modo Privado</span>
                <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Oculto para el resto</span>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={(v) => { triggerHaptic('soft'); setIsPrivate(v); }} />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-[3rem] font-black text-lg tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4 ${isPrivate ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-slate-900 text-white'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "SINCRONIZAR"}
          </Button>
        </div>
      </div>
    </div>
  );
};
