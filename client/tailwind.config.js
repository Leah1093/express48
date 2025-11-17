/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        e48: {
          orange: "#FF7A00",
          navy:   "#0E2A47",
          border: "#E6E6E6",
          bg:     "#F6F7FA",
          text:   "#141414",
          sub:    "#6B7280",
        },
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,.06)",
      },
      borderRadius: {
        xl2: "16px",
      },
      fontFamily: {
        Rubik: ["Rubik","sans-serif"],
      },
      container: {
        center: true,
        screens: { lg: "1024px", xl: "1200px", "2xl": "1200px" },
        padding: { DEFAULT: "1rem" },
      },
    },
  },
  plugins: [],
}
