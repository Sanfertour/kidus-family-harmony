import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/button"; // Asegúrate de las rutas
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    
    // Aquí tu lógica de Supabase (ejemplo)
    const { error } = await supabase.from('profiles').insert([{ display_name: name, role: role || 'Miembro' }]);

    if (error) {
      toast({ title: "Error", description: "No pudimos añadir al familiar.", variant: "destructive" });
    } else {
      toast({ title: "¡Bienvenido!", description: `${name} ya es parte del nido.` });
      setName(""); setRole("");
      onMemberAdded();
    }
    setLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-2xl rounded-[3rem] border-none shadow-2xl p-8 overflow-hidden">
        {/* Adorno de fondo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl -z-10" />
        
        <DialogHeader className="mb-6">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <UserPlus className="text-white w-7 h-7" />
          </div>
          <DialogTitle className="text-3xl font-black font-nunito tracking-tight">Nuevo Miembro</DialogTitle>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Añade equipo a tu nido</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nombre del familiar</label>
            <Input 
              placeholder="Ej: Mamá, Lucas..." 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="h-14 rounded-2xl bg-white/50 border-gray-100 font-bold focus:ring-blue-500" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Rol / Parentesco</label>
            <Input 
              placeholder="Ej: Capitán, Co-piloto..." 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="h-14 rounded-2xl bg-white/50 border-gray-100 font-bold" 
            />
          </div>

          <Button 
            onClick={handleAdd} 
            disabled={loading || !name}
            className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            {loading ? "Registrando..." : "Añadir al Equipo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
