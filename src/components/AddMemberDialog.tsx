// ... (imports se mantienen igual, solo asegurar la ruta de supabase)
import { supabase } from "@/lib/supabase"; 

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  // ... (estados se mantienen igual)
  
  const { nestId, fetchSession } = useNestStore(); 
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDACIÓN CIRUJANO: ¿Es un UUID válido?
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(nestId || "");
    
    if (!name.trim() || !nestId || !isUuid) {
        toast({ 
          title: "Error de Sincronía", 
          description: "No se detectó un Nido válido para integrar miembros.", 
          variant: "destructive" 
        });
        return;
    }
    
    setLoading(true);
    triggerHaptic('success');
    
    try {
      // Inserción con el UUID y el rol correcto
      const { error } = await supabase.from('profiles').insert({
        display_name: name.trim(),
        nest_id: nestId, // Aquí enviamos el UUID
        role: role as 'autonomous' | 'dependent', 
        avatar_url: selectedColor.hex, // Guardamos el HEX como avatar
      });

      if (error) throw error;

      toast({ 
        title: role === 'autonomous' ? "Nuevo Guía" : "Tribu expandida", 
        description: `${name} ya está en sincronía.` 
      });
      
      setName("");
      setOpen(false);
      
      if (onMemberAdded) onMemberAdded();
      
    } catch (error: any) {
      console.error("Error al integrar miembro:", error);
      toast({ title: "Error", description: "No pudimos añadir al integrante.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ... (El resto del renderizado es perfecto, no lo toques)
  
