import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ShieldCheck, HeartHandshake, UserCircle2, Loader2 } from "lucide-react";

// Función de vibración para feedback táctil (Sincronía de la tribu)
const triggerHaptic = (type: 'soft' | 'success') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    if (type === 'soft') navigator.vibrate(10);
    else navigator.vibrate([20, 30, 20]);
  }
};

const TRIBU_COLORS = [
  { name: 'Sky', hex: '#0EA5E9', bg: 'bg-[#0EA5E9]', hover: 'hover:bg-[#0EA5E9]/90', shadow: 'shadow-sky-200' },
  { name: 'Vital', hex: '#F97316', bg: 'bg-[#F97316]', hover: 'hover:bg-[#F97316]/90', shadow: 'shadow-orange-200' },
  { name: 'Menta', hex: '#10B981', bg: 'bg-[#10B981]', hover: 'hover:bg-[#10B981]/90', shadow: 'shadow-emerald-200' },
  { name: 'Zen', hex: '#8B5CF6', bg: 'bg-[#8B5CF6]', hover: 'hover:bg-[#8B5CF6]/90', shadow: 'shadow-purple-200' },
  { name: 'Fuego', hex: '#F43F5E', bg: 'bg-[#F43F5E]', hover: 'hover:bg-[#F43F5E]/90', shadow: 'shadow-rose-200' },
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
    triggerHaptic('success'); // Feedback de éxito al procesar
    
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

      toast({ title: "Tribu expandida", description: `${name} ya forma parte del nido.` });
      setName("");
      onMemberAdded();
    } catch (error: any) {
      toast({ title: "Error de sincronía", description: "No pudimos integrar al miembro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild onClick={() => triggerHaptic('soft')}>{children}</DialogTrigger>
      
      <DialogContent className="sm:max-w-md border-none bg-white/95 backdrop-blur-2xl shadow-2xl rounded-[3.5rem] p-10 outline-none overflow-hidden">
        
        {/* Brisa Visual Superior Dinámica */}
        <div className={`absolute top-0 left-0 w-full h-2 ${selectedColor.bg} opacity-40 transition-colors duration-500`} />

        <DialogHeader className="space-y-6">
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-[2.5rem] ${selectedColor.bg} ${selectedColor.shadow} shadow-2xl flex items-center justify-center text-white text-4xl font-black transition-all duration-500 hover:scale-110`}>
              {name ? name.charAt(0).toUpperCase() : <UserCircle2 size={44} strokeWidth={1.5} />}
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Nuevo Integrante</DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Sincronía de la Tribu
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre o apodo"
            className="h-16 rounded-3xl border-none bg-slate-100/50 px-8 font-black text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/20 transition-all text-center text-lg"
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('autonomous'); }}
              className={`flex flex-col items-center p-6 rounded-[2.5rem] transition-all duration-400 ${
                role === 'autonomous' ? "bg-white shadow-xl scale-105" : "bg-transparent opacity-30 grayscale"
              }`}
            >
              <ShieldCheck className={role === 'autonomous' ? "text-sky-500" : "text-slate-500"} size={32} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-800">Guía</span>
            </button>
            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('dependent'); }}
              className={`flex flex-col items-center p-6 rounded-[2.5rem] transition-all duration-400 ${
                role === 'dependent' ? "bg-white shadow-xl scale-105" : "bg-transparent opacity-30 grayscale"
              }`}
            >
              <HeartHandshake className={role === 'dependent' ? "text-orange-500" : "text-slate-500"} size={32} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-800">Peque</span>
            </button>
          </div>

          {/* Selector de Color KidUs */}
          <div className="flex justify-center gap-3">
            {TRIBU_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => { triggerHaptic('soft'); setSelectedColor(color); }}
                className={`w-10 h-10 rounded-full ${color.bg} transition-all duration-300 ${
                  selectedColor.name === color.name ? "scale-125 ring-4 ring-white shadow-lg" : "scale-90 opacity-40 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          {/* BOTÓN FINAL CORREGIDO: IMPACTO Y FEEDBACK */}
          <Button 
            type="submit" 
            disabled={loading} 
            className={`w-full h-20 rounded-[2.5rem] ${selectedColor.bg} ${selectedColor.hover} text-white font-black text-base tracking-[0.2em] shadow-lg active:scale-95 transition-all duration-400 uppercase`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "UNIR A LA TRIBU"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
