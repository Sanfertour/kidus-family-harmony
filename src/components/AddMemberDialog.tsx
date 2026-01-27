import React, { ReactNode, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
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
  editingMember?: Profile | null;
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

  useEffect(() => {
    if (editingMember) {
      setMode('create_member');
      setMemberName(editingMember.display_name || "");
      setMemberRole(editingMember.role as 'autonomous' | 'dependent');
      setSelectedColor(editingMember.color || PRESET_COLORS[0]);
    }
  }, [editingMember]);

  const resetForm = () => {
    if (!editingMember) setMode('select');
    setLoading(false);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nestId) return;
    setLoading(true);
    triggerHaptic('success');

    try {
      if (editingMember) {
        const { error } = await supabase.from('profiles').update({
          display_name: memberName,
          role: memberRole,
          color: selectedColor,
        }).eq('id', editingMember.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('profiles').insert([{
          id: crypto.randomUUID(),
          nest_id: nestId,
          display_name: memberName,
          role: memberRole,
          color: selectedColor,
        }]);
        if (error) throw error;
      }
      await fetchMembers(); 
      if (onMemberAdded) await onMemberAdded();
      toast({ title: "Sincronía Actualizada", description: "La Tribu ha sido actualizada." });
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
        <DialogHeader className="mb-6 text-center">
          <DialogTitle className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
            {mode === 'select' ? "Gestión de Nido" : mode === 'link_guide' ? "Vincular Guía" : "Miembro"}
          </DialogTitle>
        </DialogHeader>

        {mode === 'select' && (
          <div className="space-y-4">
            <button onClick={() => { triggerHaptic('soft'); setMode('create_member'); }} className="w-full p-8 bg-slate-900 rounded-[2.5rem] text-left active:scale-95 transition-all">
              <Users className="text-sky-400 mb-4" size={32} />
              <h4 className="text-white font-black italic text-xl uppercase tracking-tighter">Nueva Tribu</h4>
              <p className="text-sky-400/60 text-[10px] font-bold uppercase tracking-widest mt-1">Añadir dependiente</p>
            </button>
            <button onClick={() => { triggerHaptic('soft'); setMode('link_guide'); }} className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] text-left active:scale-95 transition-all">
              <Link2 className="text-orange-500 mb-4" size={32} />
              <h4 className="text-slate-900 font-black italic text-xl uppercase tracking-tighter">Sincronizar Guía</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Fusión mediante código KID</p>
            </button>
          </div>
        )}

        {mode === 'create_member' && (
          <form onSubmit={handleCreateOrUpdate} className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl transition-colors duration-500" style={{ backgroundColor: selectedColor }}>
                {memberName ? memberName.charAt(0).toUpperCase() : "?"}
              </div>
              <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Nombre" className="h-14 rounded-2xl bg-slate-50 border-none text-center text-lg font-bold italic" required />
              <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
                <button type="button" onClick={() => setMemberRole('dependent')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${memberRole === 'dependent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                  <Baby size={16} /> <span className="text-[10px] font-black uppercase">Tribu</span>
                </button>
                <button type="button" onClick={() => setMemberRole('autonomous')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${memberRole === 'autonomous' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                  <ShieldCheck size={16} /> <span className="text-[10px] font-black uppercase">Guía</span>
                </button>
              </div>
              <div className="flex gap-2">
                {PRESET_COLORS.map(color => (
                  <button key={color} type="button" onClick={() => setSelectedColor(color)} className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style={{ backgroundColor: color }}>
                    {selectedColor === color && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-16 bg-slate-900 text-white rounded-[2rem] font-black uppercase italic tracking-widest">
              {loading ? "Sincronizando..." : "Confirmar"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
