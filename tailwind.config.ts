import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        flesh: "#E8C4A0",
        rose: "#C45B6E",
        blush: "#F2D1D1",
        steel: "#71797E",
        cream: "#FFFDD0",
      },
    },
  },
  plugins: [],
};

export default config;
