import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNestStore } from "@/store/useNestStore";
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
import { triggerHaptic } from "@/utils/haptics";

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
  const [open, setOpen] = useState(false);
  
  const { nestId, fetchSession } = useNestStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación UUID para evitar roturas
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(nestId || "");
    
    if (!name.trim() || !nestId || !isUuid) {
        toast({ title: "Error", description: "No hay un Nido válido vinculado.", variant: "destructive" });
        return;
    }
    
    setLoading(true);
    triggerHaptic('success');
    
    try {
      const { error } = await supabase.from('profiles').insert({
        display_name: name.trim(),
        nest_id: nestId,
        role: role as 'autonomous' | 'dependent', 
        avatar_url: selectedColor.hex,
      });

      if (error) throw error;

      toast({ title: "Sincronía exitosa", description: `${name} ya está en el Nido.` });
      setName("");
      setOpen(false);
      
      await fetchSession();
      onMemberAdded();
      
    } catch (error: any) {
      toast({ title: "Error", description: "No pudimos integrar al miembro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(v) triggerHaptic('soft'); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="max-w-[90vw] sm:max-w-[440px] border-none bg-slate-50/95 backdrop-blur-3xl shadow-2xl rounded-[4rem] p-10 outline-none">
        
        <DialogClose className="absolute right-10 top-10 p-3 rounded-[1.5rem] bg-white text-slate-400 active:scale-90 z-50">
          <X size={18} strokeWidth={3} />
        </DialogClose>

        <div className={`absolute top-0 left-0 w-full h-3 ${selectedColor.bg} transition-colors duration-700`} />

        <DialogHeader className="space-y-8 pt-6 text-center">
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-[3rem] ${selectedColor.bg} shadow-2xl flex items-center justify-center text-white text-4xl font-black transition-all duration-700`}>
              {name ? name.charAt(0).toUpperCase() : <UserPlus size={40} />}
            </div>
          </div>
          <DialogTitle className="text-4xl font-black text-slate-800 tracking-tighter">Sumar Integrante</DialogTitle>
          <DialogDescription className="text-sky-500 text-[10px] font-black uppercase tracking-[0.4em]">Sincroniza tu Nido</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre..."
            className="h-16 rounded-[2rem] border-none bg-white px-6 font-black text-slate-800 text-center text-lg"
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('autonomous'); }}
              className={`flex flex-col items-center p-6 rounded-[2.5rem] transition-all border-4 ${role === 'autonomous' ? "bg-white border-sky-100 shadow-xl" : "bg-transparent border-transparent opacity-40 grayscale"}`}
            >
              <ShieldCheck className="text-sky-500" size={32} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-800">Guía</span>
            </button>

            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('dependent'); }}
              className={`flex flex-col items-center p-6 rounded-[2.5rem] transition-all border-4 ${role === 'dependent' ? "bg-white border-orange-100 shadow-xl" : "bg-transparent border-transparent opacity-40 grayscale"}`}
            >
              <Baby className="text-orange-500" size={32} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-800">Tribu</span>
            </button>
          </div>

          <div className="flex justify-center gap-3 bg-white/50 p-3 rounded-[2rem]">
            {TRIBU_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => { triggerHaptic('soft'); setSelectedColor(color); }}
                className={`w-8 h-8 rounded-xl ${color.bg} transition-all ${selectedColor.name === color.name ? "scale-110 ring-4 ring-white shadow-lg" : "scale-90 opacity-30"}`}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            disabled={loading || !name} 
            className={`w-full h-20 rounded-[2.5rem] ${selectedColor.bg} ${selectedColor.hover} text-white font-black text-sm tracking-widest shadow-2xl active:scale-95 transition-all`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "INTEGRAR AL NIDO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
