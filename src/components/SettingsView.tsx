import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { 
  Users, LogOut, Copy, CheckCircle2, 
  Hash, Edit2, Save, X, ArrowRight, Loader2, Sparkles, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/utils/haptics";

const AVATAR_COLORS = ["#0EA5E9", "#F97316", "#8B5CF6", "#10B981", "#EC4899", "#64748B"];

export const SettingsView = ({ nestId, members, onRefresh, onClose }: { nestId: string | null, members: any[], onRefresh: () => void, onClose?: () => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '', role: '' });
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [nestCode, setNestCode] = useState<string>(""); 
  const { toast } = useToast();

  useEffect(() => {
    const fetchNestCode = async () => {
      if (!nestId) return;
      const { data } = await supabase.from('nests').select('share_code').eq('id', nestId).maybeSingle();
      if (data) setNestCode(data.share_code);
    };
    fetchNestCode();
  }, [nestId]);

  const handleCopyCode = () => {
    if (!nestCode) return;
    navigator.clipboard.writeText(nestCode);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* Header Fijo Mobile */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-slate-50/80 backdrop-blur-lg z-20">
        <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-sky-500" />
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em]">Panel de Control</p>
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Radar</h2>
      </header>

      <div className="px-6 space-y-8">
        
        {/* CARD TOKEN: Optimizada para Touch */}
        <section className="relative overflow-hidden p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-sky-500/30 rounded-full blur-[60px]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 opacity-50">
              <Smartphone size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest">ID del Nido</span>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-4xl font-black tracking-tighter font-mono">
                {nestCode || "•••"}
              </span>
              <button 
                onClick={handleCopyCode} 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${copied ? 'bg-green-500 border-transparent' : 'bg-white/10 border-white/20 active:scale-90'}`}
              >
                {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
              </button>
            </div>
          </div>
        </section>

        {/* INPUT UNIRSE: Altura táctil 80px (Apple Standard) */}
        <section className="p-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-brisa flex gap-2">
          <input 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="KID-XXXXX"
            className="flex-1 h-16 px-6 rounded-[2rem] bg-transparent font-black text-slate-800 placeholder:text-slate-300 outline-none text-lg"
          />
          <button 
            onClick={() => {/* lógica unirse */}}
            className="w-16 h-16 bg-sky-500 text-white rounded-[1.8rem] flex items-center justify-center active:scale-90 shadow-lg shadow-sky-200"
          >
            <ArrowRight size={24} strokeWidth={3} />
          </button>
        </section>

        {/* LISTADO DE LA TRIBU: Cards más compactas pero con aire */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tribu Actual</h3>
              <Users size={14} className="text-slate-300" />
          </div>

          {members.map((member) => (
            <div key={member.id} className="bg-white/60 backdrop-blur-sm p-5 rounded-[2.5rem] border border-white shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-inner"
                  style={{ backgroundColor: member.avatar_url || '#0EA5E9' }}
                >
                  {member.display_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{member.display_name}</h4>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">
                    {member.role === 'autonomous' ? 'Guía' : 'Tribu'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { triggerHaptic('soft'); setEditingId(member.id); }}
                className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 active:bg-sky-50 active:text-sky-500 transition-all"
              >
                <Edit2 size={18} />
              </button>
            </div>
          ))}
        </section>

        {/* BOTÓN CERRAR SESIÓN: Destacado pero elegante */}
        <div className="pt-6">
          <Button 
            variant="ghost" 
            onClick={() => supabase.auth.signOut()} 
            className="w-full h-16 rounded-[2rem] font-black text-slate-400 hover:text-red-500 active:bg-red-50 transition-all uppercase tracking-widest text-[10px] gap-2"
          >
            <LogOut size={16} /> Cerrar Sesión
          </Button>
        </div>

      </div>
    </div>
  );
};
