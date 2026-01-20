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

const queryClient = new QueryClient();

const App = () => {
  const { fetchSession, profile, nestId, loading } = useNestStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Pantalla de Carga de Élite
  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ 
            scale: [0.9, 1.05, 1],
            opacity: [0.4, 1, 0.4] 
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 bg-white rounded-[3.5rem] shadow-2xl flex items-center justify-center p-6"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-full h-full object-contain grayscale opacity-80"
            alt="KidUs"
          />
        </motion.div>
        <div className="mt-12 space-y-2 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400 animate-pulse italic">
            Sincronizando Nido
          </p>
          <div className="w-12 h-[2px] bg-sky-200 mx-auto rounded-full overflow-hidden">
            <motion.div 
              animate={{ x: [-48, 48] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-full h-full bg-sky-500"
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
            {/* Si no hay perfil, va al Index (que maneja el Login) */}
            <Route 
              path="/" 
              element={
                !profile ? <Index /> : 
                !nestId ? <Navigate to="/onboarding" replace /> : 
                <Index />
              } 
            />
            {/* Solo permite Onboarding si el usuario está logueado pero no tiene Nido */}
            <Route 
              path="/onboarding" 
              element={
                profile && !nestId ? <OnboardingView /> : <Navigate to="/" replace />
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
