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
import { UserPlus, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";

const TEAM_COLORS = [
  { name: 'Océano', bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
  { name: 'Atardecer', bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
  { name: 'Bosque', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { name: 'Lavanda', bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  { name: 'Rosa', bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-600' },
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
      const { data: myProfile } = await supabase.from('profiles').select('nest_id').eq('id', user?.id).single();

      // INSERT LIMPIO: Sin enviar ID para evitar el 409
      const { error } = await supabase
        .from('profiles')
        .insert({
          display_name: name,
          nest_id: myProfile?.nest_id,
          role: role,
          avatar_url: selectedColor.bg, // Guardamos el color temporalmente aquí
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: "¡Equipo ampliado!", description: `${name} ya tiene su sitio en el nido.` });
      setName("");
      onMemberAdded();
    } catch (error: any) {
      console.error("Error 409/Insert:", error);
      toast({ title: "Error de sincronización", description: "Inténtalo con otro nombre o alias.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[3rem] border-white/40 bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
        
        <DialogHeader className="pt-4">
          <DialogTitle className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <div className={`p-2 rounded-2xl ${selectedColor.bg} text-white shadow-lg rotate-3`}>
              <UserPlus size={24} />
            </div>
            Nuevo Integrante
          </DialogTitle>
          <DialogDescription className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-1 ml-14">
            Añade flujo y armonía a tu equipo
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          {/* Input con Inicial Dinámica */}
          <div className="relative flex items-center gap-4 group">
            <div className={`w-16 h-16 rounded-3xl ${selectedColor.bg} shadow-xl flex items-center justify-center text-2xl font-black text-white transition-all duration-500 group-focus-within:rotate-12`}>
              {name ? name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="flex-1 space-y-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Alias del miembro</label>
               <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mateo"
                className="h-12 rounded-xl border-none bg-gray-100/50 font-black focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Selector de Estatus (Inclusivo y Técnico) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Estatus de Autonomía</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('autonomous')}
                className={`flex flex-col items-center p-4 rounded-[2rem] border-2 transition-all duration-300 ${
                  role === 'autonomous' ? "border-blue-500 bg-blue-50/50 shadow-inner" : "border-gray-50 bg-white opacity-60"
                }`}
              >
                <ShieldCheck size={20} className={role === 'autonomous' ? "text-blue-500" : "text-gray-300"} />
                <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Gestión Activa</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('dependent')}
                className={`flex flex-col items-center p-4 rounded-[2rem] border-2 transition-all duration-300 ${
                  role === 'dependent' ? "border-orange-500 bg-orange-50/50 shadow-inner" : "border-gray-50 bg-white opacity-60"
                }`}
              >
                <HeartHandshake size={20} className={role === 'dependent' ? "text-orange-500" : "text-gray-300"} />
                <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Gestión Pasiva</span>
              </button>
            </div>
          </div>

          {/* Selector de Color (Paleta MTB) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color Identificativo</label>
            <div className="flex justify-between px-2">
              {TEAM_COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full ${color.bg} transition-all duration-300 ${
                    selectedColor.name === color.name ? "scale-125 ring-4 ring-white shadow-xl" : "scale-100 opacity-40 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className={`w-full h-16 rounded-[2rem] ${selectedColor.bg} hover:brightness-110 text-white font-black text-lg shadow-2xl shadow-gray-200 transition-all active:scale-95 flex gap-2`}
          >
            {loading ? <Sparkles className="animate-spin" /> : "DESPLEGAR AL EQUIPO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
