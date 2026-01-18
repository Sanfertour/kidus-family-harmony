import { useState } from 'react';
import { 
  Users, Bell, LogOut, Copy, CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";

// ⚡ Haptic Engine: El pulso del Nido
const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    const patterns = { soft: 10, success: [20, 30, 20], warning: [40, 100, 40] };
    navigator.vibrate(patterns[type]);
  }
};

export const SettingsView = ({ nestId, members }: { nestId: string | null, members: any[] }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!nestId) return;
    navigator.clipboard.writeText(nestId);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
      
      {/* IDENTIDAD: EL NIDO */}
      <div className="px-6">
        <h2 className="text-5xl font-black text-slate-800 tracking-tight font-nunito">El Nido</h2>
        <p className="text-[11px] font-black text-[#0EA5E9] uppercase tracking-[0.4em] mt-1">
          Sincronización de la Tribu
        </p>
      </div>

      {/* GESTIÓN DE LA TRIBU */}
      <div className="mx-6 p-8 rounded-[3.5rem] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#F97316]/10 rounded-2xl flex items-center justify-center text-[#F97316]">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-black text-slate-800">Miembros de la Tribu</h3>
        </div>
        
        <div className="space-y-4">
          {members.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-5 bg-slate-50/50 rounded-[2.5rem] border border-white/40"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl shadow-sm border-2 border-white" 
                  style={{ backgroundColor: member.avatar_url || '#0EA5E9' }}
                />
                <span className="text-base font-black text-slate-700">{member.display_name}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {member.role === 'autonomous' ? 'Guía de la Tribu' : 'Tribu'} 
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTÓN DE DESCONEXIÓN */}
      <div className="px-6">
        <Button 
          variant="ghost"
          onClick={() => triggerHaptic('warning')}
          className="w-full h-16 rounded-[2.5rem] font-black text-slate-400 hover:text-[#F97316] transition-all duration-400 border-2 border-dashed border-slate-100"
        >
          <LogOut size={18} className="mr-2" />
          SALIR DEL NIDO
        </Button>
      </div>
    </div>
  );
};
