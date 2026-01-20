import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        sm: '2rem',
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "rgba(255, 255, 255, 0.2)", 
        input: "rgba(255, 255, 255, 0.3)",
        ring: "#0EA5E9",
        background: "#F8FAFC", 
        foreground: "#1E293B", 
        primary: {
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F97316",
          foreground: "#FFFFFF",
        },
        kidus: {
          sky: "#0EA5E9",
          vital: "#F97316",
          violet: "#8B5CF6",
          mint: "#10B981", 
          slate: "#F8FAFC",
        },
      },
      borderRadius: {
        "3.5rem": "3.5rem", // Estándar de Identidad KidUs
        "7xl": "3.5rem",   
      },
      boxShadow: {
        'brisa': '0 20px 40px -10px rgba(15, 23, 42, 0.05)',
        'haptic': '0 15px 35px -5px rgba(14, 165, 233, 0.15)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
      },
      backgroundImage: {
        'nido-mesh': 'radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.1) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(249, 115, 22, 0.05) 0, transparent 50%)',
      },
      keyframes: {
        "wave-apple": {
          "0%, 100%": { 
            transform: "translate(0px, 0px) scale(1)",
            borderRadius: "35% 65% 70% 30% / 30% 40% 60% 70%" 
          },
          "50%": { 
            transform: "translate(3% , 5%) scale(1.05)",
            borderRadius: "50% 50% 35% 65% / 55% 55% 45% 45%" 
          },
        },
      },
      animation: {
        "wave-slow": "wave-apple 25s ease-in-out infinite",
        "wave-medium": "wave-apple 18s ease-in-out infinite reverse",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
  ],
} satisfies Config;
