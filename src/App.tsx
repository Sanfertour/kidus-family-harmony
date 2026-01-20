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
    // 1. Inicialización de Auth y verificación de estado
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          await checkNestStatus(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error inicializando auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        setLoading(true); // Re-activamos loading al cambiar de usuario
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
      // Usamos maybeSingle() para que no lance error 406 si no encuentra el perfil
      const { data, error } = await supabase
        .from('profiles')
        .select('nest_id')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;

      // Validación de Seguridad: Comprobar que nest_id es un UUID válido y no un texto KID-XXXXX
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const isValidUuid = data?.nest_id && uuidRegex.test(data.nest_id);

      console.log("Estado del Nido:", isValidUuid ? "Vinculado (UUID)" : "No vinculado");
      setHasNest(!!isValidUuid);
    } catch (err) {
      console.error("Error verificando Nido:", err);
      setHasNest(false);
    } finally {
      // Garantizamos que el estado de carga termine pase lo que pase
      setLoading(false);
    }
  };

  // UI de Sincronización con estética "Brisa"
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-sky-400/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping" />
            </div>
          </div>
          <span className="text-[10px] font-black tracking-[0.6em] text-slate-400 uppercase animate-pulse">
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
        
        <div className="relative min-h-screen w-full bg-slate-50 selection:bg-[#0EA5E9]/20 overflow-x-hidden">
          
          {/* ATMÓSFERA VISUAL KIDUS */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-[15%] -left-[10%] w-[800px] h-[800px] bg-sky-400/20 blur-[120px] animate-wave-slow opacity-60" />
            <div className="absolute -bottom-[15%] -right-[10%] w-[700px] h-[700px] bg-orange-400/10 blur-[100px] animate-wave-medium opacity-50" />
          </div>

          <div className="relative z-10 w-full"> 
            <BrowserRouter>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    !session ? (
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
