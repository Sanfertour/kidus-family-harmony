import { Bell } from "lucide-react";
import KidusLogo from "@/assets/kidus-logo-C1AuyFb2.png";

const Header = () => (
  <header className="flex items-center justify-between px-6 py-8 max-w-md mx-auto relative z-20">
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <img src={KidusLogo} alt="Nido" className="w-8 h-8 object-contain" />
        <h1 className="text-3xl font-black font-nunito tracking-tight">
          Kid<span className="text-blue-500">Us</span>
        </h1>
        <div className="w-2 h-2 bg-blue-500 rounded-full self-start mt-2 animate-pulse"></div>
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-10">
        Panel de Control
      </span>
    </div>
    
    <button className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-md border border-white flex items-center justify-center relative shadow-sm">
      <Bell className="w-6 h-6 text-gray-600" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white text-[8px] text-white font-bold flex items-center justify-center">1</span>
    </button>
  </header>
);

export default Header;
