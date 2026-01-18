import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  Loader2, 
  Baby, 
  UserPlus,
  X
} from "lucide-react";

const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else if (type === 'success') navigator.vibrate([20, 30, 20]);
  }
};

const TRIBU_COLORS = [
  { name: 'Sky', hex: '#0EA5E9', bg: 'bg-[#0EA5E9]', hover: 'hover:bg-[#0EA5E9]/90', shadow: 'shadow-sky-200/50' },
  { name: 'Vital', hex: '#F97316', bg: 'bg-[#F97316]', hover: 'hover:bg-[#F97316]/90', shadow: 'shadow-orange-200/50' },
  { name: 'Zen', hex: '#8B5CF6', bg: 'bg-[#8B5CF6]', hover: 'hover:bg-[#8B5CF6]/90', shadow: 'shadow-purple-200/50' },
  { name: 'Menta', hex: '#10B981', bg: 'bg-[#10B981]', hover: 'hover:bg-[#10B981]/90', shadow: 'shadow-emerald-200/50' },
  { name: 'Fuego', hex: '#F43F5E', bg: 'bg-[#F43F5E]', hover: 'hover:bg-[#F43F5E]/90', shadow: 'shadow-rose-200/50' },
];

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("dependent");
  const [selectedColor, setSelectedColor] = useState(TRIBU_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    triggerHaptic('success');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sin sesión activa");

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('profiles').insert({
        display_name: name,
        nest_id: myProfile?.nest_id,
        role: role, 
        avatar_url: selectedColor.hex,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({ 
        title: role === 'autonomous' ? "Nuevo Guía en el Nido" : "Tribu expandida", 
        description: `${name} ya forma parte de la sincronía.` 
      });
      
      setName("");
      onMemberAdded();
    } catch (error: any) {
      toast({ title: "Error de sincronía", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild onClick={() => triggerHaptic('soft')}>{children}</DialogTrigger>
      
      <DialogContent className="max-w-[90vw] sm:max-w-[440px] border-none bg-slate-50/95 backdrop-blur-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[4rem] p-10 outline-none overflow-hidden font-sans ring-1 ring-white/50">
        
        {/* BOTÓN DE CIERRE ZEN */}
        <DialogClose className="absolute right-10 top-10 p-3 rounded-[1.5rem] bg-white text-slate-300 hover:text-slate-800 transition-all active:scale-90 z-50 shadow-sm">
          <X size={18} strokeWidth={3} />
        </DialogClose>

        {/* Línea de color dinámica superior */}
        <div className={`absolute top-0 left-0 w-full h-3 ${selectedColor.bg} opacity-80 transition-colors duration-700`} />

        <DialogHeader className="space-y-8 pt-6">
          <div className="flex justify-center">
            <motion.div 
              layoutId="avatar"
              className={`w-28 h-28 rounded-[3.2rem] ${selectedColor.bg} ${selectedColor.shadow} shadow-2xl flex items-center justify-center text-white text-5xl font-black transition-all duration-700`}
            >
              {name ? name.charAt(0).toUpperCase() : <UserPlus size={44} strokeWidth={2.5} className="opacity-80" />}
            </motion.div>
          </div>
          <div className="text-center space-y-2">
            <DialogTitle className="text-5xl font-black text-slate-800 tracking-tighter font-nunito leading-tight">Sumar Integrante</DialogTitle>
            <DialogDescription className="text-sky-500 text-[10px] font-black uppercase tracking-[0.5em]">
              Sincroniza tu Nido
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-10 mt-10">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del integrante"
            className="h-20 rounded-[2.2rem] border-none bg-white shadow-inner px-8 font-black text-slate-800 placeholder:text-slate-200 focus:ring-4 focus:ring-sky-500/5 transition-all text-center text-xl"
          />

          <div className="grid grid-cols-2 gap-5">
            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('autonomous'); }}
              className={`flex flex-col items-center p-8 rounded-[3rem] transition-all duration-500 border-[3px] ${
                role === 'autonomous' 
                ? "bg-white border-white shadow-2xl shadow-sky-100 scale-105" 
                : "bg-transparent border-transparent opacity-30 grayscale"
              }`}
            >
              <ShieldCheck className={role === 'autonomous' ? "text-[#0EA5E9]" : "text-slate-400"} size={36} strokeWidth={2.5} />
              <span className="text-[11px] font-black mt-4 uppercase tracking-widest text-slate-800">Guía</span>
            </button>

            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('dependent'); }}
              className={`flex flex-col items-center p-8 rounded-[3rem] transition-all duration-500 border-[3px] ${
                role === 'dependent' 
                ? "bg-white border-white shadow-2xl shadow-orange-100 scale-105" 
                : "bg-transparent border-transparent opacity-30 grayscale"
              }`}
            >
              <Baby className={role === 'dependent' ? "text-[#F97316]" : "text-slate-400"} size={36} strokeWidth={2.5} />
              <span className="text-[11px] font-black mt-4 uppercase tracking-widest text-slate-800">Tribu</span>
            </button>
          </div>

          {/* Selector de Color */}
          <div className="flex justify-center gap-4 bg-white/50 p-4 rounded-[2rem]">
            {TRIBU_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => { triggerHaptic('soft'); setSelectedColor(color); }}
                className={`w-9 h-9 rounded-2xl ${color.bg} transition-all duration-500 ${
                  selectedColor.name === color.name ? "scale-110 rotate-6 ring-4 ring-white shadow-lg" : "scale-90 opacity-20 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <Button 
              type="submit" 
              disabled={loading || !name} 
              className={`w-full h-24 rounded-[3rem] ${selectedColor.bg} ${selectedColor.hover} text-white font-black text-base tracking-[0.2em] shadow-2xl active:scale-95 transition-all duration-500 uppercase`}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Integrar al Nido"}
            </Button>

            <DialogClose asChild>
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => triggerHaptic('soft')}
                className="w-full h-16 rounded-[2.5rem] font-black text-slate-400 uppercase tracking-widest text-[10px] hover:bg-transparent hover:text-slate-600 transition-all active:scale-95"
              >
                Volver a la Agenda
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
