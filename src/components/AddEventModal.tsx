import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { 
  X, Calendar, Lock, Globe, Loader2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { triggerHaptic } from "@/utils/haptics";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { id: 'school', label: 'Colegio', color: 'bg-blue-500' },
  { id: 'meal', label: 'Alimentación', color: 'bg-emerald-500' },
  { id: 'health', label: 'Salud', color: 'bg-rose-500' },
  { id: 'activity', label: 'Extraescolar', color: 'bg-amber-500' },
  { id: 'other', label: 'Otros', color: 'bg-slate-500' },
];

export const AddEventModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { nestId, members, profile, fetchEvents } = useNestStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    category: 'other',
    assigned_to: '',
    is_private: false
  });

  if (!isOpen) return null;

  // Lógica de Notificación Push mediante Edge Function
  const notifyTribu = async (eventTitle: string) => {
    try {
      const otherGuias = members.filter(m => m.role === 'autonomous' && m.id !== profile?.id);
      if (otherGuias.length === 0) return;

      // Llamada a tu Edge Function
      await fetch('https://nzwctnxfwoxtamytwebj.supabase.co/functions/v1/send-push-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nest_id: nestId,
          title: "Sincronía en el Nido 🌿",
          body: `${profile?.display_name} ha añadido: "${eventTitle}"`,
          data: { url: "/agenda" }
        })
      });
    } catch (err) {
      console.error("Error en notificación push:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time) {
      toast({ title: "Datos incompletos", description: "Título y fecha requeridos." });
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      // 1. Inserción en Supabase
      const { error } = await supabase.from('events').insert([{
        nest_id: nestId,
        created_by: profile?.id,
        title: formData.title,
        description: formData.description,
        start_time: new Date(formData.start_time).toISOString(),
        category: formData.category,
        assigned_to: formData.assigned_to || null,
        is_private: formData.is_private
      }]);

      if (error) throw error;

      // 2. Éxito: Háptico y Notificación
      triggerHaptic('success');
      await notifyTribu(formData.title);
      
      toast({ title: "Sincronía creada", description: "El plan ya está en el calendario." });
      
      await fetchEvents(); 
      onClose();
      setFormData({ title: '', description: '', start_time: '', category: 'other', assigned_to: '', is_private: false });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-t-[4rem] sm:rounded-[3.5rem] shadow-3xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 mb-0">
        
        <header className="px-10 pt-10 pb-6 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-black italic text-slate-900 tracking-tighter">Nuevo Plan</h3>
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] mt-1">Sincronía Familiar</p>
          </div>
          <button 
            type="button"
            onClick={() => { triggerHaptic('soft'); onClose(); }} 
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all"
          >
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="px-10 pb-24 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* TÍTULO */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">¿Qué hito vamos a crear?</label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ej: Recoger cartulinas"
              className="h-16 rounded-[1.8rem] bg-slate-50 border-none font-bold text-xl px-6 focus:ring-4 focus:ring-sky-500/10 transition-all"
            />
          </div>

          {/* ASIGNAR A LA TRIBU (USANDO COLOR) */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">Asignar a la Tribu</label>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('soft');
                    setFormData({ ...formData, assigned_to: formData.assigned_to === member.id ? '' : member.id });
                  }}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-[2.2rem] transition-all duration-300 border-2 ${
                    formData.assigned_to === member.id 
                    ? 'border-slate-900 bg-slate-900 text-white scale-105 shadow-xl' 
                    : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'
                  }`}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg"
                    style={{ backgroundColor: member.color || '#64748B' }}
                  >
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {member.display_name?.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FECHA Y HORA */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">¿Cuándo sucede?</label>
            <div className="relative">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-500" size={20} />
              <input 
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="w-full h-16 rounded-[1.8rem] bg-slate-50 border-none font-bold pl-16 pr-6 outline-none focus:ring-4 focus:ring-sky-500/10 text-slate-600"
              />
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { triggerHaptic('soft'); setFormData({...formData, category: cat.id}); }}
                className={`h-14 rounded-2xl flex items-center px-4 gap-3 border-2 transition-all ${
                  formData.category === cat.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-50 bg-white text-slate-400'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                <span className="text-[10px] font-black uppercase tracking-widest italic">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* MODO PRIVADO */}
          <button 
            type="button"
            onClick={() => { triggerHaptic('soft'); setFormData({...formData, is_private: !formData.is_private}); }}
            className={`w-full p-6 rounded-[2.2rem] border-2 flex items-center justify-between transition-all ${
              formData.is_private ? 'border-orange-200 bg-orange-50' : 'border-slate-50 bg-white'
            }`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`p-3 rounded-2xl ${formData.is_private ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {formData.is_private ? <Lock size={20} /> : <Globe size={20} />}
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm italic">Modo Privado</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Invisible para la Tribu</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all ${formData.is_private ? 'bg-orange-500' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_private ? 'left-7' : 'left-1'}`} />
            </div>
          </button>

          {/* BOTÓN SUBMIT CON MARGEN PARA EL BOTTOM NAV */}
          <div className="pt-4 pb-10">
            <Button 
              disabled={loading}
              className="w-full h-20 rounded-[2.5rem] bg-slate-900 text-white font-black tracking-[0.3em] shadow-2xl hover:bg-slate-800 active:scale-95 transition-all italic"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-sky-400" />
                  VOLCAR AL CALENDARIO
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
                  
