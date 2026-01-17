import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ShieldCheck, HeartHandshake, Fingerprint } from "lucide-react";

const TEAM_COLORS = [
  { name: 'Zen Blue', bg: 'bg-[#8ECAE6]', text: 'text-[#219EBC]' },
  { name: 'Soft Mint', bg: 'bg-[#B7E4C7]', text: 'text-[#2D6A4F]' },
  { name: 'Warm Sand', bg: 'bg-[#FFB703]', text: 'text-[#FB8500]' },
  { name: 'Petal', bg: 'bg-[#FFC8DD]', text: 'text-[#FF006E]' },
  { name: 'Cloud', bg: 'bg-[#E2E2E2]', text: 'text-[#4A4A4A]' },
];

export const AddMemberDialog = ({ children, onMemberAdded }: { children: React.ReactNode, onMemberAdded: () => void }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("dependent");
  const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: myProfile } = await supabase.from('profiles').select('nest_id').eq('id', user?.id).single();

      const { error } = await supabase.from('profiles').insert({
        display_name: name,
        nest_id: myProfile?.nest_id,
        role: role,
        avatar_url: selectedColor.bg,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({ title: "Armonía actualizada", description: `${name} se ha unido al nido.` });
      setName("");
      onMemberAdded();
    } catch (error: any) {
      console.error("Error:", error);
      toast({ title: "Ajuste necesario", description: "No pudimos integrar al miembro. Revisa la conexión.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md border-none bg-white/70 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[3.5rem] p-8 transition-all duration-700">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-[2.2rem] ${selectedColor.bg} shadow-2xl flex items-center justify-center text-white text-3xl font-black transition-all duration-500 hover:rotate-6`}>
              {name ? name.charAt(0).toUpperCase() : <Fingerprint size={32} />}
            </div>
          </div>
          <div className="text-center">
            <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Vínculo</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs font-medium uppercase tracking-[0.3em] mt-1">
              Flujo y Autonomía
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          <div className="space-y-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre o Alias..."
              className="h-14 rounded-3xl border-none bg-white/50 backdrop-blur-md shadow-inner px-6 font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-100 transition-all text-center"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('autonomous')}
              className={`group flex flex-col items-center p-5 rounded-[2.5rem] transition-all duration-500 ${
                role === 'autonomous' ? "bg-white shadow-xl scale-105" : "bg-transparent opacity-40 hover:opacity-60"
              }`}
            >
              <ShieldCheck className={role === 'autonomous' ? "text-blue-400" : "text-slate-400"} size={24} />
              <span className="text-[9px] font-black mt-2 uppercase tracking-tighter">Autónomo</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('dependent')}
              className={`group flex flex-col items-center p-5 rounded-[2.5rem] transition-all duration-500 ${
                role === 'dependent' ? "bg-white shadow-xl scale-105" : "bg-transparent opacity-40 hover:opacity-60"
              }`}
            >
              <HeartHandshake className={role === 'dependent' ? "text-orange-300" : "text-slate-400"} size={24} />
              <span className="text-[9px] font-black mt-2 uppercase tracking-tighter">Dependiente</span>
            </button>
          </div>

          <div className="flex justify-center gap-3">
            {TEAM_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full ${color.bg} transition-all duration-300 ${
                  selectedColor.name === color.name ? "scale-125 ring-[6px] ring-white shadow-lg" : "scale-100 opacity-30 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className={`w-full h-16 rounded-[2.2rem] ${selectedColor.bg} text-white font-black text-sm tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-all active:scale-95`}
          >
            {loading ? <Sparkles className="animate-spin" /> : "INTEGRAR AL EQUIPO"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
