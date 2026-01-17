import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Establecemos Nunito como la fuente principal del Sistema Zen
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F8FAFC", // Slate 50 según manual
        foreground: "#1E293B",
        primary: {
          DEFAULT: "#0EA5E9", // Azul Sky (Oficial)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F97316", // Naranja Vital (Oficial)
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#8B5CF6", // Violeta (Oficial)
          foreground: "#FFFFFF",
        },
        kidus: {
          sky: "#0EA5E9",
          vital: "#F97316",
          violet: "#8B5CF6",
          slate: "#F8FAFC",
          card: "rgba(255, 255, 255, 0.7)",
        },
        // Gama de colores para miembros/avatares según manual
        team: {
          blue: "#0EA5E9",
          orange: "#F97316",
          purple: "#8B5CF6",
          green: "#10B981",
          pink: "#EC4899",
          yellow: "#F59E0B",
        },
      },
      borderRadius: {
        // Geometría orgánica KidUs
        "2xl": "1rem",
        "3xl": "1.5rem",   // Inputs
        "4xl": "2rem",
        "5xl": "2.5rem",   // Botones y Avatares
        "6xl": "3rem",
        "7xl": "3.5rem",   // Tarjetas Principales (Manual Zen)
      },
      boxShadow: {
        'zen': '0 8px 32px rgba(15, 23, 42, 0.05)',
        'kidus': '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
        'elevated': '0 20px 40px rgba(14, 165, 233, 0.15)',
      },
      keyframes: {
        "wave-apple": {
          "0%, 100%": { 
            transform: "translate(0px, 0px) scale(1)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" 
          },
          "33%": { 
            transform: "translate(3% , 5%) scale(1.05)",
            borderRadius: "50% 50% 30% 70% / 50% 60% 40% 50%" 
          },
          "66%": { 
            transform: "translate(-2%, 8%) scale(0.95)",
            borderRadius: "70% 30% 50% 50% / 30% 30% 70% 70%" 
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-15px) scale(1.01)" },
        }
      },
      animation: {
        "wave-slow": "wave-apple 25s ease-in-out infinite",
        "wave-medium": "wave-apple 18s ease-in-out infinite reverse",
        "float": "float 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
