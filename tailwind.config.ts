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
        sans: ['Inter', 'Nunito', 'system-ui', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        display: ['Nunito', 'Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0EA5E9", // Azul KidUs Oficial
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#F97316", // Naranja KidUs Oficial
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "#F43F5E",
          foreground: "white",
        },
        kidus: {
          blue: "#0EA5E9",
          orange: "#F97316",
          purple: "#8B5CF6",
          teal: "#10B981",
          slate: "#1E293B",
        },
        // Colores para miembros del equipo (mismo que TEAM_COLORS)
        child: {
          blue: "#0EA5E9",
          orange: "#F97316",
          purple: "#8B5CF6",
          green: "#10B981",
          pink: "#EC4899",
          yellow: "#F59E0B",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
        "5xl": "3rem",
        "6xl": "3.5rem",
        "7xl": "4rem", // El radio orgánico de KidUs
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(15, 23, 42, 0.05)',
        'fab': '0 20px 40px rgba(14, 165, 233, 0.3)',
        'card-hover': '0 25px 50px -12px rgba(15, 23, 42, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
      keyframes: {
        // --- EFECTO ONDA APPLE FLUIDA ---
        "wave-apple": {
          "0%": { 
            transform: "translate(0px, 0px) rotate(0deg) scale(1)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" 
          },
          "33%": { 
            transform: "translate(2% , 5%) rotate(2deg) scale(1.05)",
            borderRadius: "50% 50% 30% 70% / 50% 60% 40% 50%" 
          },
          "66%": { 
            transform: "translate(-2%, 8%) rotate(-1deg) scale(0.95)",
            borderRadius: "70% 30% 50% 50% / 30% 30% 70% 70%" 
          },
          "100%": { 
            transform: "translate(0px, 0px) rotate(0deg) scale(1)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" 
          },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-10px) scale(1.02)" },
        }
      },
      animation: {
        "wave-slow": "wave-apple 25s ease-in-out infinite",
        "wave-medium": "wave-apple 18s ease-in-out infinite reverse",
        "wave-fast": "wave-apple 12s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
