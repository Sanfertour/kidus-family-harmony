import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { ShieldCheck, Sparkles } from "lucide-react";

export const AuthView = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-6 font-sans">
      {/* Elementos decorativos de fondo */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100/50 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white/80 backdrop-blur-3xl p-12 rounded-[4rem] shadow-brisa border border-white"
      >
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex p-4 bg-sky-500 rounded-[2rem] text-white shadow-xl shadow-sky-100 mb-4">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">KidUs</h1>
          <div className="flex items-center justify-center gap-3">
            <Sparkles size={14} className="text-orange-500" />
            <p className="text-sky-500 font-black text-[10px] uppercase tracking-[0.4em]">Gestión Familiar Élite</p>
          </div>
        </div>

        <div className="auth-container">
          <Auth 
            supabaseClient={supabase} 
            appearance={{ 
              theme: ThemeSupa,
              variables: { 
                default: { 
                  colors: { 
                    brand: '#0ea5e9', 
                    brandAccent: '#0284c7',
                    inputBackground: '#f8fafc',
                    inputText: '#0f172a',
                    inputBorder: '#f1f5f9',
                    inputPlaceholder: '#cbd5e1',
                  },
                  radii: {
                    borderRadiusButton: '2rem',
                    buttonPadding: '1.2rem',
                    inputBorderRadius: '1.8rem',
                  },
                  fonts: {
                    bodyFontFamily: `'Inter', sans-serif`,
                    buttonFontFamily: `'Inter', sans-serif`,
                  }
                } 
              },
              className: {
                button: 'font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg',
                input: 'border-none shadow-inner px-6 h-14 font-medium',
                label: 'text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-4',
              }
            }}
            providers={[]}
            localization={{ 
              variables: { 
                sign_up: { 
                  email_label: 'Email del Guía', 
                  password_label: 'Contraseña de seguridad',
                  button_label: 'Crear Nido',
                  social_provider_text: 'Entrar con {{provider}}',
                  link_text: '¿No tienes cuenta? Regístrate'
                },
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Contraseña',
                  button_label: 'Sincronizar',
                  link_text: '¿Ya eres Guía? Inicia sesión'
                }
              } 
            }}
          />
        </div>

        <p className="mt-12 text-center text-[9px] font-medium text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
          Al entrar, aceptas la sincronía de datos <br /> bajo el protocolo de seguridad KidUs.
        </p>
      </motion.div>
    </div>
  );
};
