import type { Config } from "tailwindcss";

// Design tokens dari logo rasmi KabinetCantik (2025).
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1320", // navy — badge, footer, hero overlay, teks
        "ink-soft": "#141d30",
        "ink-line": "#25324a",
        brass: "#AE873B", // accent utama — CTA, garis, ikon
        "brass-lite": "#C99F52",
        tan: "#CFAD8A", // wordmark, teks atas navy
        "gold-shadow": "#7D6845",
        paper: "#FAF8F4", // base terang halaman
        "off-white": "#F7F7F7",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cinzel", "serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      maxWidth: { content: "1180px" },
    },
  },
  plugins: [],
};

export default config;
