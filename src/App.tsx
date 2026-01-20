import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { OnboardingView } from "./components/OnboardingView";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const { fetchSession, nestId, loading: storeLoading } = useNestStore();

  useEffect(() => {
    // 1. Inicialización de Auth y Sincronía
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        await fetchSession();
      } else {
        // Liberamos el splash screen si no hay nadie logueado
        useNestStore.setState({ loading: false });
      }
    };

    initAuth();

    // 2. Escucha de cambios de estado real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        await fetchSession();
      } else {
        useNestStore.setState({ profile: null, nestId: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]);

  // Pantalla de Sincronía KidUs (Splash Screen)
  if (storeLoading) {
    return (
      <div className="min-h-[100dvh] w-full bg-slate-50 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center">
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
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner position="top-center" expand={false} richColors />
        
        <div className="relative min-h-[100dvh] w-full bg-slate-50 overflow-x-hidden selection:bg-sky-100">
          
          {/* ATMÓSFERA VISUAL BRISA */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%] bg-nido-mesh opacity-60" />
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-sky-400/10 blur-[120px]" />
          </div>

          <div className="relative z-10 w-full h-full"> 
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    !session ? (
                      <Index /> // Pantalla de Login
                    ) : nestId ? (
                      <Index /> // Dashboard (ya tiene nido)
                    ) : (
                      <OnboardingView /> // Forzar creación de Nido si nestId es null o undefined
                    )
                  } 
                />
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
