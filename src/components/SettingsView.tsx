import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { 
  Users, LogOut, Copy, CheckCircle2, 
  Edit2, Save, X, ArrowRight, Loader2, Sparkles, Smartphone, Trash2, Shield, Baby
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/utils/haptics";

const AVATAR_COLORS = ["#0EA5E9", "#F43F5E", "#8B5CF6", "#10B981", "#F59E0B", "#64748B"];

export const SettingsView = ({ nestId, members, onRefresh }: { nestId: string | null, members: any[], onRefresh: () => void }) => {
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [nestCode, setNestCode] = useState<string>(""); 
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNestCode = async () => {
      if (!nestId) return;
      const { data } = await supabase.from('nests').select('nest_code').eq('id', nestId).maybeSingle();
      if (data) setNestCode(data.nest_code);
    };
    fetchNestCode();
  }, [nestId]);

  const handleUpdate = async () => {
    if (!editingMember.display_name) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: editingMember.display_name,
          role: editingMember.role,
          avatar_url: editingMember.avatar_url 
        })
        .eq('id', editingMember.id);

      if (error) throw error;
      triggerHaptic('success');
      toast({ title: "Perfil Actualizado", description: "Sincronía completada." });
      setEditingMember(null);
      onRefresh();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este miembro del Nido?")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      triggerHaptic('warning');
      onRefresh();
      setEditingMember(null);
    } catch (e: any) { toast({ title: "Error", description: "No puedes eliminar este perfil." }); }
  };

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-slate-50/50">
      <header className="px-8 pt-16 pb-8">
        <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-sky-500 rounded-lg shadow-lg shadow-sky-200">
                <Shield size={14} className="text-white" />
            </div>
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.4em]">Configuración Élite</p>
        </div>
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic">Radar</h2>
      </header>

      <div className="px-6 space-y-8">
        {/* CARD TOKEN */}
        <section className="p-8 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-sky-500/20 rounded-full blur-3xl group-hover:bg-sky-500/30 transition-all duration-700" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Código del Nido</p>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-black tracking-[0.2em] font-mono text-sky-400">{nestCode || "KID-..."}</span>
            <button onClick={() => { navigator.clipboard.writeText(nestCode); setCopied(true); triggerHaptic('success'); setTimeout(() => setCopied(false), 2000); }} 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${copied ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'}`}>
              {copied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
            </button>
          </div>
        </section>

        {/* LISTADO DE MIEMBROS */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Miembros Activos</p>
          {members.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white font-black text-2xl shadow-inner relative"
                     style={{ backgroundColor: member.avatar_url || '#64748B' }}>
                  {member.display_name?.charAt(0).toUpperCase()}
                  <div className={`absolute -right-1 -bottom-1 p-1.5 rounded-lg border-2 border-white shadow-sm ${member.role === 'autonomous' ? 'bg-sky-500' : 'bg-orange-500'}`}>
                    {member.role === 'autonomous' ? <Shield size={10} className="text-white" /> : <Baby size={10} className="text-white" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl tracking-tight">{member.display_name || "Sin nombre"}</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {member.role === 'autonomous' ? 'Guía del Nido' : 'Tribu / Dependiente'}
                  </p>
                </div>
              </div>
              <button onClick={() => { triggerHaptic('soft'); setEditingMember({...member}); }} 
                      className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-all">
                <Edit2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <Button variant="ghost" onClick={() => supabase.auth.signOut()} className="w-full h-16 rounded-[2rem] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest text-[10px] gap-2">
          <LogOut size={16} /> Cerrar Sesión
        </Button>
      </div>

      {/* MODAL DE EDICIÓN */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="rounded-[3.5rem] border-none bg-white p-8 max-w-[400px]">
          <DialogHeader><DialogTitle className="text-3xl font-black italic">Editar Perfil</DialogTitle></DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-xl"
                     style={{ backgroundColor: editingMember?.avatar_url }}>
                    {editingMember?.display_name?.charAt(0)}
                </div>
            </div>
            
            <Input value={editingMember?.display_name || ''} 
                   onChange={e => setEditingMember({...editingMember, display_name: e.target.value})}
                   className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-center text-lg" placeholder="Nombre" />

            <div className="grid grid-cols-6 gap-2">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setEditingMember({...editingMember, avatar_url: c})}
                        className={`h-10 rounded-xl transition-all ${editingMember?.avatar_url === c ? 'ring-4 ring-sky-200 scale-110' : ''}`}
                        style={{ backgroundColor: c }} />
              ))}
            </div>

            <div className="flex gap-2">
                <Button onClick={() => setEditingMember({...editingMember, role: 'autonomous'})} 
                        className={`flex-1 h-12 rounded-xl font-black text-[10px] ${editingMember?.role === 'autonomous' ? 'bg-sky-500' : 'bg-slate-100 text-slate-400'}`}>GUÍA</Button>
                <Button onClick={() => setEditingMember({...editingMember, role: 'dependent'})} 
                        className={`flex-1 h-12 rounded-xl font-black text-[10px] ${editingMember?.role === 'dependent' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>TRIBU</Button>
            </div>

            <div className="flex flex-col gap-2">
                <Button onClick={handleUpdate} disabled={loading} className="h-16 rounded-2xl bg-slate-900 font-black tracking-widest">
                    {loading ? <Loader2 className="animate-spin" /> : "GUARDAR CAMBIOS"}
                </Button>
                <Button variant="ghost" onClick={() => handleDelete(editingMember.id)} className="text-red-400 font-black text-[10px] tracking-widest uppercase">
                    <Trash2 size={14} className="mr-2" /> Eliminar Permanente
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
