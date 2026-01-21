import { useEffect } from "react";
import { useNestStore } from "@/store/useNestStore";
import { supabase } from "@/lib/supabase";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import { OnboardingView } from "./components/OnboardingView";
import { motion } from "framer-motion";

const App = () => {
  const { fetchSession, profile, nestId, loading, initialized } = useNestStore();

  useEffect(() => {
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading && !initialized) {
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
            alt="KidUs" 
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
      <Routes>
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
          element={profile && !nestId ? <OnboardingView /> : <Navigate to="/" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
