import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, LogOut, Copy, CheckCircle2, 
  Trash2, Hash, Edit2, Save, X, Share2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

const AVATAR_COLORS = ["#0EA5E9", "#F97316", "#8B5CF6", "#10B981", "#EC4899", "#64748B"];

const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    const patterns = { soft: 10, success: [20, 30, 20], warning: [40, 100, 40] };
    navigator.vibrate(patterns[type as keyof typeof patterns]);
  }
};

export const SettingsView = ({ nestId, members, onRefresh }: { nestId: string | null, members: any[], onRefresh: () => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '', role: '' });
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  // Corregido: Si no hay nestId, mostramos un placeholder limpio
  const displayToken = nestId ? `KID-${nestId.substring(0, 4).toUpperCase()}` : "KID-NEW";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayToken);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinNest = async () => {
    // Limpiamos el código por si el usuario escribe "KID-" manualmente
    const cleanInput = joinCode.replace("KID-", "").trim();
    
    if (cleanInput.length < 4) {
      toast({ title: "Código incompleto", variant: "destructive" });
      return;
    }
    
    setIsJoining(true);
    try {
      triggerHaptic('success');
      const { data: partnerProfile } = await supabase
        .from('profiles')
        .select('nest_id')
        .ilike('nest_id', `${cleanInput}%`)
        .limit(1)
        .maybeSingle();

      if (!partnerProfile) {
        toast({ title: "Nido no encontrado", variant: "destructive" });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ nest_id: partnerProfile.nest_id }).eq('id', user?.id);

      toast({ title: "Sincronía del Nido Éxitosa" });
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
      toast({ title: "Tribu actualizada" });
    } catch (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    }
  };

  const deleteMember = async (id: string, name: string) => {
    if (confirm(`¿Eliminar a ${name} de la tribu?`)) {
      triggerHaptic('warning');
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        
        // Importante: Llamamos a onRefresh para actualizar el estado global del Index
        onRefresh(); 
        toast({ title: "Miembro fuera de la tribu" });
      } catch (error) {
        toast({ title: "Error al eliminar", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-10 pb-44 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="px-6">
        <h2 className="text-5xl font-black text-slate-800 tracking-tighter font-nunito">Radar</h2>
        <p className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.4em] mt-1">Gestión de la Tribu</p>
      </div>

      {/* TOKEN CARD - CORREGIDO */}
      <div className="mx-6 p-10 rounded-[3.5rem] bg-[#0EA5E9] text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 opacity-80">
            <Hash size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronía del Nido</span>
          </div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-4xl font-black tracking-widest">{displayToken}</span>
            <button onClick={handleCopyCode} className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center active:scale-90 transition-all">
              {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
            </button>
          </div>
          <p className="text-[11px] font-bold opacity-70">Usa este código para conectar con otro Guía.</p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* VINCULAR NIDO */}
      <div className="mx-6 p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center">Vincular Nido Existente</label>
        <div className="flex gap-2">
          <input 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="KID-XXXX"
            className="flex-1 h-16 px-6 rounded-[1.8rem] bg-slate-50 border-none font-black text-slate-700 outline-none focus:ring-2 focus:ring-[#0EA5E9] transition-all"
          />
          <button 
            onClick={handleJoinNest}
            disabled={isJoining}
            className="w-16 h-16 bg-slate-800 text-white rounded-[1.8rem] flex items-center justify-center active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      {/* MIEMBROS - CAMBIO DE "EQUIPO" A "TRIBU" */}
      <div className="mx-6 space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Equipo en calma</h3>

        {members.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-200/20">
            {editingId === member.id ? (
              <div className="space-y-5">
                <input 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-black text-slate-800 border-none outline-none focus:ring-2 focus:ring-[#0EA5E9]"
                />
                <div className="flex justify-between gap-2 p-1 bg-slate-100 rounded-[1.5rem]">
                  {[ {l: 'Guía', v: 'autonomous'}, {l: 'Tribu', v: 'dependent'} ].map(role => (
                    <button
                      key={role.v}
                      onClick={() => setEditForm({...editForm, role: role.v})}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${
                        editForm.role === role.v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {role.l}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => saveEdit(member.id)} className="flex-1 h-14 bg-[#0EA5E9] rounded-2xl font-black uppercase text-[10px] tracking-widest text-white">
                    <Save size={18} className="mr-2" /> Guardar
                  </Button>
                  <button onClick={() => setEditingId(null)} className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[2.2rem] flex items-center justify-center text-white font-black text-2xl shadow-lg" style={{ backgroundColor: member.avatar_url || '#0EA5E9' }}>
                    {member.display_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg leading-tight">{member.display_name}</h4>
                    <p className="text-[9px] font-black text-[#F97316] uppercase tracking-[0.2em] mt-1">
                      {member.role === 'autonomous' ? 'Guía' : 'Tribu'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditing(member)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-300 active:scale-95 transition-all">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => deleteMember(member.id, member.display_name)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-200 hover:text-red-500 active:scale-95 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-10">
        <Button 
          variant="ghost" 
          onClick={() => { triggerHaptic('warning'); supabase.auth.signOut(); }} 
          className="w-full h-16 rounded-[2.5rem] font-black text-slate-300 hover:text-[#F97316] border-2 border-dashed border-slate-100"
        >
          <LogOut size={18} className="mr-2" /> SALIR DEL NIDO
        </Button>
      </div>
    </div>
  );
};
