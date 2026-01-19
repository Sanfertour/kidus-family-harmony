import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { NestOnboarding } from "./components/NestOnboarding";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [hasNest, setHasNest] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Persistencia de Sesión y Verificación de Nido
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        await checkNestStatus(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Escuchar cambios en tiempo real (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await checkNestStatus(session.user.id);
      } else {
        setHasNest(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkNestStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setHasNest(!!data?.nest_id);
    } catch (err) {
      console.error("Error verificando Nido:", err);
      setHasNest(false);
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga con estética Brisa mientras verificamos el Nido
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-sky-400/20 rounded-full blur-xl mb-4" />
          <span className="text-[10px] font-black tracking-[0.5em] text-slate-300 uppercase">Sincronizando...</span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner position="top-right" />
        
        <div className="relative min-h-screen w-full bg-slate-50 selection:bg-[#0EA5E9]/20 overflow-x-hidden">
          
          {/* FONDO ATMÓSFERA KIDUS (FIJO) */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-[15%] -left-[10%] w-[800px] h-[800px] bg-sky-400/30 blur-[100px] animate-wave-slow opacity-60" />
            <div className="absolute -bottom-[15%] -right-[10%] w-[700px] h-[700px] bg-orange-400/20 blur-[100px] animate-wave-medium opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/10 blur-[120px] animate-float" />
          </div>

          {/* CAPA DE CONTENIDO */}
          <div className="relative z-10 w-full"> 
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    !session ? (
                      /* Aquí podrías poner tu Auth/Login. Por ahora cargamos Index 
                         o puedes crear una ruta /login */
                      <Index /> 
                    ) : hasNest ? (
                      <Index />
                    ) : (
                      <NestOnboarding onComplete={() => setHasNest(true)} />
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
