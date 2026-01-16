iimport { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    
    // 1. Obtenemos al usuario que está creando el miembro
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Insertamos en profiles. 
    // IMPORTANTE: Asegúrate de que tu tabla 'profiles' tenga estas columnas.
    const { error } = await supabase
      .from('profiles')
      .insert([{ 
        display_name: name, 
        role: role || 'Miembro',
        avatar_url: selectedColor, // Usamos el color como "avatar" temporal
        // Si tu tabla usa nest_id o family_id, aquí deberías vincularlo
      }]);

    if (error) {
      console.error(error);
      toast({ title: "Error de conexión", description: "No se pudo añadir al nido. Revisa los permisos.", variant: "destructive" });
    } else {
      toast({ title: "¡Miembro añadido!", description: `${name} ya tiene su lugar en el nido.` });
      setName(""); setRole("");
      setIsOpen(false);
      onMemberAdded();
    }
    setLoading(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 border-t sm:border border-white/50">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="mb-8">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200 text-white">
                <UserPlus size={28} />
              </div>
              <h2 className="text-3xl font-black font-nunito tracking-tight">Nuevo Miembro</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Coordinación y delegación</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">¿Quién es?</label>
                <Input placeholder="Nombre (ej: Lucas, Papá...)" value={name} onChange={(e) => setName(e.target.value)} className="h-14 rounded-2xl bg-white border-gray-100 font-bold mt-1" />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Su Color en la Agenda</label>
                <div className="flex justify-between mt-2 px-2">
                  {COLORS.map(color => (
                    <button 
                      key={color} 
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'ring-4 ring-blue-100 scale-125' : 'scale-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleAdd} disabled={loading || !name} className="w-full h-16 rounded-[2rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl active:scale-95 transition-all">
                {loading ? "Sincronizando..." : "Vincular al Nido"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
