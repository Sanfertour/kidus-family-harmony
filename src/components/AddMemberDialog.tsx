import { useState } from "react";
import { supabase } from "@/lib/supabase"; // Ajustado el path para ser estándar
import { useNestStore } from "@/store/useNestStore";
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
import { 
  ShieldCheck, 
  Loader2, 
  Baby, 
  UserPlus,
  X
} from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";

const TRIBU_COLORS = [
  { name: 'Sky', hex: '#0EA5E9', bg: 'bg-[#0EA5E9]', hover: 'hover:bg-[#0EA5E9]/90' },
  { name: 'Vital', hex: '#F97316', bg: 'bg-[#F97316]', hover: 'hover:bg-[#F97316]/90' },
  { name: 'Zen', hex: '#8B5CF6', bg: 'bg-[#8B5CF6]', hover: 'hover:bg-[#8B5CF6]/90' },
  { name: 'Menta', hex: '#10B981', bg: 'bg-[#10B981]', hover: 'hover:bg-[#10B981]/90' },
  { name: 'Fuego', hex: '#F43F5E', bg: 'bg-[#F43F5E]', hover: 'hover:bg-[#F43F5E]/90' },
];

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("child"); // 'adult' o 'child' según tu SQL
  const [selectedColor, setSelectedColor] = useState(TRIBU_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { nestId } = useNestStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !nestId) {
        toast({ title: "Error", description: "Datos incompletos.", variant: "destructive" });
        return;
    }
    
    setLoading(true);
    triggerHaptic('success');
    
    try {
      // INSERCIÓN EN TABLA MEMBERS (La fuente de verdad ahora)
      const { error } = await supabase.from('members').insert({
        name: name.trim(),
        nest_id: nestId,
        role: role, 
        color: selectedColor.hex,
        avatar_url: selectedColor.hex, // Mantenemos ambos por si acaso
      });

      if (error) throw error;

      toast({ title: "Sincronía exitosa", description: `${name} ya es parte de la tribu.` });
      setName("");
      setOpen(false);
      
      onMemberAdded(); // Esto refrescará el Index y el fetchTribu()
      
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: "No pudimos integrar al miembro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(v) triggerHaptic('soft'); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      <DialogContent className="max-w-[90vw] sm:max-w-[440px] border-none bg-slate-50 shadow-2xl rounded-[3.5rem] p-10 outline-none">
        
        {/* Un solo botón de cerrar integrado con el estilo del Drawer */}
        <div className={`absolute top-0 left-0 w-full h-3 ${selectedColor.bg} transition-colors duration-700 rounded-t-[3.5rem]`} />

        <DialogHeader className="space-y-6 pt-4 text-center">
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-[2.5rem] ${selectedColor.bg} shadow-2xl flex items-center justify-center text-white text-4xl font-black transition-all duration-700`}>
              {name ? name.charAt(0).toUpperCase() : <UserPlus size={40} />}
            </div>
          </div>
          <DialogTitle className="text-4xl font-black text-slate-800 tracking-tighter italic">Sumar Integrante</DialogTitle>
          <DialogDescription className="text-sky-500 text-[10px] font-black uppercase tracking-[0.4em]">Sincroniza tu Nido</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre..."
            className="h-16 rounded-[2rem] border-none bg-white px-6 font-black text-slate-800 text-center text-lg shadow-sm"
          />

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('adult'); }}
              className={`flex flex-col items-center p-6 rounded-[2rem] transition-all border-4 ${role === 'adult' ? "bg-white border-sky-100 shadow-xl scale-105" : "bg-transparent border-transparent opacity-40 grayscale"}`}
            >
              <ShieldCheck className="text-sky-500" size={32} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-800">Guía</span>
            </button>

            <button
              type="button"
              onClick={() => { triggerHaptic('soft'); setRole('child'); }}
              className={`flex flex-col items-center p-6 rounded-[2rem] transition-all border-4 ${role === 'child' ? "bg-white border-orange-100 shadow-xl scale-105" : "bg-transparent border-transparent opacity-40 grayscale"}`}
            >
              <Baby className="text-orange-500" size={32} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-800">Tribu</span>
            </button>
          </div>

          <div className="flex justify-center gap-3 bg-white/50 p-4 rounded-[2rem]">
            {TRIBU_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => { triggerHaptic('soft'); setSelectedColor(color); }}
                className={`w-10 h-10 rounded-2xl ${color.bg} transition-all ${selectedColor.name === color.name ? "scale-110 ring-4 ring-white shadow-lg" : "scale-90 opacity-30"}`}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            disabled={loading || !name} 
            className={`w-full h-20 rounded-[2.5rem] ${selectedColor.bg} ${selectedColor.hover} text-white font-black text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all mt-4`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "INTEGRAR AL NIDO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
