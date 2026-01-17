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
import { Sparkles, ShieldCheck, HeartHandshake, UserCircle2 } from "lucide-react";

// Colores con su HEX para la base de datos y clases Tailwind para la UI
const TEAM_COLORS = [
  { name: 'Vital', hex: '#00B4D8', bg: 'bg-[#00B4D8]', shadow: 'shadow-blue-200' },
  { name: 'Natura', hex: '#52B788', bg: 'bg-[#52B788]', shadow: 'shadow-green-200' },
  { name: 'Energía', hex: '#F9C74F', bg: 'bg-[#F9C74F]', shadow: 'shadow-yellow-200' },
  { name: 'Calma', hex: '#9B5DE5', bg: 'bg-[#9B5DE5]', shadow: 'shadow-purple-200' },
  { name: 'Fuego', hex: '#F94144', bg: 'bg-[#F94144]', shadow: 'shadow-red-200' },
];

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("dependent");
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión de usuario");

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', user.id)
        .single();

      const { error } = await supabase.from('profiles').insert({
        display_name: name,
        nest_id: myProfile?.nest_id,
        role: role,
        avatar_url: selectedColor.hex, // Aquí guardamos el color para que no salga gris
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({ title: "Miembro integrado", description: "El equipo está creciendo." });
      setName("");
      onMemberAdded();
    } catch (error: any) {
      console.error("Error:", error);
      toast({ title: "Aviso", description: "No se pudo guardar el miembro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/* Ajustado: rounded-[4rem] y overflow-hidden para eliminar esquinas cuadradas */}
      <DialogContent className="sm:max-w-md border-none bg-white/90 backdrop-blur-2xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] rounded-[4rem] p-10 overflow-hidden outline-none">
        
        {/* Decoración superior sutil */}
        <div className={`absolute top-0 left-0 w-full h-3 ${selectedColor.bg} opacity-50`} />

        <DialogHeader className="space-y-6">
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-[3rem] ${selectedColor.bg} ${selectedColor.shadow} shadow-2xl flex items-center justify-center text-white text-4xl font-black transition-all duration-700 hover:scale-110 hover:rotate-3`}>
              {name ? name.charAt(0).toUpperCase() : <UserCircle2 size={40} strokeWidth={1.5} />}
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">Nuevo Miembro</DialogTitle>
            <DialogDescription className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              Sincronía Familiar
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-10 mt-8">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del integrante"
            className="h-16 rounded-[2rem] border-none bg-slate-100/50 px-8 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-slate-100 transition-all text-center text-lg shadow-inner"
          />

          <div className="grid grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setRole('autonomous')}
              className={`group flex flex-col items-center p-6 rounded-[3rem] transition-all duration-500 ${
                role === 'autonomous' ? "bg-white shadow-2xl scale-105" : "bg-transparent opacity-30 hover:opacity-50"
              }`}
            >
              <ShieldCheck className={role === 'autonomous' ? "text-blue-500" : "text-slate-500"} size={28} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest">Autónomo</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('dependent')}
              className={`group flex flex-col items-center p-6 rounded-[3rem] transition-all duration-500 ${
                role === 'dependent' ? "bg-white shadow-2xl scale-105" : "bg-transparent opacity-30 hover:opacity-50"
              }`}
            >
              <HeartHandshake className={role === 'dependent' ? "text-orange-400" : "text-slate-500"} size={28} />
              <span className="text-[10px] font-black mt-3 uppercase tracking-widest">Dependiente</span>
            </button>
          </div>

          {/* Selector de Color */}
          <div className="flex justify-center gap-4">
            {TEAM_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full ${color.bg} transition-all duration-500 ${
                  selectedColor.name === color.name ? "scale-125 ring-[6px] ring-white shadow-xl" : "scale-90 opacity-40 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className={`w-full h-20 rounded-[2.5rem] ${selectedColor.bg} text-white font-black text-base tracking-[0.2em] shadow-xl hover:brightness-110 transition-all active:scale-95`}
          >
            {loading ? <Sparkles className="animate-spin" /> : "AÑADIR AL EQUIPO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
