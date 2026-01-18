import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, LogOut, Copy, CheckCircle2, 
  Trash2, Hash, Edit2, Save, X, Share2, ArrowRight, Loader2
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

export const SettingsView = ({ nestId, members, onRefresh, onClose }: { nestId: string | null, members: any[], onRefresh: () => void, onClose?: () => void }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', color: '', role: '' });
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  // Código KID- único basado en el nestId real
  const displayToken = nestId ? `KID-${nestId.split('-')[0].substring(0, 5).toUpperCase()}` : "KID-NEW";

  const startEditing = (member: any) => {
    triggerHaptic('soft');
    setEditForm({
      name: member.display_name || '',
      color: member.avatar_url || '#0EA5E9',
      role: member.role || 'dependent'
    });
    setEditingId(member.id);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayToken);
    setCopied(true);
    triggerHaptic('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinNest = async () => {
    const cleanInput = joinCode.replace("KID-", "").trim().toUpperCase();
    if (cleanInput.length < 4) {
      toast({ title: "Código incompleto", variant: "destructive" });
      return;
    }
    
    setIsJoining(true);
    try {
      // Búsqueda del Nido del otro usuario
      const { data: partnerProfiles } = await supabase
        .from('profiles')
        .select('nest_id')
        .ilike('nest_id', `${cleanInput}%`)
        .limit(1);

      if (!partnerProfiles || partnerProfiles.length === 0) {
        toast({ title: "Nido no encontrado", variant: "destructive" });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ nest_id: partnerProfiles[0].nest_id }).eq('id', user?.id);

      triggerHaptic('success');
      toast({ title: "Sincronía del Nido Exitosa" });
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
        onRefresh(); 
        toast({ title: "Miembro eliminado" });
      } catch (error) {
        toast({ title: "Error al eliminar", variant: "destructive" });
      }
    }
  };

  return (
    <div className="relative space-y-10 pb-44 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* BOTÓN DE CIERRE SUPERIOR (X) */}
      <div className="absolute right-6 top-0">
        <button 
          onClick={() => { triggerHaptic('soft'); onClose?.(); }}
          className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all active:scale-90"
        >
          <X size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="px-6">
        <h2 className="text-5xl font-black text-slate-800 tracking-tighter font-nunito">Radar</h2>
        <p className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.4em] mt-1">Gestión de la Tribu</p>
      </div>

      {/* CARD TOKEN: KID-XXXXX */}
      <div className="mx-6 p-10 rounded-[3.5rem] bg-[#0EA5E9] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 opacity-80">
            <Hash size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Código de Sincronía</span>
          </div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-4xl font-black tracking-widest">{displayToken}</span>
            <button onClick={handleCopyCode} className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-white/20">
              {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
            </button>
          </div>
          <p className="text-[11px] font-bold opacity-70">Usa este código único para emparejar tu Nido.</p>
        </div>
      </div>

      {/* INPUT VINCULAR */}
      <div className="mx-6 p-8 rounded-[3.5rem] bg-white border border-slate-100 shadow-sm">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block text-center">Unirse a un Nido</label>
        <div className="flex gap-2">
          <input 
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="KID-XXXX"
            className="flex-1 h-16 px-6 rounded-[1.8rem] bg-slate-50 border-none font-black text-slate-700 outline-none focus:ring-4 focus:ring-sky-100 transition-all"
          />
          <button 
            onClick={handleJoinNest}
            disabled={isJoining}
            className="w-16 h-16 bg-slate-800 text-white rounded-[1.8rem] flex items-center justify-center active:scale-95 transition-all shadow-lg"
          >
            {isJoining ? <Loader2 className="animate-spin" /> : <ArrowRight size={24} />}
          </button>
        </div>
      </div>

      {/* LISTADO DE LA TRIBU (EDICIÓN Y AVATARES MANTENIDOS) */}
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
                
                {/* CONFIGURACIÓN DE AVATARES MANTENIDA */}
                <div className="flex justify-between px-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => { triggerHaptic('soft'); setEditForm({...editForm, color}); }}
                      className={`w-8 h-8 rounded-full transition-all ${editForm.color === color ? 'ring-4 ring-slate-200 scale-125' : 'scale-100 opacity-60'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={() => saveEdit(member.id)} className="flex-1 h-14 bg-[#0EA5E9] rounded-2xl font-black uppercase text-[10px] tracking-widest text-white hover:bg-[#0EA5E9]/90 shadow-lg">
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
                  <button onClick={() => startEditing(member)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-300 hover:text-sky-500 transition-all">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => deleteMember(member.id, member.display_name)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-200 hover:text-red-500 transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ACCIONES FINALES: SALIR Y CERRAR SESIÓN MANTENIDAS */}
      <div className="px-10 space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => { triggerHaptic('soft'); onClose?.(); }} 
          className="w-full h-16 rounded-[2.5rem] font-black text-slate-400 uppercase tracking-widest text-[10px]"
        >
          Volver al Nido
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => { triggerHaptic('warning'); supabase.auth.signOut(); }} 
          className="w-full h-16 rounded-[2.5rem] font-black text-slate-300 hover:text-[#F97316] border-2 border-dashed border-slate-100"
        >
          <LogOut size={18} className="mr-2" /> CERRAR SESIÓN
        </Button>
      </div>
    </div>
  );
};
