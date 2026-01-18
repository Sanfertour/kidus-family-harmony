import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, Calendar, Clock, CheckCircle2, Shield, EyeOff, 
  MapPin, Sparkles, Loader2, Users 
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
  const [subjectId, setSubjectId] = useState('');
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
        setTitle(initialData.description || '');
        setDate(initialData.date || '');
        setTime(initialData.time || '');
        if (initialData.location) setLocation(initialData.location);
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
    setLoading(true);
    triggerHaptic('success');
    
    const { error } = await supabase.from('events').insert([{ 
      description: title,
      event_date: new Date(`${date}T${time}:00`).toISOString(),
      assigned_to: subjectId || null,
      nest_id: currentNestId,
      status: 'pending',
      is_private: isPrivate,
    }]);

    if (error) {
      toast({ title: "Error de sincronía", variant: "destructive" });
    } else {
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
      
      <div className={`relative w-full max-w-md transition-all duration-500 rounded-t-[3.5rem] p-10 shadow-2xl animate-in slide-in-from-bottom max-h-[92vh] overflow-y-auto border-t ${isPrivate ? 'bg-slate-950 text-white border-white/10' : 'bg-white text-slate-800 border-slate-100'}`}>
        
        <div className={`w-16 h-1.5 rounded-full mx-auto mb-8 ${isPrivate ? 'bg-slate-800' : 'bg-slate-200'}`} />
        
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {initialData && <Sparkles size={20} className="text-[#0EA5E9] animate-pulse" />}
              <h2 className="text-3xl font-black tracking-tighter">
                {initialData ? 'Validar Sincro' : isPrivate ? 'Solo para ti' : 'Nueva Actividad'}
              </h2>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isPrivate ? 'text-slate-500' : 'text-slate-400'}`}>Gestión de la Tribu</p>
          </div>
          <button onClick={() => { triggerHaptic('soft'); onClose(); }} className="p-2 active:scale-90 transition-all opacity-40 hover:opacity-100">
            <X size={28} />
          </button>
        </div>
        
        <div className="space-y-8">
          {/* MODO PRIVADO REFORZADO */}
          <div className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${isPrivate ? 'bg-slate-900 border-[#F97316]/30' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isPrivate ? 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20' : 'bg-white text-slate-500 shadow-sm'}`}>
                {isPrivate ? <EyeOff size={22} /> : <Shield size={22} />}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider">Privacidad</p>
                <p className={`text-[9px] font-bold ${isPrivate ? 'text-slate-400' : 'text-slate-500'}`}>Solo tú verás esto</p>
              </div>
            </div>
            <Switch 
              checked={isPrivate} 
              onCheckedChange={(val) => { triggerHaptic('soft'); setIsPrivate(val); }} 
              className="data-[state=checked]:bg-[#F97316]" 
            />
          </div>

          {/* INPUTS CON MÁS CONTRASTE */}
          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-4 ${isPrivate ? 'text-slate-400' : 'text-slate-600'}`}>¿Qué actividad es?</label>
            <Input 
              placeholder="Ej: Natación, Dentista..."
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className={`rounded-3xl h-16 border-2 font-black text-lg px-8 transition-all ${isPrivate ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0EA5E9]'}`} 
            />
          </div>

          <div className="space-y-3">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 ${isPrivate ? 'text-slate-400' : 'text-slate-600'}`}>
              <Users size={12} /> ¿Para quién es?
            </label>
            <select 
              className={`w-full h-16 rounded-3xl border-2 px-8 text-sm font-black outline-none appearance-none transition-all ${isPrivate ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700 focus:border-[#0EA5E9]'}`} 
              value={subjectId} 
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Toda la tribu</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.display_name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 ${isPrivate ? 'text-slate-400' : 'text-slate-600'}`}><Calendar size={12} /> Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`rounded-3xl h-16 border-2 font-black ${isPrivate ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`} />
            </div>
            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 ${isPrivate ? 'text-slate-400' : 'text-slate-600'}`}><Clock size={12} /> Hora</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`rounded-3xl h-16 border-2 font-black ${isPrivate ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`} />
            </div>
          </div>

          {/* BOTÓN SUBIR AL NIDO */}
          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className={`w-full h-20 rounded-[2.5rem] font-black text-lg tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-6 ${isPrivate ? 'bg-[#F97316] hover:bg-orange-600 text-white' : 'bg-[#0EA5E9] hover:bg-slate-900 text-white'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : initialData ? "CONFIRMAR SINCRO" : "SUBIR AL NIDO"}
          </Button>
        </div>
      </div>
    </div>
  );
};
