import { useEffect } from "react"; // Añadimos useEffect
import { supabase } from "@/lib/supabase"; // Volvemos a tu ruta base para evitar conflictos
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";

export const AuthView = () => {
  // Truco para feedback háptico en componentes externos
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Si clicamos un botón dentro del contenedor de auth
      if (target.closest('.auth-container button')) {
        if (window.navigator.vibrate) window.navigator.vibrate(10);
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 px-6 font-sans">
      {/* Elementos decorativos de fondo (Atmósfera KidUs) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100/50 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white/80 backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-white"
      >
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex p-4 bg-sky-500 rounded-[1.8rem] text-white shadow-xl shadow-sky-100 mb-2">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">KidUs</h1>
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
                  },
                  radii: {
                    borderRadiusButton: '1.5rem',
                    buttonPadding: '1rem',
                    inputBorderRadius: '1.2rem',
                  }
                } 
              },
              className: {
                button: 'font-bold uppercase tracking-widest text-[10px] py-4 shadow-md hover:shadow-lg transition-all',
                input: 'bg-slate-50 border-none px-5 h-14 text-sm',
                label: 'text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-4',
              }
            }}
            providers={[]}
            localization={{ 
              variables: { 
                sign_up: { 
                  email_label: 'Email del Guía', 
                  password_label: 'Contraseña de seguridad',
                  button_label: 'Crear mi Nido',
                },
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Contraseña',
                  button_label: 'Sincronizar Acceso',
                }
              } 
            }}
          />
        </div>

        <p className="mt-10 text-center text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em] leading-relaxed">
          Seguridad de grado militar <br /> para tu nido familiar.
        </p>
      </motion.div>
    </div>
  );
};
