import { useEffect } from "react";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import { OnboardingView } from "./components/OnboardingView";
import { motion } from "framer-motion";

const queryClient = new QueryClient();

const App = () => {
  const { fetchSession, profile, nestId, loading } = useNestStore();

  useEffect(() => {
    // Solo se ejecuta una vez al montar la aplicación
    fetchSession();

    // Listener para cambios de sesión (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Limpieza drástica para evitar estados residuales
        window.location.href = '/';
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Solo refrescamos sesión si no estábamos ya cargando
        fetchSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []); // El array vacío es vital para detener el parpadeo

  // Vista de carga estética "Brisa"
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
            Sincronizando Nido
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Lógica de Enrutamiento:
                1. Si no hay perfil -> Login (Index)
                2. Si hay perfil pero no hay nido -> Onboarding
                3. Si hay perfil y hay nido -> Dashboard (Index)
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

            {/* Ruta de captura para 404 redireccionando al inicio */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
