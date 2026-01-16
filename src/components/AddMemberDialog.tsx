import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, User, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Naranja', value: '#f59e0b' },
  { name: 'Morado', value: '#8b5cf6' }
];

// Añadido 'children' para el botón personalizado
export const AddMemberDialog = ({ onMemberAdded, children }: { onMemberAdded: () => void, children?: React.ReactNode }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .insert([{ 
        display_name: name, 
        role: role || 'miembro',
        color: selectedColor // Guardamos el color
      }]);

    if (error) {
      toast({ title: "Error", description: "Vaya, algo ha fallado en la subida.", variant: "destructive" });
    } else {
      toast({ title: "¡Miembro listo!", description: `${name} ya es parte del equipo.` });
      setName(""); setRole(""); setOpen(false);
      onMemberAdded();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || ( // Renderiza el children si existe, si no, un botón por defecto
          <Button size="sm" className="rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg">
            <Plus className="w-4 h-4 mr-1" /> Añadir
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-nunito font-extrabold text-center">Nuevo Miembro</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Nombre</label>
            <Input placeholder="Ej: Lucas" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Color Identificativo</label>
            <div className="flex justify-around p-2 bg-gray-50 rounded-2xl">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedColor(c.value)}
                  className={`w-8 h-8 rounded-full border-4 transition-all ${selectedColor === c.value ? 'border-gray-400 scale-125' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleAdd} disabled={loading} className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold text-lg transition-all shadow-lg">
            {loading ? "Registrando..." : "¡Al Nido!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
