/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./providers/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'helm-gold': '#C08D53',     
        'helm-brown': '#BC6E1E',   
        'helm-beige': '#DCBEA7',     
        'helm-dark-red': '#BB4017',  
        'helm-coral': '#D16548', 
        'helm-dark-background': '#241504', 
      },
    },
  },
  plugins: [],
}