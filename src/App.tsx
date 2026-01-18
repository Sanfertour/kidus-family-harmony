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
        
        {/* CONTENEDOR RAÍZ: El lienzo del Nido */}
        <div className="relative min-h-screen w-full bg-slate-50 selection:bg-[#0EA5E9]/20">
          
          {/* CAPA DE FONDO: Brisa Visual Inmersiva (Fija) */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Onda Sky Blue - Calma para la Tribu */}
            <div className="absolute -top-[15%] -left-[10%] w-[800px] h-[800px] bg-[#0EA5E9]/15 blur-[120px] animate-wave-slow" />
            
            {/* Onda Vital Orange - Energía para el Nido */}
            <div className="absolute -bottom-[15%] -right-[10%] w-[700px] h-[700px] bg-[#F97316]/15 blur-[120px] animate-wave-medium" />
            
            {/* Punto de luz para profundidad */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-200/10 blur-[150px] animate-float" />
          </div>

          {/* CONTENIDO DE LA APP: Flujo natural sobre la Brisa */}
          <main className="relative z-10 w-full min-h-screen">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </main>
        </div>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
