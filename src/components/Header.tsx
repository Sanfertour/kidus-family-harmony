import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { toast } = useToast();

  const showNotifications = () => {
    toast({
      title: "Notificaciones",
      description: "No tienes avisos nuevos en el nido.",
      variant: "default",
    });
  };

  return (
    <header className="flex items-center justify-between px-6 py-6 max-w-md mx-auto">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-kidus-blue uppercase tracking-widest opacity-70">
          Hola, Capitán
        </span>
        <h1 className="text-3xl font-black font-nunito tracking-tight text-foreground">
          Kid<span className="text-kidus-blue">Us</span>
        </h1>
      </div>
      
      <button 
        onClick={showNotifications}
        className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-kidus-blue hover:scale-110 active:scale-95 transition-all"
      >
        <div className="relative">
          <Bell className="w-6 h-6" />
          {/* Puntito de aviso (opcional) */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        </div>
      </button>
    </header>
  );
};

export default Header;
