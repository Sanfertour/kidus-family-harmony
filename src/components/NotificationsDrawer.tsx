import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Bell, Check, Share2, Heart, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export const NotificationsDrawer = ({ 
  isOpen, 
  onClose, 
  nestId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  nestId: string | null;
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!nestId) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('nest_id', nestId)
      .order('created_at', { ascending: false });

    if (!error) setNotifications(data);
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();

    // SUSCRIPCIÓN EN TIEMPO REAL
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `nest_id=eq.${nestId}` }, 
        () => fetchNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, nestId]);

  const handleAcceptDelegation = async (notification: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Actualizamos el evento original al nuevo encargado
    const { error: eventError } = await supabase
      .from('events')
      .update({ assigned_to: user.id })
      .eq('id', notification.event_id);

    if (!eventError) {
      // 2. Marcamos notificación como aceptada
      await supabase
        .from('notifications')
        .update({ status: 'accepted' })
        .eq('id', notification.id);

      toast({ 
        title: "¡Relevo aceptado!", 
        description: "El evento ahora está en tu agenda. ¡Buen trabajo en equipo!",
      });
      fetchNotifications();
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center font-nunito">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom h-[80vh] flex flex-col">
        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-6" />
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Buzón del Nido</h2>
            <p className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-widest">Avisos de Red de Apoyo</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <Bell size={48} className="mx-auto mb-4" />
              <p className="font-bold uppercase text-[10px] tracking-widest">No hay avisos pendientes</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`p-6 rounded-[2rem] border transition-all ${n.status === 'accepted' ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.type === 'DELEGATION_REQUEST' ? 'bg-sky-50 text-sky-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {n.type === 'DELEGATION_REQUEST' ? <Share2 size={20} /> : <Heart size={20} />}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700 leading-snug mb-1">{n.message}</p>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                      {format(new Date(n.created_at), "HH:mm '·' d MMM", { locale: es })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {n.type === 'DELEGATION_REQUEST' && n.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleAcceptDelegation(n)}
                        className="flex-1 h-12 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        <Check size={14} /> Aceptar Relevo
                      </button>
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="flex-1 h-12 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                    >
                      {n.status === 'accepted' ? 'Limpiar Aviso' : 'Entendido'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
