import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { 
  X, Calendar, Clock, Tag, 
  Lock, Globe, Loader2, Sparkles,
  ChevronRight
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
  const { nestId, members, profile } = useNestStore();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time) {
      toast({ title: "Datos incompletos", description: "El título y la fecha son obligatorios." });
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
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

      triggerHaptic('success');
      toast({ title: "Sincronía creada", description: "El evento ya está en el calendario del Nido." });
      onClose();
      // Reset form
      setFormData({ title: '', description: '', start_time: '', category: 'other', assigned_to: '', is_private: false });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-t-[3.5rem] sm:rounded-[3.5rem] shadow-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        
        {/* HEADER MODAL */}
        <header className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-50">
          <div>
            <h3 className="text-2xl font-black italic text-slate-900 tracking-tighter">Nuevo Plan</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Añadir a la Sincronía</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          
          {/* TÍTULO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">¿Qué vamos a hacer?</label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ej: Dentista Peques"
              className="h-16 rounded-2xl bg-slate-50 border-none font-bold text-lg px-6 focus:ring-4 focus:ring-sky-500/10"
            />
          </div>

          {/* FECHA Y HORA */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">¿Cuándo?</label>
            <div className="relative">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-500" size={18} />
              <input 
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="w-full h-16 rounded-2xl bg-slate-50 border-none font-bold pl-16 pr-6 focus:ring-4 focus:ring-sky-500/10 outline-none text-slate-600"
              />
            </div>
          </div>

          {/* ASIGNAR A MIEMBRO (Selector Dinámico) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">¿Quién participa?</label>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('soft');
                    setFormData({ ...formData, assigned_to: formData.assigned_to === member.id ? '' : member.id });
                  }}
                  className={`flex-shrink-0 flex items-center gap-3 p-2 pr-4 rounded-[1.4rem] border-2 transition-all duration-300 ${
                    formData.assigned_to === member.id 
                    ? 'border-sky-500 bg-sky-50 shadow-sm' 
                    : 'border-transparent bg-slate-50 opacity-60'
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-inner"
                    style={{ backgroundColor: member.avatar_url || '#64748B' }}
                  >
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-tighter">
                    {member.display_name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Categoría</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { triggerHaptic('soft'); setFormData({...formData, category: cat.id}); }}
                  className={`h-12 rounded-xl flex items-center px-4 gap-3 transition-all ${
                    formData.category === cat.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MODO PRIVADO */}
          <div 
            onClick={() => { triggerHaptic('soft'); setFormData({...formData, is_private: !formData.is_private}); }}
            className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex items-center justify-between ${
              formData.is_private ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${formData.is_private ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {formData.is_private ? <Lock size={18} /> : <Globe size={18} />}
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm italic">Modo Privado</p>
                <p className="text-[10px] text-slate-400 font-bold">Solo tú verás el contenido</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_private ? 'bg-amber-500' : 'bg-slate-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_private ? 'left-7' : 'left-1'}`} />
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <Button 
            disabled={loading}
            className="w-full h-20 rounded-[2rem] bg-slate-900 text-white font-black tracking-[0.2em] shadow-2xl hover:bg-slate-800 active:scale-95 transition-all mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-sky-400" />
                CREAR EN LA SINCRONÍA
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
