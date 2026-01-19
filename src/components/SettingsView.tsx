import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, LogOut, Copy, CheckCircle2, 
  Trash2, Hash, Edit2, Save, X, ArrowRight, Loader2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/utils/haptics"; // Centralizado para evitar errores de build

const AVATAR_COLORS = ["#0EA5E9", "#F97316", "#8B5CF6", "#10B981", "#EC4899", "#64748B"];

export const SettingsView = ({ nestId, members, onRefresh, onClose }: { nestId: string | null, members: any[], onRefresh: () => void, onClose?: () => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '', role: '' });
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [nestCode, setNestCode] = useState<string>(""); // Estado para el código KID- real
  const { toast } = useToast();

  // Recuperar el código amigable (KID-XXXXX) del nido
  useState(() => {
    const fetchNestCode = async () => {
      if (!nestId) return;
      const { data } = await supabase.from('nests').select('nest_code').eq('id', nestId).single();
      if (data) setNestCode(data.nest_code);
    };
    fetchNestCode();
  });

  const handleCopyCode = () => {
    if (!nestCode) return;
    navigator.clipboard.writeText(nestCode);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinNest = async () => {
    const cleanInput = joinCode.trim().toUpperCase();
    if (!cleanInput.startsWith("KID-") || cleanInput.length < 9) {
      toast({ title: "Código inválido", description: "Debe ser estilo KID-XXXXX", variant: "destructive" });
      return;
    }
    
    setIsJoining(true);
    try {
      // 1. Buscamos el nido por su código amigable
      const { data: targetNest, error: nestError } = await supabase
        .from('nests')
        .select('id')
        .eq('nest_code', cleanInput)
        .single();

      if (nestError || !targetNest) {
        toast({ title: "Nido no encontrado", description: "Verifica el código con tu Guía.", variant: "destructive" });
        return;
      }

      // 2. Vinculamos al usuario actual a ese nido
      const { data: { user } } = await supabase.auth.getUser();
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ nest_id: targetNest.id })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      triggerHaptic('success');
      toast({ title: "¡Sincronía total!", description: "Te has unido al nuevo Nido." });
      setJoinCode("");
      onRefresh();
    } catch (error) {
      toast({ title: "Error de conexión", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase.from('profiles').update({
        display_name: editForm.name,
        avatar_url: editForm.color,
        role: editForm.role
      }).eq('id', id);

      if (error) throw error;
      triggerHaptic('success');
      setEditingId(null);
      onRefresh();
      toast({ title: "Perfil actualizado" });
    } catch (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  return (
    <div className="relative space-y-12 pb-44 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      <header className="px-8 pt-4">
        <div className="flex items-center gap-3 mb-2">
            <Sparkles size={16} className="text-sky-500" />
            <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.5em]">Configuración</p>
        </div>
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Radar</h2>
      </header>

      {/* CARD TOKEN: KID-XXXXX (Glassmorphism Élite) */}
      <div className="mx-6 p-12 rounded-[4rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-sky-500/20 rounded-full blur-[80px] group-hover:bg-sky-500/40 transition-all duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10 opacity-60">
            <Hash size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Tu Código de Nido</span>
          </div>
          <div className="flex items-center justify-between mb-10">
            <span className="text-5xl font-black tracking-tighter">{nestCode || "Cargando..."}</span>
            <button 
                onClick={handleCopyCode} 
                className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all border ${copied ? 'bg-green-500 border-green-400' : 'bg-white/10 border-white/20 active:scale-90'}`}
            >
              {copied ? <CheckCircle2 size={28} /> : <Copy size={28} />}
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
            Comparte para sincronizar<br/>calendarios y tribu.
          </p>
        </div>
      </div>

      {/* SECCIÓN VINCULAR */}
      <div className="mx-6 p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block text-center">Unirse a otro Nido</span>
        <div className="flex gap-3">
          <input 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="KID-XXXXX"
            className="flex-1 h-20 px-8 rounded-[2rem] bg-slate-50 border-none font-black text-slate-800 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-sky-500/5 transition-all text-xl"
          />
          <button 
            onClick={handleJoinNest}
            disabled={isJoining}
            className="w-20 h-20 bg-sky-500 text-white rounded-[2rem] flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-sky-100"
          >
            {isJoining ? <Loader2 className="animate-spin" /> : <ArrowRight size={28} strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* LISTADO DE LA TRIBU */}
      <div className="mx-6 space-y-6">
        <div className="flex items-center justify-between px-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrantes</h3>
            <Users size={14} className="text-slate-300" />
        </div>

        {members.map((member) => (
          <div key={member.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-50 shadow-sm transition-all hover:shadow-md">
            {editingId === member.id ? (
              <div className="space-y-6">
                <input 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full h-16 bg-slate-50 rounded-[1.5rem] px-6 font-black text-slate-900 border-none outline-none focus:ring-4 focus:ring-sky-500/10"
                />
                <div className="flex justify-around py-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => { triggerHaptic('soft'); setEditForm({...editForm, color}); }}
                      className={`w-10 h-10 rounded-2xl transition-all ${editForm.color === color ? 'ring-4 ring-sky-100 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => saveEdit(member.id)} className="flex-1 h-16 bg-slate-900 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-white shadow-xl hover:bg-sky-500 transition-colors">
                    <Save size={18} className="mr-2" /> Guardar Cambios
                  </Button>
                  <button onClick={() => setEditingId(null)} className="w-16 h-16 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2.2rem] flex items-center justify-center text-white font-black text-3xl shadow-inner overflow-hidden" style={{ backgroundColor: member.avatar_url || '#0EA5E9' }}>
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xl tracking-tight">{member.display_name}</h4>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] mt-1">
                      {member.role === 'autonomous' ? 'Guía Principal' : 'Tribu'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { triggerHaptic('soft'); setEditingId(member.id); setEditForm({name: member.display_name, color: member.avatar_url, role: member.role}); }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-300 hover:text-sky-500 hover:bg-sky-50 transition-all">
                    <Edit2 size={22} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ACCIONES FINALES */}
      <div className="px-12 space-y-6 pt-10">
        <Button 
          variant="ghost" 
          onClick={() => { triggerHaptic('warning'); supabase.auth.signOut(); }} 
          className="w-full h-20 rounded-[2.5rem] font-black text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all uppercase tracking-widest text-[11px]"
        >
          <LogOut size={18} className="mr-3" /> Desconectar Nido
        </Button>
      </div>
    </div>
  );
};
