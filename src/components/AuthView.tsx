import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";

export const AuthView = () => {
  const getURL = () => window.location.origin;

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.auth-container button')) {
        triggerHaptic('soft');
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-6 font-sans overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-100/40 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-50/40 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white/70 backdrop-blur-[40px] p-10 md:p-12 rounded-[4rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-white/60"
      >
        <div className="text-center mb-10 space-y-4">
          {/* TU LOGOTIPO RESTAURADO */}
          <img 
            src="https://raw.githubusercontent.com/Sanfertour/kidus-family-harmony/main/src/assets/IMG_20260120_144903.jpg" 
            className="w-32 h-32 mx-auto mb-6 rounded-[2.5rem] shadow-2xl object-cover" 
            alt="KidUs Logo" 
          />
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">
            KidUs
          </h1>
          <div className="flex items-center justify-center gap-3">
            <Sparkles size={14} className="text-orange-500" />
            <p className="text-sky-600 font-black text-[10px] uppercase tracking-[0.4em]">
              FAMILY HARMONY
            </p>
          </div>
        </div>

        <div className="auth-container">
          <Auth 
            supabaseClient={supabase} 
            providers={['google']}
            redirectTo={getURL()}
            appearance={{ 
              theme: ThemeSupa,
              variables: { 
                default: { 
                  colors: { 
                    brand: '#0f172a', 
                    brandAccent: '#0ea5e9',
                  },
                  radii: {
                    borderRadiusButton: '2rem',
                    inputBorderRadius: '1.5rem',
                  }
                } 
              }
            }}
            localization={{ 
              variables: { 
                sign_in: { email_label: 'Email del Guía', button_label: 'Sincronizar Acceso' }
              } 
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};
