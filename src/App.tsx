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
 * Estética: Brisa (Lava Lamp Edition)
 */
const App = () => {
  const { fetchSession, profile, nestId, initialized } = useNestStore();

  useEffect(() => {
    const handleInitialAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchSession();
      } else {
        useNestStore.setState({ initialized: true, loading: false });
      }
    };

    handleInitialAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setTimeout(async () => {
          await fetchSession();
        }, 500);
      }
      if (event === 'SIGNED_OUT') {
        useNestStore.setState({ profile: null, nestId: null, initialized: true });
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]);

  if (!initialized) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-white overflow-hidden">
        {/* Lava de carga */}
        <div className="lava-blob lava-sky w-[350px] h-[350px] top-[-10%] left-[-10%]" />
        <div className="lava-blob lava-vital w-[300px] h-[300px] bottom-[-5%] right-[-5%]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center z-10"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-40 h-40 mx-auto mb-8 rounded-[3.5rem] shadow-2xl object-cover border-4 border-white" 
            alt="KidUs Logo" 
          />
          <h1 className="text-5xl font-black text-slate-900 mb-2 italic tracking-tighter leading-none">KidUs</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
            Sincronizando Nido...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* ATMÓSFERA LÁMPARA DE LAVA (COLORES CORPORATIVOS) */}
      <div className="atmosfera-container">
        {/* Burbuja Azul Sky - Diagonal superior */}
        <div className="lava-blob lava-sky w-[90%] h-[60%] top-[-10%] right-[-10%]" />
        
        {/* Burbuja Naranja Vital - Diagonal inferior */}
        <div className="lava-blob lava-vital w-[80%] h-[70%] bottom-[-10%] left-[-10%]" />
        
        {/* Burbuja Violeta - Confluencia central */}
        <div className="lava-blob lava-violet w-[50%] h-[50%] top-[25%] left-[20%]" />
      </div>

      <AnimatePresence mode="wait">
        <Routes>
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
};

export default App;
