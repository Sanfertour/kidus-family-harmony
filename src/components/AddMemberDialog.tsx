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
import { UserPlus, personStanding, UserRound, Users } from "lucide-react";

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("dependent");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', user?.id)
        .single();

      const { error } = await supabase
        .from('profiles')
        .insert({
          display_name: name,
          nest_id: profile?.nest_id,
          role: role, // 'autonomous' para adultos/pareja pasiva, 'dependent' para niños/personas a cargo
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: "Miembro registrado", description: `${name} se ha unido al equipo.` });
      setName("");
      onMemberAdded();
    } catch (error: any) {
      console.error("Error añadiendo miembro:", error);
      toast({ title: "Conflicto", description: "Este miembro ya parece existir en el nido.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <UserPlus className="text-blue-500" /> Nuevo Integrante
          </DialogTitle>
          <DialogDescription className="text-gray-400 font-medium text-xs">
            Añade personas que forman parte de la dinámica diaria del nido.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nombre o Alias</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la persona"
              className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nivel de Autonomía</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('autonomous')}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  role === 'autonomous' ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-50 text-gray-400"
                }`}
              >
                <Users size={20} className="mb-1" />
                <span className="text-[10px] font-black uppercase">Autónomo</span>
                <span className="text-[8px] opacity-60">Pareja / Adultos</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('dependent')}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  role === 'dependent' ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-50 text-gray-400"
                }`}
              >
                <UserRound size={20} className="mb-1" />
                <span className="text-[10px] font-black uppercase">Dependiente</span>
                <span className="text-[8px] opacity-60">Menores / Cuidados</span>
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black shadow-lg">
            {loading ? "REGISTRANDO..." : "AÑADIR AL EQUIPO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
