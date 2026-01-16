import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Header = () => {
  const { toast } = useToast();
  // Este estado lo conectaremos luego a la base de datos de conflictos
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Conflicto detectado", message: "Lucas tiene dos eventos a las 17:00", type: "conflict" }
  ]);

  const handleNotificationClick = () => {
    if (notifications.length > 0) {
      notifications.forEach(n => {
        toast({
          title: n.title,
          description: n.message,
          variant: n.type === "conflict" ? "destructive" : "default",
        });
      });
      // Opcional: limpiar notificaciones al verlas
      // setNotifications([]);
    } else {
      toast({
        title: "Todo en orden",
        description: "No hay conflictos logísticos hoy.",
      });
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-6 max-w-md mx-auto">
      <div className="flex flex-col">
        <span className="text-[10px] font-extrabold text-kidus-blue uppercase tracking-widest opacity-80">
          Panel de Control
        </span>
        <h1 className="text-3xl font-black font-nunito tracking-tight text-foreground flex items-center gap-1">
          Kid<span className="text-kidus-blue">Us</span>
          <span className="w-1.5 h-1.5 bg-kidus-blue rounded-full mt-auto mb-2 animate-pulse"></span>
        </h1>
      </div>
      
      <button 
        onClick={handleNotificationClick}
        className="w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-white flex items-center justify-center text-gray-500 hover:text-kidus-blue hover:scale-110 active:scale-95 transition-all relative"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold animate-bounce">
            {notifications.length}
          </span>
        )}
      </button>
    </header>
  );
};

export default Header;
