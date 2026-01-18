import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, Sparkles, Bell, LogOut, Copy, CheckCircle2, 
  Settings as SettingsIcon, ShieldCheck, Palette 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';

// Función de vibración centralizada
const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    const patterns = { soft: 10, success: [20, 30, 20], warning: [40, 100, 40] };
    navigator.vibrate(patterns[type]);
  }
};

export const SettingsView = ({ nestId, members }: { nestId: string | null, members: any[] }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!nestId) return;
    navigator.clipboard.writeText(nestId);
    setCopied(true);
    triggerHaptic('success');
    toast({ title: "Código Copiado", description: "Ya puedes sincronizar a otro guía." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignOut = async () => {
    triggerHaptic('warning');
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER DE GESTIÓN */}
      <div className="px-6">
        <h2 className="text-5xl font-black text-slate-800 tracking-tight">Nido</h2>
        <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] mt-1">Gestión de la Tribu</p>
      </div>

      {/* TARJETA 1: CÓDIGO DE SINCRONIZACIÓN */}
      <div className="mx-6 p-8 rounded-[3.5rem] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-tribu-card">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Users size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Sincronización</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID Único del Nido</p>
          </div>
        </div>
        
        <div 
          onClick={handleCopyCode}
          className="group relative bg-slate-100/50 rounded-[2.5rem] p-8 flex flex-col items-center gap-3 border border-slate-50 shadow-inner cursor-pointer active:scale-95 transition-all"
        >
          <span className="text-3xl font-black text-slate-700 tracking-[0.4em] font-mono">
            {nestId?.slice(0, 6).toUpperCase() || "------"}
          </span>
          <div className="flex items-center gap-2">
            {copied ? <CheckCircle2 size={14} className="text-mint" /> : <Copy size={14} className="text-primary opacity-40" />}
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {copied ? "¡Sincronizado!" : "Tocar para copiar"}
            </span>
          </div>
        </div>
      </div>

      {/* TARJETA 2: MIEMBROS DE LA TRIBU */}
      <div className="mx-6 p-8 rounded-[3.5rem] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-tribu-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-mint/10 rounded-2xl flex items-center justify-center text-mint">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-800">La Tribu</h3>
        </div>
        
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border border-white/40">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-xl shadow-sm border-2 border-white" 
                  style={{ backgroundColor: member.avatar_url || '#0EA5E9' }}
                />
                <span className="text-sm font-black text-slate-700">{member.display_name}</span>
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                {member.role === 'autonomous' ? 'Guía' : 'Peque'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TARJETA 3: PREFERENCIAS Y SALIDA */}
      <div className="mx-6 p-8 rounded-[3.5rem] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-tribu-card space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Avisos</span>
          </div>
          <Switch defaultChecked onCheckedChange={() => triggerHaptic('soft')} />
        </div>

        <Button 
          variant="ghost"
          onClick={handleSignOut}
          className="w-full h-16 rounded-3xl font-black text-slate-400 hover:text-secondary hover:bg-secondary/5 transition-all flex items-center gap-3 border-2 border-dashed border-slate-100"
        >
          <LogOut size={18} />
          CERRAR SESIÓN
        </Button>
      </div>
    </div>
  );
};
