import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchSession();
      }
      if (event === 'SIGNED_OUT') {
        fetchSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <motion.div
          animate={{ scale: [0.95, 1, 0.95], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-28 h-28 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center p-4 border border-white"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-full h-full object-cover rounded-[2rem]"
            alt="KidUs"
          />
        </motion.div>
        <div className="mt-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic animate-pulse">
            Sincronizando Nido
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                !profile ? <Index /> : 
                !nestId ? <Navigate to="/onboarding" replace /> : 
                <Index />
              } 
            />
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
      {/* Shadcn UI Toaster */}
      <Toaster />
      {/* Sonner Toaster (Corregido) */}
      <Sonner position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
};

export default App;
