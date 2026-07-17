import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fff7ed",
        chocolate: "#4b2e2a",
        coffee: "#7c4a33",
        rose: "#f6a6bc",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626"
      }
    }
  },
  plugins: []
};

export default config;
