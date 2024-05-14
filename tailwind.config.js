/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
module.exports = {
  mode: 'jit',
  important: true,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"

  ],
  theme: {
    extend: {
      fontFamily: {
        'poppins': ["Poppins", 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'incon': ['Inconsolata', 'monospace'],
        'ubuntu': ['Source Sans Pro', 'sans-serif']
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        '30': 'repeat(30, minmax(0, 1fr))',
        'header-cols': '1fr 3fr 2fr',
        'swap': '3fr 4fr',

      },
      backgroundImage: {
        "gradient-conic": "conic-gradient(var(--conic-position), var(--tw-gradient-stops))",
        "gradient-radial-top": "radial-gradient(100% 60% at 100% 0%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        disco: {
          "0%": { transform: "translateY(-50%) rotate(0deg)" },
          "100%": { transform: "translateY(-50%) rotate(360deg)" },
        },
        spin: {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        endless: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-245px)" },
        },
      },
      animation: {
        endless: "endless 20s linear infinite",

        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        disco: "disco 1.5s linear infinite",
        "spin-forward": "spin 2s linear infinite",
      },
      colors:{
        primary:{
          '50': '#fafafa',
          '100': '#f4f4f5',
          '200': '#e4e4e7',
          '300': '#d4d4d8',
          '400': '#a1a1aa',
          '500': '#71717a',
          '600': '#52525b',
          '700': '#3f3f46',
          '800': '#27272a',
          '900': '#18181b',
          '950': '#09090b'
        },
        'dark-bg': '#2B2E36',
        'footer-bg': '#050523',
        'box-bg': '#32363F',
        'greennumber':{
          "100":'#273039',
          "200":'#B3EB7C',
        },
        'pinknumber':{
          "100":'#331540',
          "200":'#E73697',
        },
        'body-bg' : '#000',
        'pink': {
          "1000": "#b30655",
          "900": "#c5075d",
          "800": "#d90866",
          "700": "#ec096f",
          "600": "#f61379",
          "500": "#f72b86",
          "400": "#f94e9b",
          "300": "#fa5ea4",
          "200": "#fa6dac",
          "100": "#fa7ab4",
          '950': '#331540',
          '960' :'#FF1256'
        },
      
        'blue' : {
          '700' : '#8B5EF9',
          '800' : '#3B347A',
          '850' : '#0E0E2F',
          '900' : '#262059',
          '950' : '#1E194A',
          '1000': '#05051F'
        },
        'indigo' : {
          '900' : '#6A00FF'
        },
        'sky-blue':{
          '800' : '#32DCEC'
        }
      }
    },
  },
  darkMode: "class",
  plugins: [
    require("tailwindcss-animate"),
    nextui( nextui({
      themes: {
        "purple-dark": {
          extend: "dark", // <- inherit default values from dark theme
          colors: {
            background: "#0D001A",
            foreground: "#ffffff",
            primary: {
              50: "#3B096C",
              100: "#520F83",
              200: "#7318A2",
              300: "#9823C2",
              400: "#c031e2",
              500: "#DD62ED",
              600: "#F182F6",
              700: "#FCADF9",
              800: "#FDD5F9",
              900: "#FEECFE",
              DEFAULT: "#DD62ED",
              foreground: "#ffffff",
            },
            focus: "#F182F6",
          },
          layout: {
            disabledOpacity: "0.3",
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
      },
    }),)

]
}
