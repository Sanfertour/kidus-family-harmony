import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner position="top-right" />
        
        {/* CONTENEDOR RAÍZ DEL NIDO: Define el lienzo base */}
        <div className="relative min-h-screen w-full bg-slate-50 selection:bg-[#0EA5E9]/20">
          
          {/* FONDO FIJO: La atmósfera que NO se mueve al hacer scroll */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Onda Sky Blue - Calma para la Tribu: Más marcada y menos blur */}
            <div className="absolute -top-[15%] -left-[10%] w-[800px] h-[800px] bg-sky-400/40 blur-[60px] animate-wave-slow" />
            
            {/* Onda Vital Orange - Energía para el Equipo: Opacidad subida al 40% */}
            <div className="absolute -bottom-[15%] -right-[10%] w-[700px] h-[700px] bg-orange-400/40 blur-[60px] animate-wave-medium" />
            
            {/* Punto de luz violeta: Reducimos blur para dar más textura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-400/15 blur-[80px] animate-float" />
          </div>

          {/* CONTENIDO FLUIDO: La capa que permite el scroll natural */}
          <div className="relative z-10 w-full"> 
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </div>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
