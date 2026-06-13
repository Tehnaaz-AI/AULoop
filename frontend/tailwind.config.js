/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        // Theme variables
        page: "var(--bg-page)",
        card: "var(--bg-card)",
        elevated: "var(--bg-elevated)",
        "accent-primary": "var(--accent-primary)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
        "accent-secondary": "var(--accent-secondary)",
        "text-primary": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        border: "var(--border)",
        
        // Override default Tailwind colors that are widely hardcoded
        white: "var(--bg-card)",
        black: "var(--text-primary)",
        slate: {
          50: "var(--bg-elevated)",
          100: "var(--bg-elevated)",
          200: "var(--border)",
          300: "var(--border)",
          400: "var(--text-muted)",
          500: "var(--text-muted)",
          600: "var(--text-muted)",
          700: "var(--text-primary)",
          800: "var(--text-primary)",
          900: "var(--text-primary)",
          950: "var(--text-primary)",
        },
        gray: {
          50: "var(--bg-elevated)",
          100: "var(--bg-elevated)",
          200: "var(--border)",
          300: "var(--border)",
          400: "var(--text-muted)",
          500: "var(--text-muted)",
          600: "var(--text-muted)",
          700: "var(--text-primary)",
          800: "var(--text-primary)",
          900: "var(--text-primary)",
          950: "var(--text-primary)",
        },

        // New primary palette
        ink:    "var(--text-primary)",   
        brand:  "var(--accent-primary)", 
        accent: "var(--accent-secondary)",
        success:"var(--success)", 
        coral:  "var(--danger)", 
        sun:    "var(--warning)", 
        info:   "var(--info)",
        cloud:  "var(--bg-page)", 
        muted:  "var(--text-muted)", 
        // Keep aliases for backward compat
        mint:   "var(--accent-primary)",
        campus: "var(--accent-primary)"
      },
      backgroundImage: {
        'hero': 'var(--hero-gradient)',
      },
      boxShadow: {
        soft:       "0 4px 24px rgba(15, 23, 42, 0.08)",
        card:       "0 1px 8px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.04)",
        "card-hover":"0 8px 32px rgba(15, 23, 42, 0.14)",
        glow:       "0 0 0 3px rgba(37, 99, 235, 0.18)",
        "glow-coral":"0 0 0 3px rgba(244, 63, 94, 0.2)",
        "glow-soft":"0 10px 40px rgba(37, 99, 235, 0.14)",
        "float": "0 20px 50px rgba(15, 23, 42, 0.12)"
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem"
      },
      animation: {
        fadeIn:       "fadeIn 0.3s ease-out",
        slideIn:      "slideIn 0.3s ease-out",
        slideUp:      "slideUp 0.25s ease-out",
        toastIn:      "toastIn 0.28s ease-out",
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow":  "spin 2s linear infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 1.5s linear infinite"
      },
      keyframes: {
        fadeIn:  { "0%": { opacity:"0", transform:"translateY(6px)" },  "100%": { opacity:"1", transform:"translateY(0)" } },
        slideIn: { "0%": { opacity:"0", transform:"translateX(-8px)" }, "100%": { opacity:"1", transform:"translateX(0)" } },
        slideUp: { "0%": { opacity:"0", transform:"translateY(12px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
        toastIn: { "0%": { opacity:"0", transform:"translate(-50%,-12px) scale(0.98)" }, "100%": { opacity:"1", transform:"translate(-50%,0) scale(1)" } },
        "pulse-soft": { "0%,100%": { opacity:"1" }, "50%": { opacity:"0.6" } },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      }
    }
  },
  plugins: []
};
