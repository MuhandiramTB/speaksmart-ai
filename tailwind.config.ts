import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        tutorBreathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        tutorBlink: {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "95%": { transform: "scaleY(0.1)" },
        },
        tutorTalk: {
          "0%, 100%": { transform: "translateX(-50%) scaleY(0.6)" },
          "25%": { transform: "translateX(-50%) scaleY(1.2)" },
          "50%": { transform: "translateX(-50%) scaleY(0.4)" },
          "75%": { transform: "translateX(-50%) scaleY(1.1)" },
        },
        tutorBob: {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "40%": { transform: "translateY(-3px)", opacity: "1" },
        },
        tutorPing: {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        tutorBreathe: "tutorBreathe 3s ease-in-out infinite",
        tutorBlink: "tutorBlink 4s ease-in-out infinite",
        tutorTalk: "tutorTalk 0.35s ease-in-out infinite",
        tutorBob: "tutorBob 1.2s ease-in-out infinite",
        tutorPing: "tutorPing 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
