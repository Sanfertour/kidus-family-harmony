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
    // 1. Inicialización de Auth
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        await fetchSession();
      } else {
        // MUY IMPORTANTE: Si no hay sesión, tenemos que avisar al Store 
        // para que deje de mostrar la pantalla de carga.
        useNestStore.setState({ loading: false });
      }
    };

    initAuth();

    // 2. Escuchar cambios de Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        await fetchSession();
      } else {
        useNestStore.setState({ loading: false, profile: null, nestId: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]); // fetchSession es estable gracias a Zustand, no causará bucle

  // UI de Sincronización "Brisa"
  if (storeLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-sky-400/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-ping" />
            </div>
          </div>
          <span className="text-[10px] font-black tracking-[0.6em] text-slate-400 uppercase">
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
        <Sonner position="top-right" expand={false} richColors />
        
        <div className="relative min-h-screen w-full bg-slate-50 overflow-x-hidden">
          {/* ATMÓSFERA VISUAL */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-sky-400/10 blur-[100px]" />
          </div>

          <div className="relative z-10 w-full"> 
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    !session ? (
                      <Index /> // Pantalla de Login (Landing)
                    ) : (nestId && nestId.length > 10) ? (
                      <Index /> // Dashboard (Ya tiene nido)
                    ) : (
                      <OnboardingView /> // Forzar creación de nido
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
