import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Priorizamos Nunito para toda la interfaz KidUs
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      colors: {
        // Bordes ultra-light para ese Glassmorphism premium
        border: "rgba(255, 255, 255, 0.2)", 
        input: "rgba(255, 255, 255, 0.3)",
        ring: "#0EA5E9",
        background: "#F8FAFC", // Slate 50: Paz visual
        foreground: "#1E293B", // Slate 800: Texto con autoridad
        primary: {
          DEFAULT: "#0EA5E9", // Sky Blue
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F97316", // Vital Orange
          foreground: "#FFFFFF",
        },
        // Paleta KidUs Pro
        kidus: {
          sky: "#0EA5E9",
          vital: "#F97316",
          violet: "#8B5CF6",
          mint: "#10B981", 
          slate: "#F8FAFC",
        },
        // Identificadores de la Tribu
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
        "2xl": "1rem",     
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",   
        "6xl": "3rem",
        "7xl": "3.5rem",   // El estándar de oro para las Cards del Nido
      },
      boxShadow: {
        'brisa': '0 8px 32px rgba(15, 23, 42, 0.04)',
        'haptic': '0 20px 40px rgba(14, 165, 233, 0.12)',
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
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
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
  // Añadimos el plugin de tipografía para que las notas del nido se lean perfectas
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
