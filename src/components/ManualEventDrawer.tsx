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
import { useNestStore } from '@/store/useNestStore'; // Importación vital

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
  // --- CAPA DE DATOS (Store Global) ---
  const { nestId, profile } = useNestStore();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('tribu');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  // Reset y Pre-carga de datos
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        setDescription(initialData.description || '');
        setCategory(initialData.category || 'tribu');
        setSubjectId(initialData.assigned_to || '');
      } else {
        // Valores por defecto para nuevo evento
        setTitle('');
        setDescription('');
        setSubjectId('');
        setIsPrivate(false);
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    // 1. Validación de Verdad Única
    if (!nestId || !profile) {
      triggerHaptic('warning');
      toast({ title: "Error de Nido", description: "No se detecta sincronía. Reinicia la app.", variant: "destructive" });
      return;
    }

    if (!title || !date || !time) {
      triggerHaptic('medium');
      toast({ title: "Campos vacíos", description: "Título, fecha y hora son obligatorios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      // 2. Construcción de Timestamp para Supabase (timestamptz)
      const startDateTime = new Date(`${date}T${time}:00`).toISOString();

      // 3. Inserción Blindada
      const { error } = await supabase.from('events').insert([{ 
        title: title.trim(),
        description: description.trim(),
        start_time: startDateTime,
        category: category,
        assigned_to: subjectId || null, 
        nest_id: nestId,
        is_private: isPrivate,
        created_by: profile.id // Para lógica de Modo Privado
      }]);

      if (error) throw error;

      // 4. Feedback Élite
      triggerHaptic('success');
      toast({ title: "Sincronía completada", description: "Evento añadido al calendario familiar." });
      
      onEventAdded(); // Recarga la agenda
      onClose(); // Cierra el Drawer

    } catch (error: any) {
      console.error("🚨 Error al guardar evento:", error);
      toast({ 
        title: "Error de guardado", 
        description: "Revisa los permisos del Nido o tu conexión.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className={`relative w-full max-w-md rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[95vh] overflow-y-auto no-scrollbar transition-colors duration-500 ${isPrivate ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-800 border-t border-white'}`}>
        
        {/* Manejador visual para mobile */}
        <div className="w-12 h-1.5 bg-slate-300/50 rounded-full mx-auto mb-8" />

        <button 
          onClick={() => { triggerHaptic('soft'); onClose(); }}
          className={`absolute top-8 right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 z-20 ${isPrivate ? 'bg-white/10 text-white' : 'bg-slate-200/50 text-slate-600'}`}
        >
          <X size={24} strokeWidth={3} />
        </button>

        <div className="space-y-6 pb-12">
          <header>
             <h2 className="text-2xl font-black tracking-tighter">Nuevo Evento</h2>
             <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${isPrivate ? 'text-orange-400' : 'text-sky-600'}`}>
               {isPrivate ? 'Cifrado en modo privado' : 'Sincronizado con el nido'}
             </p>
          </header>

          {/* Selector de Categoría Mobile-First */}
          <div className="flex justify-between gap-2">
            {EVENT_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => { triggerHaptic('soft'); setCategory(cat.id); }} 
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-[2rem] border-2 transition-all active:scale-95 ${category === cat.id ? `${cat.border} ${cat.bg} scale-105 shadow-md` : 'border-transparent bg-white/50 opacity-40'}`}>
                <cat.icon size={22} className={cat.color} />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 text-sky-500">¿Qué pasará?</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Ej: Revisión dentista" 
              className="rounded-[2rem] h-16 border-none font-black text-lg px-8 focus:ring-4 focus:ring-sky-500/10 bg-white text-slate-800 shadow-sm" 
            />
          </div>

          {/* Protagonista (Avatar Selection) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 opacity-50 flex items-center gap-2">
              <Users size={12} /> Miembro implicado
            </label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => { triggerHaptic('soft'); setSubjectId(''); }} 
                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!subjectId ? 'bg-slate-800 text-white shadow-lg' : 'bg-white/50 text-slate-400 border border-slate-100'}`}
              >
                Toda la tribu
              </button>
              {members.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => { triggerHaptic('soft'); setSubjectId(m.id); }} 
                  className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${subjectId === m.id ? 'bg-sky-500 text-white shadow-lg' : 'bg-white/50 text-slate-400 border border-slate-100'}`}
                >
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500" size={16} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-none font-bold text-sm bg-white text-slate-900 shadow-sm focus:ring-4 focus:ring-sky-500/10" />
            </div>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={16} />
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full h-14 pl-12 pr-4 rounded-[1.5rem] border-none font-bold text-sm bg-white text-slate-900 shadow-sm focus:ring-4 focus:ring-sky-500/10" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-4 flex items-center gap-2 text-orange-500">
              <ListChecks size={14} /> Notas adicionales
            </label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Añade detalles relevantes..." 
              className="rounded-[2.5rem] min-h-[100px] border-none font-medium p-6 bg-white text-slate-800 shadow-sm focus:ring-4 focus:ring-sky-500/10" 
            />
          </div>

          {/* Toggle Modo Privado */}
          <div className={`flex items-center justify-between p-5 rounded-[2.5rem] border-2 transition-all duration-500 ${isPrivate ? 'bg-slate-900 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl transition-colors ${isPrivate ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {isPrivate ? <EyeOff size={18} /> : <Shield size={18} />}
              </div>
              <div>
                <span className="text-[11px] font-black uppercase block">Modo Privado</span>
                <span className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">Solo tú verás el contenido</span>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={(v) => { triggerHaptic('soft'); setIsPrivate(v); }} />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-[3rem] font-black text-lg tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4 ${isPrivate ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-900 text-white hover:bg-black'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "SINCRONIZAR"}
          </Button>
        </div>
      </div>
    </div>
  );
};
