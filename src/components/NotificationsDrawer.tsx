import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Bell, Check, Share2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Función de vibración centralizada para la Tribu
const triggerHaptic = (type: 'soft' | 'success' | 'warning') => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    const patterns = { soft: 10, success: [20, 30, 20], warning: [40, 100, 40] };
    navigator.vibrate(patterns[type]);
  }
};

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
    if (isOpen) {
      fetchNotifications();
      triggerHaptic('soft');
    }

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

    // Sincronía con la nueva estructura: assigned_to
    const { error: eventError } = await supabase
      .from('events')
      .update({ assigned_to: user.id })
      .eq('id', notification.event_id);

    if (!eventError) {
      await supabase
        .from('notifications')
        .update({ status: 'accepted' })
        .eq('id', notification.id);

      triggerHaptic('success');
      toast({ 
        title: "Relevo completado", 
        description: "El evento ya está bajo tu guía. ¡Buen trabajo en equipo!",
      });
      fetchNotifications();
    }
  };

  const markAsRead = async (id: string) => {
    triggerHaptic('soft');
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center font-nunito">
      {/* Backdrop con desenfoque premium */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[3.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 h-[80vh] flex flex-col border-t border-white/50">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8" />
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none font-nunito uppercase">Buzón</h2>
            <p className="text-[10px] font-black text-[#0EA5E9] uppercase tracking-[0.3em] mt-2">Avisos de la Tribu</p>
          </div>
          <button 
            onClick={() => { triggerHaptic('soft'); onClose(); }} 
            className="w-12 h-12 bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-400 active:scale-90 transition-transform"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-10">
          {notifications.length === 0 ? (
            <div className="py-24 text-center opacity-20">
              <Bell size={64} className="mx-auto mb-4" />
              <p className="font-black uppercase text-[10px] tracking-widest">El Nido está en calma</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-6 rounded-[2.5rem] border transition-all duration-400 ${
                  n.status === 'accepted' 
                    ? 'bg-slate-50/50 border-transparent opacity-50' 
                    : 'bg-white border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    n.type === 'DELEGATION_REQUEST' ? 'bg-[#0EA5E9]/10 text-[#0EA5E9]' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {n.type === 'DELEGATION_REQUEST' ? <Share2 size={24} /> : <Heart size={24} />}
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-bold text-slate-700 leading-tight mb-2">{n.message}</p>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      {format(new Date(n.created_at), "HH:mm '·' d MMM", { locale: es })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {n.type === 'DELEGATION_REQUEST' && n.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleAcceptDelegation(n)}
                        className="flex-1 h-14 bg-[#0EA5E9] text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-sky-100"
                      >
                        <Check size={16} /> Aceptar Relevo
                      </button>
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="w-14 h-14 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="flex-1 h-14 bg-slate-100/50 text-slate-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
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
