import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useNestStore } from "@/store/useNestStore"; // Importante: Usamos el cerebro de la app

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { OnboardingView } from "./components/OnboardingView"; // El nuevo componente

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Extraemos lo necesario del Store global
  const { profile, fetchSession, nestId } = useNestStore();

  useEffect(() => {
    // 1. Inicialización y escucha de Auth
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) await fetchSession();
      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchSession();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]);

  // UI de Sincronización "Brisa"
  if (loading) {
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
          
          {/* ATMÓSFERA VISUAL KIDUS */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-sky-400/10 blur-[100px] animate-pulse" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] bg-orange-400/5 blur-[100px]" />
          </div>

          <div className="relative z-10 w-full"> 
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    !session ? (
                      <Index /> // Pantalla de Login
                    ) : (nestId && /^[0-9a-fA-F-]{36}$/.test(nestId)) ? (
                      <Index /> // Dashboard Principal (Si hay UUID válido)
                    ) : (
                      <OnboardingView /> // Pantalla para crear/unirse al nido
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
