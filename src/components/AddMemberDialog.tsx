import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AddMemberDialog = ({ onMemberAdded }: { onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    
    // Aquí asumo que ya tienes el nest_id del usuario actual
    // Para simplificar ahora, creamos un perfil vinculado
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user) {
      const { error } = await supabase
        .from('profiles')
        .insert([{ 
          display_name: name, 
          role: role || 'miembro',
          // Aquí iría el nest_id si lo tuviéramos
        }]);

      if (error) {
        toast({ title: "Error", description: "No se pudo añadir", variant: "destructive" });
      } else {
        toast({ title: "¡Éxito!", description: `${name} ya está en el nido.` });
        setName("");
        setRole("");
        setOpen(false);
        onMemberAdded();
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full bg-kidus-blue">
          <Plus className="w-4 h-4 mr-1" /> Añadir
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-none">
        <DialogHeader>
          <DialogTitle className="font-nunito text-2xl">Nuevo Miembro</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input 
            placeholder="Nombre (ej: Lucas)" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="bg-white/50"
          />
          <Input 
            placeholder="Rol (ej: Hijo, Abuela, Logística)" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="bg-white/50"
          />
          <Button 
            onClick={handleAdd} 
            disabled={loading} 
            className="w-full bg-kidus-orange hover:bg-kidus-orange/90"
          >
            {loading ? "Registrando..." : "Añadir al Nido"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
