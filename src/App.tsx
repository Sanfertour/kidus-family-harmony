import { useEffect } from "react";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { OnboardingView } from "./components/OnboardingView";
import { AuthView } from "./components/AuthView";
import { motion } from "framer-motion";

const App = () => {
  const { fetchSession, profile, nestId, loading, initialized } = useNestStore();

  useEffect(() => {
    // 1. Limpieza de Hash de Supabase (Evita el bucle en Netlify)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      // Dejamos que Supabase procese el hash internamente, pero fetchSession lo gestionará
      console.log("Token detectado en URL, sincronizando...");
    }

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Cambio de Auth detectado:", event);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        await fetchSession();
      }
      if (event === 'SIGNED_OUT') {
        // Limpieza total al salir
        useNestStore.setState({ profile: null, nestId: null, initialized: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]);

  // Pantalla de carga "Brisa"
  if (loading || !initialized) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center w-full max-w-sm"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-32 h-32 mx-auto mb-8 rounded-[2.5rem] shadow-2xl object-cover" 
            alt="KidUs" 
          />
          <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tighter">KidUs</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Lógica de enrutado de élite */}
        <Route 
          path="/" 
          element={
            !profile ? (
              <AuthView />
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

        {/* Captura de rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
