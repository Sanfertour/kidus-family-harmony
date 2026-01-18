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
        
        {/* CONTENEDOR RAÍZ DEL NIDO */}
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
          
          {/* CAPA DE FONDO: LA BRISA ANIMADA */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Onda Sky Blue */}
            <div className="absolute -top-[10%] -left-[10%] w-[700px] h-[700px] bg-sky-400/20 blur-[100px] animate-wave-slow" />
            {/* Onda Vital Orange */}
            <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-orange-400/20 blur-[100px] animate-wave-medium" />
            {/* Punto de luz violeta para profundidad de la tribu */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-300/10 blur-[120px] animate-float" />
          </div>

          {/* CONTENIDO DE LA APP (Z-INDEX SUPERIOR) */}
          <div className="relative z-10 h-full">
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
