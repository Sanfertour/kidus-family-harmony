import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";

// ESTA ES LA CLAVE: Definir qué acepta el componente
interface AddMemberDialogProps {
  children: ReactNode;
  onMemberAdded?: () => Promise<void>;
}

export const AddMemberDialog = ({ children, onMemberAdded }: AddMemberDialogProps) => {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { nestId } = useNestStore();
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Lógica de invitación o vinculación
      const { error } = await supabase
        .from('profiles')
        .update({ nest_id: nestId })
        .eq('email', email);

      if (error) throw error;

      toast({
        title: "Tribu Actualizada",
        description: `Se ha enviado la señal de sincronía a ${email}`,
      });

      if (onMemberAdded) await onMemberAdded();
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo vincular al miembro. Verifica el email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] border-none bg-white/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter text-slate-900">
            Integrar a la Tribu
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-6 mt-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Email del Guía o Peque
            </p>
            <Input
              type="email"
              placeholder="ejemplo@kidus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-sky-500"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black hover:bg-sky-600 transition-all uppercase tracking-widest italic"
          >
            {loading ? "Sincronizando..." : "Enviar Invitación"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
