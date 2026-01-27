import { useEffect } from "react";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { OnboardingView } from "./components/OnboardingView";
import { AuthView } from "./components/AuthView";
import { motion, AnimatePresence } from "framer-motion";

const App = () => {
  const { fetchSession, profile, nestId, loading, initialized } = useNestStore();

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
      console.log("Auth Event:", event);
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
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-sky-400/20 blur-[80px] rounded-full animate-wave-viva" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center w-full max-w-sm z-10"
        >
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-40 h-40 mx-auto mb-8 rounded-[3.5rem] shadow-2xl object-cover border-4 border-white" 
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
      {/* CAPA ATMÓSFERA BRISA VIVA (3 ONDAS CONFLUYENTES) */}
      <div className="atmosfera-container">
        {/* Onda Sky Blue vibrante */}
        <div className="absolute top-[-5%] right-[-5%] w-[65%] h-[65%] bg-sky-400/30 animate-wave-viva" />
        
        {/* Onda Vital Orange marcada */}
        <div className="absolute bottom-[-5%] left-[-5%] w-[75%] h-[75%] bg-orange-400/30 animate-wave-viva-delayed" />
        
        {/* Onda Contraste Violeta para profundidad orgánica */}
        <div className="absolute top-[25%] right-[-10%] w-[45%] h-[55%] bg-indigo-400/20 animate-wave-viva-fast" />
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
