/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "main-background": "url('src/assets/wprdr2.webp')",
        "destination-folder": "url('/destination_folder.jpg')",
        "source-folder": "url('/source_folder.jpg')",
      },
      fontFamily: {
        sans: ['"Chinese Rocks"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
