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
        display: ['Nunito', 'Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        kidus: {
          blue: "hsl(var(--kidus-blue))",
          "blue-light": "hsl(var(--kidus-blue-light))",
          orange: "hsl(var(--kidus-orange))",
          cream: "hsl(var(--kidus-cream))",
          teal: "hsl(var(--kidus-teal))",
        },
        child: {
          blue: "hsl(var(--child-blue))",
          pink: "hsl(var(--child-pink))",
          green: "hsl(var(--child-green))",
          purple: "hsl(var(--child-purple))",
          yellow: "hsl(var(--child-yellow))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        'glass': '0 8px 32px hsl(var(--glass-shadow))',
        'fab': '0 8px 24px hsl(var(--kidus-blue) / 0.4)',
        'card-hover': '0 12px 40px hsl(var(--kidus-blue) / 0.15)',
      },
      keyframes: {
        // --- NUEVAS KEYFRAMES PARA EL MODO ZEN ---
        "wave-blob": {
          "0%": { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1) rotate(2deg)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9) rotate(-2deg)" },
          "100%": { transform: "translate(0px, 0px) scale(1) rotate(0deg)" },
        },
        // --- TUS KEYFRAMES ORIGINALES ---
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        // --- NUEVAS ANIMACIONES ZEN ---
        "wave-slow": "wave-blob 25s infinite alternate ease-in-out",
        "wave-medium": "wave-blob 18s infinite alternate-reverse ease-in-out",
        "wave-fast": "wave-blob 12s infinite alternate ease-in-out",
        // --- TUS ANIMACIONES ORIGINALES ---
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
