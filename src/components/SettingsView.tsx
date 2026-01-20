import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";
import { 
  LogOut, Copy, CheckCircle2, 
  Edit2, Loader2, Shield, Baby, Trash2, Settings2, Bell, BellOff, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch'; // Asegúrate de tener este componente de shadcn
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/utils/haptics";

const AVATAR_COLORS = ["#0EA5E9", "#F43F5E", "#8B5CF6", "#10B981", "#F59E0B", "#64748B"];

export const SettingsView = ({ nestId, members, onRefresh }: { nestId: string | null, members: any[], onRefresh: () => void }) => {
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [nestCode, setNestCode] = useState<string>(""); 
  const [copied, setCopied] = useState(false);
  
  // Estados para Preferencias (Paz Mental)
  const [notifications, setNotifications] = useState({
    newEvents: true,
    conflicts: true,
    tribuUpdates: false
  });

  const { toast } = useToast();
  const { signOut } = useNestStore();

  useEffect(() => {
    const fetchNestCode = async () => {
      if (!nestId) return;
      const { data } = await supabase.from('nests').select('nest_code').eq('id', nestId).maybeSingle();
      if (data) setNestCode(data.nest_code);
    };
    fetchNestCode();
  }, [nestId]);

  const handleSignOut = async () => {
    triggerHaptic('medium');
    await signOut();
    toast({ title: "Sesión cerrada", description: "Vuelve pronto a tu nido." });
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    triggerHaptic('soft');
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdate = async () => {
    if (!editingMember || !editingMember.display_name) return;
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
    if (!window.confirm("¿Eliminar este miembro de la Tribu?")) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      triggerHaptic('warning');
      onRefresh();
      setEditingMember(null);
    } catch (e: any) { toast({ title: "Error", description: "Acción no permitida." }); }
  };

  return (
    <div className="flex flex-col h-full w-full pb-32 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <header className="px-6 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-3">
            <div className="p-2.5 bg-sky-500/10 rounded-[1rem] border border-sky-100">
                <Settings2 size={16} className="text-sky-600" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600">Gestión del Nido</p>
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Ajustes</h2>
      </header>

      <div className="px-6 space-y-10">
        
        {/* SECCIÓN 1: CÓDIGO DEL NIDO */}
        <section className="p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute right-[-5%] top-[-5%] w-48 h-48 bg-sky-500/20 rounded-full blur-[60px]" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-5">Acceso Familiar</p>
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-3xl font-black tracking-[0.15em] font-mono text-sky-400">{nestCode || "KID-..."}</span>
              <p className="text-[9px] text-slate-400 font-bold italic">Invita a otro Guía a la Tribu</p>
            </div>
            <button onClick={() => { 
                navigator.clipboard.writeText(nestCode); 
                setCopied(true); 
                triggerHaptic('success'); 
                setTimeout(() => setCopied(false), 2000); 
              }} 
              className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${copied ? 'bg-emerald-500 scale-90' : 'bg-white/10 hover:bg-white/20'}`}>
              {copied ? <CheckCircle2 size={24} /> : <Copy size={22} />}
            </button>
          </div>
        </section>

        {/* SECCIÓN 2: PREFERENCIAS DE NOTIFICACIONES (NUEVO) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Bell size={14} className="text-slate-400" />
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Paz Mental</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">Nuevos Eventos</p>
                <p className="text-[10px] text-slate-400 font-medium">Avisar cuando un Guía crea algo</p>
              </div>
              <Switch checked={notifications.newEvents} onCheckedChange={() => toggleNotif('newEvents')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">Alerta Naranja</p>
                <p className="text-[10px] text-slate-400 font-medium">Notificar conflictos de horario</p>
              </div>
              <Switch checked={notifications.conflicts} onCheckedChange={() => toggleNotif('conflicts')} />
            </div>
            <div className="flex items-center justify-between opacity-50">
              <div>
                <p className="font-bold text-slate-800 text-sm italic">Resumen Semanal</p>
                <p className="text-[10px] text-slate-400 font-medium">Próximamente</p>
              </div>
              <div className="px-2 py-1 bg-slate-100 rounded-md text-[8px] font-black">AI</div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: MIEMBROS */}
        <section className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">Nuestra Tribu</p>
          {members.map((member) => (
            <div key={member.id} className="bg-white/70 backdrop-blur-md border border-white p-5 rounded-[2.5rem] flex items-center justify-between shadow-sm transition-all active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white font-black text-xl shadow-lg relative"
                     style={{ backgroundColor: member.avatar_url || '#64748B' }}>
                  {member.display_name?.charAt(0).toUpperCase()}
                  <div className={`absolute -right-1 -bottom-1 p-1.5 rounded-xl border-4 border-white shadow-md ${member.role === 'autonomous' ? 'bg-sky-500' : 'bg-orange-500'}`}>
                    {member.role === 'autonomous' ? <Shield size={10} className="text-white" /> : <Baby size={10} className="text-white" />}
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1">{member.display_name}</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {member.role === 'autonomous' ? 'Guía' : 'Peques / Tribu'}
                  </p>
                </div>
              </div>
              <button onClick={() => { triggerHaptic('soft'); setEditingMember({...member}); }} 
                      className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-[1.2rem] flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all">
                <Edit2 size={18} />
              </button>
            </div>
          ))}
        </section>

        <Button 
          variant="ghost" 
          onClick={handleSignOut} 
          className="w-full h-20 rounded-[2.5rem] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all gap-3 mb-10 border border-transparent hover:border-red-100"
        >
          <LogOut size={20} /> Cerrar Sesión Segura
        </Button>
      </div>

      {/* MODAL EDICIÓN IGUAL AL ANTERIOR PERO MANTENIENDO ESTILO BRISA */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="rounded-[3.5rem] border-none bg-white/95 backdrop-blur-2xl p-10 max-w-[92%] mx-auto shadow-3xl">
          <DialogHeader><DialogTitle className="text-3xl font-black italic text-center mb-4 tracking-tighter">Perfil de la Tribu</DialogTitle></DialogHeader>
          <div className="space-y-8 mt-2">
            <div className="flex justify-center">
                <div className="w-24 h-24 rounded-[2.2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl"
                     style={{ backgroundColor: editingMember?.avatar_url || '#ccc' }}>
                    {editingMember?.display_name?.charAt(0)}
                </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre Público</label>
              <Input 
                value={editingMember?.display_name || ''} 
                onChange={e => setEditingMember({...editingMember, display_name: e.target.value})}
                className="h-16 rounded-[1.5rem] bg-slate-100 border-none font-bold text-center text-xl focus:ring-2 ring-sky-500" 
              />
            </div>

            <div className="grid grid-cols-6 gap-3">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setEditingMember({...editingMember, avatar_url: c})}
                        className={`h-10 rounded-xl transition-all ${editingMember?.avatar_url === c ? 'ring-4 ring-sky-500/30 scale-110 shadow-lg' : 'opacity-40'}`}
                        style={{ backgroundColor: c }} />
              ))}
            </div>

            <div className="flex gap-3">
                <Button onClick={() => setEditingMember({...editingMember, role: 'autonomous'})} 
                        className={`flex-1 h-14 rounded-2xl font-black text-[10px] ${editingMember?.role === 'autonomous' ? 'bg-sky-500' : 'bg-slate-50 text-slate-400'}`}>GUÍA</Button>
                <Button onClick={() => setEditingMember({...editingMember, role: 'dependent'})} 
                        className={`flex-1 h-14 rounded-2xl font-black text-[10px] ${editingMember?.role === 'dependent' ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-400'}`}>TRIBU</Button>
            </div>

            <div className="flex flex-col gap-3 pt-6">
                <Button onClick={handleUpdate} disabled={loading} className="h-20 rounded-[2rem] bg-slate-900 font-black tracking-[0.2em] text-white shadow-2xl">
                    {loading ? <Loader2 className="animate-spin" /> : "GUARDAR CAMBIOS"}
                </Button>
                <button onClick={() => handleDelete(editingMember.id)} className="text-red-400 font-black text-[10px] tracking-[0.3em] uppercase py-2 flex items-center justify-center gap-2 opacity-60">
                    <Trash2 size={14} /> Eliminar
                </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
                  
