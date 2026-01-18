import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem", // Más 'brisa' en los laterales
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Nunito Black para titulares potentes según el nuevo manual
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        border: "rgba(255, 255, 255, 0.4)", // Bordes para Glassmorphism
        input: "#E2E8F0",
        ring: "#0EA5E9",
        background: "#F8FAFC", // Slate 50: Limpio y Zen
        foreground: "#1E293B", // Slate 800: Texto potente
        primary: {
          DEFAULT: "#0EA5E9", // Sky Blue
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F97316", // Vital Orange
          foreground: "#FFFFFF",
        },
        kidus: {
          sky: "#0EA5E9",
          vital: "#F97316",
          violet: "#8B5CF6",
          mint: "#10B981", // Verde para éxito de la tribu
          slate: "#F8FAFC",
        },
        // Colores de la Tribu (Inclusivos y potentes)
        tribu: {
          1: "#0EA5E9",
          2: "#F97316",
          3: "#8B5CF6",
          4: "#10B981",
          5: "#EC4899",
          6: "#F59E0B",
        },
      },
      borderRadius: {
        "2xl": "1rem",     // Inputs
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",   // Botones y Avatares (Manual Zen)
        "6xl": "3rem",
        "7xl": "3.5rem",   // Tarjetas Principales (Brisa orgánica)
      },
      boxShadow: {
        'brisa': '0 8px 32px rgba(15, 23, 42, 0.05)',
        'haptic': '0 20px 40px rgba(14, 165, 233, 0.15)',
        'tribu-card': '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        "wave-apple": {
          "0%, 100%": { 
            transform: "translate(0px, 0px) scale(1)",
            borderRadius: "35% 65% 70% 30% / 30% 40% 60% 70%" 
          },
          "33%": { 
            transform: "translate(2% , 4%) scale(1.03)",
            borderRadius: "50% 50% 35% 65% / 55% 55% 45% 45%" 
          },
          "66%": { 
            transform: "translate(-1%, 6%) scale(0.97)",
            borderRadius: "65% 35% 55% 45% / 40% 35% 65% 60%" 
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        }
      },
      animation: {
        "wave-slow": "wave-apple 22s ease-in-out infinite",
        "wave-medium": "wave-apple 16s ease-in-out infinite reverse",
        "float": "float 7s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backdropBlur: {
        '2xl': '40px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
