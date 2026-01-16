import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!name) return;
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .insert([{ display_name: name, role: role || 'Miembro' }]);

    if (error) {
      toast({ title: "Error", description: "No pudimos añadir al familiar.", variant: "destructive" });
    } else {
      toast({ title: "¡Bienvenido!", description: `${name} ya es parte del nido.` });
      setName(""); setRole("");
      setIsOpen(false);
      onMemberAdded();
    }
    setLoading(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/50">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>

            <div className="mb-8">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                <UserPlus className="text-white w-7 h-7" />
              </div>
              <h2 className="text-3xl font-black font-nunito tracking-tight text-gray-800">Nuevo Miembro</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Añade equipo a tu nido</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nombre</label>
                <Input 
                  placeholder="Ej: Mamá, Lucas..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-white border-gray-100 font-bold" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Rol / Parentesco</label>
                <Input 
                  placeholder="Ej: Capitán, Co-piloto..." 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="h-14 rounded-2xl bg-white border-gray-100 font-bold" 
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
          </div>
        </div>
      )}
    </>
  );
};
