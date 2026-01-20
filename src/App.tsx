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

// Inicialización del cliente de consultas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { fetchSession, profile, nestId, loading } = useNestStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Pantalla de Carga de Élite (Estética Brisa)
  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center overflow-hidden p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.95, 1, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 flex items-center justify-center"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-full h-full object-contain rounded-[3.5rem] shadow-2xl shadow-sky-100"
            alt="KidUs Logo"
          />
        </motion.div>
        <div className="mt-12 flex flex-col items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sincronía KidUs</span>
          <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-sky-500"
              animate={{ x: [-64, 64] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
            {/* LÓGICA DE ENRUTAMIENTO LOGÍSTICO:
                1. Sin Sesión -> Index (Login)
                2. Con Sesión pero sin Nido -> Onboarding (Crear/Unirse)
                3. Con Sesión y Nido -> Index (Dashboard Principal)
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

            {/* Ruta protegida de Onboarding */}
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
      <Toaster />
      <Sonner position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
};

export default App;
