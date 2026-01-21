import React, { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
import { triggerHaptic } from "@/utils/haptics";
import { Link2, Baby, Check, ArrowLeft } from "lucide-react";

interface AddMemberDialogProps {
  children: ReactNode;
  onMemberAdded?: () => Promise<void>;
}

const PRESET_COLORS = ["#0ea5e9", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];

export const AddMemberDialog = ({ children, onMemberAdded }: AddMemberDialogProps) => {
  const [mode, setMode] = useState<'select' | 'link_guide' | 'create_tribe'>('select');
  const [loading, setLoading] = useState(false);
  const { nestId, fetchSession } = useNestStore();
  const { toast } = useToast();

  // Estados de formulario
  const [targetNestCode, setTargetNestCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const resetForm = () => {
    setMode('select');
    setTargetNestCode("");
    setMemberName("");
    setLoading(false);
  };

  // 1. VINCULAR GUÍA (Fusión de Nidos mediante Código KID)
  const handleLinkGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    triggerHaptic('medium');

    try {
      // Buscamos el Nido que tiene ese código
      const { data: targetNest, error: nestError } = await supabase
        .from('nests')
        .select('id')
        .eq('nest_code', targetNestCode.toUpperCase())
        .single();

      if (nestError || !targetNest) throw new Error("Código KID no encontrado");

      // Actualizamos nuestro perfil para unirnos a ese Nido
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ nest_id: targetNest.id })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({ title: "Nidos Sincronizados", description: "Ahora compartís agenda y carga mental." });
      await fetchSession();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error de Sincronía", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // 2. CREAR TRIBU (Peques/Dependientes con Color)
  const handleCreateTribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nestId) return;
    setLoading(true);
    triggerHaptic('medium');

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          nest_id: nestId,
          display_name: memberName,
          role: 'dependent',
          color: selectedColor, // Usamos la columna color de tu DB
        }]);

      if (error) throw error;

      toast({ title: "Tribu Actualizada", description: `${memberName} se ha unido al nido.` });
      if (onMemberAdded) await onMemberAdded();
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && resetForm()}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-[3.5rem] border-none bg-white/95 backdrop-blur-2xl p-8 shadow-2xl max-w-[90vw] sm:max-w-md">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black italic tracking-tighter text-slate-900 text-center uppercase">
            {mode === 'select' && "Integración"}
            {mode === 'link_guide' && "Vincular Guía"}
            {mode === 'create_tribe' && "Nueva Tribu"}
          </DialogTitle>
        </DialogHeader>

        {mode === 'select' && (
          <div className="space-y-4">
            <button 
              onClick={() => { triggerHaptic('soft'); setMode('link_guide'); }}
              className="w-full p-8 bg-slate-900 rounded-[2.5rem] text-left group transition-all active:scale-95"
            >
              <Link2 className="text-sky-400 mb-4" size={32} />
              <h4 className="text-white font-black italic text-xl uppercase tracking-tighter">Vincular Nido</h4>
              <p className="text-sky-400/60 text-[10px] font-bold uppercase tracking-widest mt-1">Usa un código KID-XXXXX</p>
            </button>

            <button 
              onClick={() => { triggerHaptic('soft'); setMode('create_tribe'); }}
              className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-left group transition-all active:scale-95"
            >
              <Baby className="text-orange-500 mb-4" size={32} />
              <h4 className="text-slate-900 font-black italic text-xl uppercase tracking-tighter">Añadir Peque</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Gestión directa sin cuenta</p>
            </button>
          </div>
        )}

        {mode === 'link_guide' && (
          <form onSubmit={handleLinkGuide} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4 italic text-center block">Código KID del otro Guía</label>
              <Input 
                value={targetNestCode}
                onChange={(e) => setTargetNestCode(e.target.value.toUpperCase())}
                placeholder="KID-XXXXX"
                className="h-16 rounded-2xl bg-slate-50 border-none text-center text-2xl font-black tracking-widest"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-black uppercase italic tracking-widest">
              {loading ? "Sincronizando..." : "Fusionar Nidos"}
            </Button>
          </form>
        )}

        {mode === 'create_tribe' && (
          <form onSubmit={handleCreateTribe} className="space-y-8">
            <div className="flex flex-col items-center gap-6">
              <div 
                className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl transition-all duration-500"
                style={{ backgroundColor: selectedColor }}
              >
                {memberName ? memberName.charAt(0).toUpperCase() : "?"}
              </div>
              <Input 
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Nombre del peque"
                className="h-16 rounded-2xl bg-slate-50 border-none text-center text-xl font-bold italic"
                required
              />
              <div className="flex gap-3">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { triggerHaptic('soft'); setSelectedColor(color); }}
                    className="w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-black uppercase italic tracking-widest">
              {loading ? "Añadiendo..." : "Confirmar Miembro"}
            </Button>
          </form>
        )}

        {mode !== 'select' && (
          <button 
            onClick={() => setMode('select')}
            className="mt-6 w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest"
          >
            <ArrowLeft size={12} /> Volver
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};
