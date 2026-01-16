import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importación de Páginas
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

/**
 * Configuración del QueryClient
 * Mantiene el estado de las peticiones asíncronas (como datos de Strava o telemetría)
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita recargas innecesarias al cambiar de pestaña
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        {/* Componentes de Notificación (Feedback visual rápido) */}
        <Toaster />
        <Sonner position="top-right" closeButton />

        <BrowserRouter>
          <Routes>
            {/* Ruta Principal: Tu Dashboard de XC */}
            <Route path="/" element={<Index />} />

            {/* RUTA PARA FUTURAS PÁGINAS:
              Ejemplo: <Route path="/entrenamientos" element={<TrainingLog />} />
            */}

            {/* Catch-all: Si el usuario se sale del sendero marcado */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
