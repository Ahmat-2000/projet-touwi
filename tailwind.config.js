/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/team-graphique/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        body: "#efefef",  // Couleur pour le fond du body
        graphe: "#ddf2ff", // Couleur pour le fond des graphes
        'button-light': '#87CEFA', // Bleu clair pour les boutons en haut
        'button-dark': '#1E3A8A',  // Bleu foncé pour les boutons en bas
      },
    },
  },
  plugins: [],
};
