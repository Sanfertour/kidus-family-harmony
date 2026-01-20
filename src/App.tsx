import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNestStore } from "@/store/useNestStore";
import { motion, AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { OnboardingView } from "./components/OnboardingView";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Configuración del QueryClient para mantener la sincronía de datos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos de caché para datos de la Tribu
    },
  },
});

const App = () => {
  const { fetchSession, profile, nestId, loading } = useNestStore();

  useEffect(() => {
    // El store debe marcar 'loading: true' al iniciar fetchSession
    fetchSession();
  }, [fetchSession]);

  /**
   * PROTOCOLO CERO ROTURAS: 
   * Mientras 'loading' sea true, bloqueamos el renderizado de rutas.
   * Esto evita que el usuario vea el Dashboard sin tener un nestId inyectado.
   */
  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#F8FAFC] flex flex-col items-center justify-center overflow-hidden p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-28 h-28 flex items-center justify-center"
        >
          {/* Logo con Glassmorphism suave */}
          <div className="absolute inset-0 bg-sky-400/10 blur-3xl rounded-full" />
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-full h-full object-contain rounded-[3.5rem] shadow-xl relative z-10"
            alt="KidUs Logo"
          />
        </motion.div>

        <div className="mt-16 flex flex-col items-center gap-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 italic"
          >
            Sincronizando Nido
          </motion.span>
          
          <div className="w-24 h-[3px] bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-sky-400 to-orange-400"
              animate={{ 
                x: [-96, 96],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            {/* FLUJO DE ACCESO KIDUS:
                1. ¿Hay Perfil? No -> Login (Index)
                2. ¿Hay Perfil pero no Nido? -> Onboarding obligatoire
                3. ¿Hay Perfil y Nido? -> Dashboard (Index)
            */}
            <Route 
              path="/" 
              element={
                !profile ? (
                  <Index />
                ) : !nestId ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <Index />
                )
              } 
            />

            {/* Protección de ruta Onboarding: Solo para Guías sin Nido */}
            <Route 
              path="/onboarding" 
              element={
                profile && !nestId ? (
                  <OnboardingView />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
      {/* Feedback visual y háptico gestionado por los Toasters */}
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
};

export default App;
