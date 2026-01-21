import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { triggerHaptic } from "@/utils/haptics";

export const AuthView = () => {
  // Configuración de la URL de redirección para evitar el bucle tras el login
  const getURL = () => {
    let url = 
      import.meta.env.VITE_SITE_URL ?? 
      window.location.origin ?? 
      'https://kidusfamily.netlify.app/';
    
    // Asegurar que termina en slash
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
  };

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
      {/* Orbes de fondo estilo Brisa */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-100/40 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-50/40 rounded-full blur-[120px] -z-10 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-[440px] bg-white/70 backdrop-blur-[40px] p-10 md:p-12 rounded-[4rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-white/60"
      >
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex p-5 bg-slate-900 rounded-[2.2rem] text-white shadow-2xl mb-2">
            <ShieldCheck size={36} strokeWidth={2} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none italic">
            KidUs
          </h1>
          <div className="flex items-center justify-center gap-3">
            <Sparkles size={14} className="text-orange-500" />
            <p className="text-sky-600 font-black text-[10px] uppercase tracking-[0.4em]">
              Sincronía Familiar Élite
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
                    inputBackground: 'rgba(255,255,255,0.5)',
                    inputText: '#0f172a',
                    inputBorder: '#f1f5f9',
                  },
                  radii: {
                    borderRadiusButton: '1.6rem',
                    buttonBorderRadius: '1.6rem',
                    inputBorderRadius: '1.2rem',
                  }
                } 
              },
              className: {
                button: 'font-black uppercase tracking-[0.15em] text-[11px] py-4 shadow-sm hover:shadow-md transition-all active:scale-95 italic',
                input: 'border-none bg-white/50 px-5 h-14 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 transition-all',
                label: 'text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-4',
                container: 'gap-4',
              }
            }}
            localization={{ 
              variables: { 
                sign_up: { 
                  email_label: 'EMAIL DEL GUÍA', 
                  password_label: 'CONTRASEÑA DE SEGURIDAD',
                  button_label: 'CREAR MI NIDO',
                  link_text: '¿No tienes cuenta? Regístrate',
                },
                sign_in: {
                  email_label: 'EMAIL',
                  password_label: 'CONTRASEÑA',
                  button_label: 'SINCRONIZAR ACCESO',
                  link_text: 'Ya tengo cuenta. Entrar.',
                }
              } 
            }}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100/50 text-center space-y-2">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] leading-relaxed">
            Protección de Grado Militar
          </p>
          <p className="text-[8px] font-bold text-slate-200 uppercase tracking-[0.1em]">
            KidUs © 2026 • Privacidad Blindada
          </p>
        </div>
      </motion.div>
    </div>
  );
};
