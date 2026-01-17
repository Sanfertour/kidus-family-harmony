import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/button"; // Ajusta el import según tu librería de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Baby, Heart, User } from "lucide-react";

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // 1. Obtenemos el nest_id del usuario actual (el tuyo)
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', user?.id)
        .single();

      if (!profile?.nest_id) throw new Error("No tienes un nido asignado");

      // 2. Insertamos al miembro pasivo
      // IMPORTANTE: No enviamos 'id', Supabase generará uno aleatorio
      const { error } = await supabase
        .from('profiles')
        .insert({
          display_name: name,
          nest_id: profile.nest_id,
          role: role,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: "Miembro añadido", description: `${name} ya es parte del nido.` });
      setName("");
      onMemberAdded(); // Refresca la lista en el Index
    } catch (error: any) {
      console.error("Error añadiendo miembro:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo añadir al miembro. Revisa los permisos.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <UserPlus className="text-blue-500" /> Nuevo Miembro
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lucía o Mateo"
              className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rol en el equipo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'member', label: 'General', icon: User },
                { id: 'child', label: 'Hijo/a', icon: Baby },
                { id: 'partner', label: 'Pareja', icon: Heart },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    role === r.id 
                    ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm" 
                    : "border-gray-50 bg-white text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <r.icon size={20} className="mb-1" />
                  <span className="text-[10px] font-bold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            {loading ? "AÑADIENDO..." : "GUARDAR MIEMBRO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
