import { useEffect } from "react";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { OnboardingView } from "./components/OnboardingView";
import { AuthView } from "./components/AuthView";
import { motion, AnimatePresence } from "framer-motion";

/**
 * KidUs - Aplicación de Gestión Familiar de Élite
 * Estética: Brisa (Glassmorphism, Rounded 3.5rem, Haptic Feedback)
 */
const App = () => {
  const { fetchSession, profile, nestId, loading, initialized } = useNestStore();

  useEffect(() => {
    // Captura inicial de sesión para evitar el bucle de redirección
    const handleInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchSession();
      } else {
        // Marcamos como inicializado para mostrar el AuthView si no hay sesión
        useNestStore.setState({ initialized: true, loading: false });
      }
    };

    handleInitialAuth();

    // Listener de cambios de estado de autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      console.log("Auth Event:", event);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Pequeño delay para asegurar que el trigger de perfiles en DB ha terminado
        setTimeout(async () => {
          await fetchSession();
        }, 500);
      }
      if (event === 'SIGNED_OUT') {
        // Limpieza de estado y redirección dura al inicio
        useNestStore.setState({ profile: null, nestId: null, initialized: true });
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]);

  // PANTALLA DE CARGA "BRISA" 
  // Se mantiene activa hasta que el Store confirma el estado del usuario
  if (!initialized) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center w-full max-w-sm"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-40 h-40 mx-auto mb-8 rounded-[3rem] shadow-2xl object-cover" 
            alt="KidUs Logo" 
          />
          <h1 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter leading-none">KidUs</h1>
          <p className="text-slate-400 mb-12 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
            Sincronizando Nido...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* RUTA RAÍZ: Decide según perfil y nido */}
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

          {/* RUTA ONBOARDING: Solo accesible si eres Guía sin Nido */}
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

          {/* FALLBACK: Redirige cualquier ruta desconocida al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;
            
