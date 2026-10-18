import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08090B",
          900: "#0E1014",
          850: "#13161B",
          800: "#191C23",
          700: "#232832",
          600: "#323945",
        },
        brass: {
          100: "#F4ECDC",
          200: "#EBDDBF",
          300: "#DCC495",
          400: "#C9A96E",
          500: "#B08F55",
          600: "#8E7242",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(60% 50% at 50% 0%, rgba(201,169,110,0.16) 0%, rgba(201,169,110,0) 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
