import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Shield, EyeOff, BookOpen, Trophy, HeartPulse, Sparkles, Loader2, Calendar, Clock, UserCheck, Baby } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Switch } from "@/components/ui/switch";
import { triggerHaptic } from "@/utils/haptics";
import { useNestStore } from '@/store/useNestStore';

const EVENT_CATEGORIES = [
  { id: 'school', label: 'Cole', icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
  { id: 'activity', label: 'Deporte', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'health', label: 'Salud', icon: HeartPulse, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
  { id: 'other', label: 'Tribu', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
];

export const ManualEventDrawer = ({ 
  isOpen, onClose, onEventAdded, members 
}: { 
  isOpen: boolean; onClose: () => void; onEventAdded: () => void;
  members: any[];
}) => {
  const { nestId, profile, fetchEvents } = useNestStore();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    assigned_to: '', // Guía responsable
    involved_member: '', // Peque/Tribu involucrado
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    description: '',
    is_private: false
  });

  const guias = members.filter(m => m.role === 'autonomous');
  const tribu = members.filter(m => m.role === 'dependent');

  const handleClose = () => {
    triggerHaptic('soft');
    onClose();
  };

  const handleSave = async () => {
    if (!nestId || !profile?.id) {
      toast({ title: "Error de sesión", description: "No se detectó el Nido activo.", variant: "destructive" });
      return;
    }

    if (!formData.title.trim()) {
      triggerHaptic('warning');
      toast({ title: "Título necesario", description: "¿Qué plan tenemos?" });
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();
      
      const finalDescription = formData.involved_member 
        ? `Involucra a: ${members.find(m => m.id === formData.involved_member)?.display_name}. ${formData.description}`
        : formData.description;

      const { error } = await supabase.from('events').insert([{ 
        title: formData.title.trim(),
        description: finalDescription.trim(),
        start_time: startDateTime,
        category: formData.category,
        assigned_to: formData.assigned_to || profile.id,
        nest_id: nestId,
        is_private: formData.is_private,
        created_by: profile.id 
      }]);

      if (error) throw error;

      await fetchEvents();
      triggerHaptic('success');
      toast({ title: "Sincronizado", description: "Evento añadido al Nido." });
      onEventAdded(); 
      onClose(); 
      setFormData({ title: '', category: 'other', assigned_to: '', involved_member: '', date: new Date().toISOString().split('T')[0], time: "09:00", description: '', is_private: false });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleClose} />
      
      <div className={`relative w-full max-w-md rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[95vh] overflow-y-auto no-scrollbar transition-all duration-700 ${formData.is_private ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* BOTÓN CERRAR */}
        <button 
          onClick={handleClose}
          className={`absolute top-6 right-8 p-2 rounded-full transition-colors ${formData.is_private ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-200/50 text-slate-500 hover:bg-slate-200'}`}
        >
          <X size={20} strokeWidth={3} />
        </button>

        <div className={`w-12 h-1.5 rounded-full mx-auto mb-8 ${formData.is_private ? 'bg-white/20' : 'bg-slate-300/50'}`} />

        <div className="space-y-6 pb-10">
          <header className="text-center">
             <h2 className="text-3xl font-black tracking-tighter italic">Nuevo Plan</h2>
             <p className={`text-[10px] font-bold uppercase tracking-widest ${formData.is_private ? 'text-orange-400' : 'text-sky-500'}`}>
               {formData.is_private ? 'Privacidad Individual' : 'Sincronía del Nido'}
             </p>
          </header>

          {/* CATEGORÍAS */}
          <div className="grid grid-cols-4 gap-3">
            {EVENT_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => { triggerHaptic('soft'); setFormData({...formData, category: cat.id}); }} 
                className={`flex flex-col items-center gap-2 py-4 rounded-[2rem] border-2 transition-all ${formData.category === cat.id ? `${cat.border} ${cat.bg} scale-105 shadow-md` : 'border-transparent bg-white/40 opacity-40'}`}>
                <cat.icon size={20} className={cat.color} />
              </button>
            ))}
          </div>

          <Input 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            placeholder="¿Qué vamos a hacer?" 
            className={`rounded-[2rem] h-16 border-none font-bold text-lg px-8 shadow-sm ${formData.is_private ? 'bg-white/10 text-white placeholder:text-white/30' : 'bg-white text-slate-900'}`} 
          />

          {/* QUIÉN SE ENCARGA (GUÍAS) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-4">
              <UserCheck size={12} className="text-sky-500" />
              <label className="text-[10px] font-black uppercase opacity-40 tracking-widest italic">¿Qué Guía se encarga?</label>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
              {guias.map(m => (
                <button key={m.id} onClick={() => { triggerHaptic('soft'); setFormData({...formData, assigned_to: m.id}); }} 
                  className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${formData.assigned_to === m.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white shadow-sm text-slate-400 border border-slate-100'}`}>
                  <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: m.color || '#000' }} />
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* PARA QUIÉN ES (TRIBU/PEQUES) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-4">
              <Baby size={12} className="text-pink-500" />
              <label className="text-[10px] font-black uppercase opacity-40 tracking-widest italic">¿Para qué peque es?</label>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
              <button onClick={() => setFormData({...formData, involved_member: ''})}
                className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${!formData.involved_member ? 'bg-pink-500 text-white shadow-lg' : 'bg-white shadow-sm text-slate-400 border border-slate-100'}`}>
                Toda la Tribu
              </button>
              {tribu.map(m => (
                <button key={m.id} onClick={() => { triggerHaptic('soft'); setFormData({...formData, involved_member: m.id}); }} 
                  className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${formData.involved_member === m.id ? 'bg-pink-500 text-white shadow-lg' : 'bg-white shadow-sm text-slate-400 border border-slate-100'}`}>
                  <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: m.color || '#ff0080' }} />
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={`w-full h-14 pl-10 pr-4 rounded-[1.5rem] border-none font-bold text-sm shadow-sm ${formData.is_private ? 'bg-white/10 text-white' : 'bg-white text-slate-900'}`} />
            </div>
            <div className="relative">
              <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
              <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className={`w-full h-14 pl-10 pr-4 rounded-[1.5rem] border-none font-bold text-sm shadow-sm ${formData.is_private ? 'bg-white/10 text-white' : 'bg-white text-slate-900'}`} />
            </div>
          </div>

          <div className={`flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all duration-700 ${formData.is_private ? 'bg-slate-950 border-orange-500/30 shadow-inner' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${formData.is_private ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {formData.is_private ? <EyeOff size={18} /> : <Shield size={18} />}
              </div>
              <span className={`text-[11px] font-black uppercase ${formData.is_private ? 'text-orange-400' : 'text-slate-900'}`}>Modo Privado</span>
            </div>
            <Switch checked={formData.is_private} onCheckedChange={(v) => { triggerHaptic('soft'); setFormData({...formData, is_private: v}); }} />
          </div>

          <Button onClick={handleSave} disabled={loading} className={`w-full h-20 rounded-[3rem] font-black text-lg tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4 ${formData.is_private ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'}`}>
            {loading ? <Loader2 className="animate-spin" /> : "SINCRONIZAR"}
          </Button>
        </div>
      </div>
    </div>
  );
};
