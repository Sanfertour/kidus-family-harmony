import React, { ReactNode, useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
import { triggerHaptic } from "@/utils/haptics";
import { Link2, Users, Check, ArrowLeft, ShieldCheck, Baby } from "lucide-react";
import { Profile } from "@/types/kidus";

interface AddMemberDialogProps {
  children: ReactNode;
  onMemberAdded?: () => Promise<void>;
  editingMember?: Profile | null; // Nueva prop para modo edición
}

const PRESET_COLORS = ["#0ea5e9", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];

export const AddMemberDialog = ({ children, onMemberAdded, editingMember }: AddMemberDialogProps) => {
  const [mode, setMode] = useState<'select' | 'link_guide' | 'create_member'>('select');
  const [loading, setLoading] = useState(false);
  const { nestId, fetchSession, fetchMembers } = useNestStore();
  const { toast } = useToast();

  const [targetNestCode, setTargetNestCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState<'autonomous' | 'dependent'>('dependent');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  // Efecto para cargar datos si estamos editando
  useEffect(() => {
    if (editingMember) {
      setMode('create_member');
      setMemberName(editingMember.display_name || "");
      setMemberRole(editingMember.role as 'autonomous' | 'dependent');
      setSelectedColor(editingMember.color || PRESET_COLORS[0]);
    }
  }, [editingMember]);

  const resetForm = () => {
    if (!editingMember) {
      setMode('select');
      setMemberName("");
      setMemberRole('dependent');
      setSelectedColor(PRESET_COLORS[0]);
    }
    setTargetNestCode("");
    setLoading(false);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nestId) return;
    setLoading(true);
    triggerHaptic(editingMember ? 'medium' : 'success');

    try {
      if (editingMember) {
        // MODO EDICIÓN (Cambiar color/nombre)
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: memberName,
            role: memberRole,
            color: selectedColor,
          })
          .eq('id', editingMember.id);

        if (error) throw error;
        toast({ title: "Sincronía Editada", description: "Cambios guardados correctamente." });
      } else {
        // MODO CREACIÓN
        const { error } = await supabase
          .from('profiles')
          .insert([{
            id: crypto.randomUUID(),
            nest_id: nestId,
            display_name: memberName,
            role: memberRole,
            color: selectedColor,
          }]);

        if (error) throw error;
        toast({ title: "Tribu Actualizada", description: `${memberName} se ha unido al nido.` });
      }

      // --- CAPA DE SERVICIOS: ACTUALIZACIÓN GLOBAL ---
      await fetchMembers(); 
      
      if (onMemberAdded) await onMemberAdded();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ... (handleLinkGuide se mantiene igual)
  const handleLinkGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    triggerHaptic('medium');
    try {
      const { data: targetNest, error: nestError } = await supabase
        .from('nests').select('id').eq('nest_code', targetNestCode.toUpperCase()).single();
      if (nestError || !targetNest) throw new Error("Código KID no encontrado");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");
      const { error: updateError } = await supabase.from('profiles').update({ nest_id: targetNest.id }).eq('id', user.id);
      if (updateError) throw updateError;
      toast({ title: "Nidos Sincronizados", description: "Sincronía completada." });
      await fetchSession();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetForm()}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-[3.5rem] border-none bg-white/95 backdrop-blur-2xl p-8 shadow-2xl max-w-[90vw] sm:max-w-md">
        <DialogHeader className="mb-6 text-center">
          <DialogTitle className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            {mode === 'select' && "Gestión de Nido"}
            {mode === 'link_guide' && "Vincular Guía"}
            {mode === 'create_member' && (editingMember ? "Editar Miembro" : "Añadir Miembro")}
          </DialogTitle>
          <DialogDescription className="sr-only">Gestión de miembros KidUs.</DialogDescription>
        </DialogHeader>

        {mode === 'select' && (
          <div className="space-y-4">
            <button onClick={() => { triggerHaptic('soft'); setMode('create_member'); }} className="w-full p-8 bg-slate-900 rounded-[2.5rem] text-left transition-all active:scale-95">
              <Users className="text-sky-400 mb-4" size={32} />
              <h4 className="text-white font-black italic text-xl uppercase tracking-tighter">Crear Miembro</h4>
              <p className="text-sky-400/60 text-[10px] font-bold uppercase tracking-widest mt-1">Añadir a la Tribu</p>
            </button>
            <button onClick={() => { triggerHaptic('soft'); setMode('link_guide'); }} className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-left transition-all active:scale-95">
              <Link2 className="text-orange-500 mb-4" size={32} />
              <h4 className="text-slate-900 font-black italic text-xl uppercase tracking-tighter">Vincular otro Nido</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Fusión mediante código KID</p>
            </button>
          </div>
        )}

        {mode === 'create_member' && (
          <form onSubmit={handleCreateOrUpdate} className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div 
                className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl transition-colors duration-500"
                style={{ backgroundColor: selectedColor }}
              >
                {memberName ? memberName.charAt(0).toUpperCase() : "?"}
              </div>
              
              <Input 
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Nombre del miembro"
                className="h-14 rounded-2xl bg-slate-50 border-none text-center text-lg font-bold italic"
                required
              />

              <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                <button type="button" onClick={() => { triggerHaptic('soft'); setMemberRole('dependent'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${memberRole === 'dependent' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                  <Baby size={16} /> <span className="text-[10px] font-black uppercase italic">Tribu</span>
                </button>
                <button type="button" onClick={() => { triggerHaptic('soft'); setMemberRole('autonomous'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${memberRole === 'autonomous' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                  <ShieldCheck size={16} /> <span className="text-[10px] font-black uppercase italic">Guía</span>
                </button>
              </div>

              <div className="flex gap-2">
                {PRESET_COLORS.map(color => (
                  <button key={color} type="button" onClick={() => { triggerHaptic('soft'); setSelectedColor(color); }}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: color }}>
                    {selectedColor === color && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-black uppercase italic tracking-widest">
              {loading ? "Sincronizando..." : (editingMember ? "Guardar Cambios" : "Confirmar Miembro")}
            </Button>
          </form>
        )}

        {mode !== 'select' && !editingMember && (
          <button onClick={() => setMode('select')} className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <ArrowLeft size={12} /> Volver
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};
