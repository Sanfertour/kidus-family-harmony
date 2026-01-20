import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNestStore } from "@/store/useNestStore";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { OnboardingView } from "./components/OnboardingView";

const queryClient = new QueryClient();

const App = () => {
  const { fetchSession, profile, nestId, loading } = useNestStore();

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Pantalla de Sincronía KidUs (Splash Screen)
  if (loading) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-sky-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-sky-500 rounded-full animate-ping" />
          </div>
        </div>
        <span className="text-[10px] font-black tracking-[0.8em] text-slate-400 uppercase animate-pulse pl-[0.8em]">
          Sincronía KidUs
        </span>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner position="top-center" richColors closeButton />
        
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                !profile ? (
                  <Index /> // Si no hay perfil -> Login (dentro de Index)
                ) : nestId ? (
                  <Index /> // Si hay perfil y nido -> App Principal
                ) : (
                  <OnboardingView /> // Si hay perfil pero NO nido -> Onboarding
                )
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
