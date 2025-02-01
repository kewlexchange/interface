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
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        'glow-line-x': {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
        },
        'glow-line-y': {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scan-line': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        'tech-pulse': {
          '0%, 100%': {
            transform: 'translate(-50%, -50%) scale(0.8)',
            opacity: 0.2,
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(1.2)',
            opacity: 0.4,
          },
        },
        'float-particle': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.3,
          },
          '50%': {
            transform: 'translate(20px, -20px) scale(1.5)',
            opacity: 0.6,
          },
        },
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
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(20px)' },
        },
        'digital-rain': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'quantum-float': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(10px, 10px)' },
          '50%': { transform: 'translate(-5px, 15px)' },
          '75%': { transform: 'translate(-15px, -5px)' },
        },
        'energy-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)' },
        },
        'data-stream': {
          '0%': { opacity: '0', transform: 'translateX(-100%) translateY(-100%)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateX(100%) translateY(100%)' },
        },
        'float-slow': 'float 4s ease-in-out infinite',
        'block-float': 'blockFloat 3s ease-in-out infinite',
        'data-flow': 'dataFlow 2s linear infinite',
        'node-pulse': 'nodePulse 4s ease-in-out infinite',
        'hash-float': 'hashFloat 3s linear infinite',
        'scan-vertical': 'scanVertical 3s linear infinite',
        scroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        blockFloat: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
          '100%': { transform: 'translateY(0)' },
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        nodePulse: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '0.1' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.3' },
        },
        energyPulse: {
          '0%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.1)' },
          '100%': { opacity: '0.3', transform: 'scale(1)' },
        },
        scanVertical: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        gridFlow: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        networkFlow: {
          '0%': { opacity: '0', transform: 'translateX(-100%) translateY(-100%)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateX(100%) translateY(100%)' },
        },
        cubeFloat: {
          '0%, 100%': { transform: 'translateY(0) rotate(45deg)' },
          '50%': { transform: 'translateY(-20px) rotate(45deg)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.1)' },
        },
        reverseSpin: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        hashFloat: {
          '0%': { transform: 'translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(calc(100vw + 200px))', opacity: '0' },
        },
        scanLine: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        circuit: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        digitalRain: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        techPulse: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '0.1' },
        },
        scroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        pulseReverse: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '1' },
        },
        nebula: {
          '0%, 100%': { 
            transform: 'scale(1)', 
            opacity: '0.2' 
          },
          '50%': { 
            transform: 'scale(1.1)', 
            opacity: '0.3' 
          },
        },
        dataStream: {
          '0%': { 
            transform: 'translateY(-100%)' 
          },
          '100%': { 
            transform: 'translateY(100%)' 
          },
        },
        energyWave: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        quantumParticle: {
          '0%, 100%': {
            transform: 'translate(0px, 0px)',
            opacity: '0.6'
          },
          '25%': {
            transform: 'translate(10px, -10px)',
            opacity: '0.8'
          },
          '50%': {
            transform: 'translate(20px, 0px)',
            opacity: '0.6'
          },
          '75%': {
            transform: 'translate(10px, 10px)',
            opacity: '0.8'
          }
        },
        techRing: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: '0.3' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1) rotate(180deg)', opacity: '0.1' },
        },
        corePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.3)', opacity: '0.8' },
        },
        scanVertical: {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        },
        scanHorizontal: {
          '0%': { left: '-10%' },
          '100%': { left: '110%' },
        },
        alienPulse: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        symbolFade: {
          '0%': { opacity: '0', transform: 'scale(0.8) rotate(0deg)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2) rotate(180deg)' },
          '100%': { opacity: '0', transform: 'scale(0.8) rotate(360deg)' },
        },
        bioStream: {
          '0%': { transform: 'translateY(-100%) scaleX(1)' },
          '50%': { transform: 'translateY(0%) scaleX(2)' },
          '100%': { transform: 'translateY(100%) scaleX(1)' },
        },
        containmentField: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.5' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.05)', opacity: '0.3' },
        },
        nanoSwarm: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        scanBeam: {
          '0%': { top: '-20%', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { top: '120%', opacity: '0' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(1.05)' },
        },
        particleFlow: {
          '0%': { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
        scanLine: {
          '0%': { top: '-10%', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { top: '110%', opacity: '0' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(1.05)' },
        },
        quantumPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.02)' },
        },
        matrixFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        quantumStream: {
          '0%': { transform: 'translateY(-100%) scaleY(0)', opacity: '0' },
          '50%': { transform: 'translateY(0%) scaleY(1)', opacity: '1' },
          '100%': { transform: 'translateY(100%) scaleY(0)', opacity: '0' },
        },
        plasmaField: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.05) rotate(180deg)', opacity: '0.8' },
        },
        coreEnergy: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.3)', opacity: '0.8' },
        },
        reactorShield: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) scale(1)' },
        },
        particleQuantum: {
          '0%': { transform: 'rotate(0deg) translateX(200px) rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) translateX(400px) rotate(-180deg) scale(1.5)' },
          '100%': { transform: 'rotate(360deg) translateX(200px) rotate(-360deg) scale(1)' },
        },
        scanAdvanced: {
          '0%': { top: '-5%', opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '100%': { top: '105%', opacity: '0' },
        },
        gridQuantum: {
          '0%, 100%': { opacity: '0.07', transform: 'scale(1.5) rotate(0deg)' },
          '50%': { opacity: '0.12', transform: 'scale(1.6) rotate(1deg)' },
        },
        neuralFlow: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        tunnelFlow: {
          '0%': { transform: 'translate(-50%, -50%) rotateX(75deg) scale(1)', opacity: '0.5' },
          '100%': { transform: 'translate(-50%, -50%) rotateX(75deg) scale(0)', opacity: '0' },
        },
        coreSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        corePulseDelay: {
          '0%': { opacity: '0.2' },
          '100%': { opacity: '0.4' },
        },
        shardFloat: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'translateY(20px) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'translateY(-20px) rotate(360deg)', opacity: '0' },
        },
        waveExpand: {
          '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(100)', opacity: '0' },
        },
        dimensionShift: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.02)' },
        },
        neuralPulse: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        coreGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.1)' },
        },
        barrierPulse: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.02)' },
        },
        quantumFloat: {
          '0%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(30px, -30px)' },
          '66%': { transform: 'translate(-30px, 30px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        mistRise: {
          '0%, 100%': { opacity: '0.3', transform: 'translateY(5%)' },
          '50%': { opacity: '0.5', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%': { top: '-5%', opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '100%': { top: '105%', opacity: '0' },
        },
        voidPulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.02)' },
        },
        lightBeam: {
          '0%': { transform: 'translateY(-100%) scaleY(0)', opacity: '0' },
          '50%': { transform: 'translateY(0) scaleY(1)', opacity: '1' },
          '100%': { transform: 'translateY(100%) scaleY(0)', opacity: '0' },
        },
        neuralPath: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        crystalForm: {
          '0%': { transform: 'rotate(0deg) translateX(0)' },
          '33%': { transform: 'rotate(120deg) translateX(50px)' },
          '66%': { transform: 'rotate(240deg) translateX(-50px)' },
          '100%': { transform: 'rotate(360deg) translateX(0)' },
        },
        crystalGlow: {
          '0%, 100%': { opacity: '0.3', boxShadow: '0 0 20px rgba(139,92,246,0.3)' },
          '50%': { opacity: '0.6', boxShadow: '0 0 40px rgba(139,92,246,0.6)' },
        },
        energyWisp: {
          '0%': { transform: 'rotate(0deg) translateX(0) scale(1)', opacity: '0' },
          '50%': { transform: 'rotate(180deg) translateX(100px) scale(1.5)', opacity: '0.6' },
          '100%': { transform: 'rotate(360deg) translateX(0) scale(1)', opacity: '0' },
        },
        riftPulse: {
          '0%, 100%': { transform: 'scaleX(1)', opacity: '0.3' },
          '50%': { transform: 'scaleX(1.5)', opacity: '0.6' },
        },
        advancedScan: {
          '0%': { top: '-5%', opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '100%': { top: '105%', opacity: '0' },
        },
        plasmaPulse: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.2)' },
        },
        distortionPulse: {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(1.5)' },
        },
        scanSubtle: {
          '0%': { top: '0%', opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        scanMinimal: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        floatMinimal: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(10px, -10px)' },
        },
        mistMinimal: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
        'nebula-pulse': 'nebula 10s ease-in-out infinite',
        'grid-fade': 'grid 20s linear infinite',
        'quantum-field': 'quantum 8s ease-in-out infinite',
        'tech-lines': 'techLines 5s ease-in-out infinite',
        'pulse-ring': 'pulseRing 4s cubic-bezier(0, 0, 0.2, 1) infinite',
        'data-stream': 'dataStream 20s linear infinite',
        'quantum-particle': 'quantumParticle 6s ease-in-out infinite',
        'move-spotlight': 'move-spotlight 12s ease-in-out infinite',
        'diagonal-beam': 'diagonal-beam 8s ease-in-out infinite',
        'float-orb': 'float-orb 8s ease-in-out infinite',
        'glow-line-x': 'glow-line-x 3s ease-in-out infinite',
        'glow-line-y': 'glow-line-y 3s ease-in-out infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-reverse': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite reverse',
        'spin-extremely-slow': 'spin 30s linear infinite',
        'spin-slow': 'spin 15s linear infinite',
        'energy-wave': 'energy-wave 4s ease-in-out infinite',
        'quantum-field': 'quantum-field 10s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'slide-right': 'slide-right 3s ease-in-out infinite',
        'slide-down': 'slide-down 3s ease-in-out infinite',
        'beam-sweep': 'beam-sweep 4s ease-in-out infinite',
        'grid-flow': 'grid-flow 20s linear infinite',
        'grid-flow-reverse': 'grid-flow-reverse 20s linear infinite',
        'grid-flow-slow': 'grid-flow 30s linear infinite',
        'grid-flow-vertical': 'grid-flow-vertical 20s linear infinite',
        'tech-scan': 'tech-scan 4s ease-in-out infinite',
        'circuit-flow': 'circuit-flow 20s linear infinite',
        'core-pulse': 'core-pulse 4s ease-in-out infinite',
        'core-pulse-delay': 'core-pulse 4s ease-in-out infinite 2s',
        'tech-ring': 'tech-ring 20s linear infinite',
        'quantum-particle': 'quantum-particle 6s ease-in-out infinite',
        'circuit-flow': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        'glow-line-x': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'glow-line-y': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'node-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.5)', opacity: '1' },
        },
        'data-stream': {
          '0%': { transform: 'translateY(-100%) translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%) translateX(100%)', opacity: '0' },
        },
        'energy-pulse': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.1)' },
        },
        'tech-ring': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        'float-slow': 'float 20s ease-in-out infinite',
        'float-reverse': 'float 20s ease-in-out infinite reverse',
        'hex-float': 'hexFloat 20s ease-in-out infinite',
        'hex-pulse': 'hexPulse 4s ease-in-out infinite',
        'connection-point': 'connectionPoint 10s ease-in-out infinite',
        'light-shift': 'lightShift 15s ease-in-out infinite',
        'light-shift-reverse': 'lightShift 15s ease-in-out infinite reverse',
        'line-flow': 'lineFlow 10s linear infinite',
        'circuit-pulse': 'circuitPulse 3s linear infinite',
        'circuit-pulse-vertical': 'circuitPulseVertical 3s linear infinite',
        'particle-flow': 'particleFlow 5s linear infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'circuit-glow': 'circuitGlow 3s ease-in-out infinite',
        'circuit-glow-vertical': 'circuitGlowVertical 3s ease-in-out infinite',
        'node-pulse': 'nodePulse 2s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'electric-flow': 'electricFlow 2s linear infinite',
        'electric-flow-vertical': 'electricFlowVertical 2s linear infinite',
        'holo-scan': 'holoScan 3s linear infinite',
        'holo-scan-vertical': 'holoScanVertical 3s linear infinite',
        'holo-glow': 'holoGlow 4s ease-in-out infinite',
        'holo-wave': 'holoWave 8s ease-in-out infinite',
        'holo-float': 'holoFloat 6s ease-in-out infinite',
        twinkle: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.8 },
        },
        energyFlow: {
          '0%, 100%': { transform: 'translateY(0%)', opacity: 0 },
          '50%': { transform: 'translateY(100%)', opacity: 1 },
        },
        hover: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        holoGlow: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
        },
        'circuit-blink': {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 1 },
        },
        'circuit-path': {
          '0%': { opacity: 0, transform: 'scaleX(0)' },
          '50%': { opacity: 1, transform: 'scaleX(1)' },
          '100%': { opacity: 0, transform: 'scaleX(0)' },
        },
        'power-node': {
          '0%, 100%': { transform: 'scale(0.8)', opacity: 0.5 },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
        },
        'energy-burst': {
          '0%': { transform: 'scale(0)', opacity: 0 },
          '10%': { transform: 'scale(1)', opacity: 0.8 },
          '20%': { transform: 'scale(0)', opacity: 0 },
          '100%': { transform: 'scale(0)', opacity: 0 },
        },
        'ping-slow': {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.8 },
        },
        'subtle-glow': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.5)' },
        },
        'subtle-path': {
          '0%, 100%': { opacity: 0 },
          '50%': { opacity: 1 },
        },
        'radar-sweep': {
          '0%': { 
            transform: 'rotate(0deg)',
            opacity: 1
          },
          '50%': {
            opacity: 1
          },
          '100%': { 
            transform: 'rotate(360deg)',
            opacity: 1
          }
        },
        'scan-point': {
          '0%, 100%': { 
            opacity: 0,
            transform: 'scale(0.5)'
          },
          '50%': { 
            opacity: 1,
            transform: 'scale(1.2)'
          }
        },
        'target-detection': {
          '0%, 100%': {
            opacity: 0,
            transform: 'scale(0.8)'
          },
          '10%, 90%': {
            opacity: 1,
            transform: 'scale(1)'
          }
        },
        'target-ping': {
          '0%': {
            transform: 'scale(0.8)',
            opacity: 0.8
          },
          '100%': {
            transform: 'scale(1.5)',
            opacity: 0
          }
        }
      },
      animation: {
        endless: "endless 20s linear infinite",
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        blob: "blob 7s infinite",
        'glow-line-x': 'glow-line-x 3s ease-in-out infinite',
        'glow-line-y': 'glow-line-y 3s ease-in-out infinite',
        'float': 'float 10s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'tech-pulse': 'tech-pulse 4s ease-in-out infinite',
        'float-particle': 'float-particle 5s ease-in-out infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        disco: "disco 1.5s linear infinite",
        "spin-forward": "spin 2s linear infinite",
        'float-slow': 'float 8s ease-in-out infinite',
        'block-float': 'blockFloat 3s ease-in-out infinite',
        'data-flow': 'dataFlow 3s ease-in-out infinite',
        'node-pulse': 'nodePulse 4s ease-in-out infinite',
        'hash-float': 'hashFloat 3s linear infinite',
        'energy-pulse': 'energyPulse 4s ease-in-out infinite',
        'scan-vertical': 'scanVertical 4s linear infinite',
        'scroll-slow': 'scroll 10s linear infinite',
        'grid-flow': 'gridFlow 20s linear infinite',
        'network-flow': 'networkFlow 4s linear infinite',
        'cube-float': 'cubeFloat 6s ease-in-out infinite',
        'spin-slow': 'spin 10s linear infinite',
        'reverse-spin': 'reverseSpin 15s linear infinite',
        'scan-line': 'scanLine 4s ease-in-out infinite',
        'float-slow-reverse': 'float 10s ease-in-out infinite reverse',
        'circuit-flow': 'circuit-flow 20s linear infinite',
        'digital-rain': 'digitalRain 3s linear infinite',
        'scan-line-bright': 'scanLine 3s ease-out infinite',
        'tech-pulse-bright': 'techPulse 4s ease-in-out infinite',
        'energy-pulse': 'energyPulse 4s ease-in-out infinite',
        'scroll-slow': 'scroll 20s linear infinite',
        'pulse-reverse': 'pulseReverse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'nebula': 'nebula 10s ease infinite',
        'energy-wave': 'energyWave 3s ease-out infinite',
        'quantum-particle': 'quantumParticle 4s ease-in-out infinite',
        'tech-ring': 'tech-ring 6s ease-in-out infinite',
        'core-pulse': 'corePulse 4s ease-in-out infinite',
        'core-pulse-reverse': 'corePulse 4s ease-in-out infinite reverse',
        'scan-horizontal': 'scanHorizontal 4s linear infinite',
        'spin-slower': 'spin 20s linear infinite',
        'alien-pulse': 'alienPulse 4s ease-in-out infinite',
        'symbol-fade': 'symbolFade 8s ease-in-out infinite',
        'bio-stream': 'bioStream 3s ease-in-out infinite',
        'containment-field': 'containmentField 8s ease-in-out infinite',
        'nano-swarm': 'nanoSwarm 10s linear infinite',
        'scan-beam': 'scanBeam 4s ease-in-out infinite',
        'grid-pulse': 'gridPulse 5s ease-in-out infinite',
        'particle-flow': 'particleFlow 10s linear infinite',
        'quantum-pulse': 'quantumPulse 8s ease-in-out infinite',
        'quantum-spin': 'spin 30s linear infinite',
        'matrix-flow': 'matrixFlow 20s linear infinite',
        'matrix-flow-reverse': 'matrixFlow 25s linear infinite reverse',
        'quantum-stream': 'quantumStream 4s ease-out infinite',
        'plasma-field': 'plasmaField 10s ease-in-out infinite',
        'core-energy': 'coreEnergy 6s ease-in-out infinite',
        'core-energy-reverse': 'coreEnergy 8s ease-in-out infinite reverse',
        'core-energy-fast': 'coreEnergy 4s ease-in-out infinite',
        'reactor-shield': 'reactorShield 15s linear infinite',
        'particle-quantum': 'particleQuantum 20s linear infinite',
        'scan-advanced': 'scanAdvanced 5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'grid-quantum': 'gridQuantum 8s ease-in-out infinite',
        'slow-spin': 'spin 20s linear infinite',
        'neural-flow': 'neuralFlow 3s ease-in-out infinite',
        'tunnel-flow': 'tunnelFlow 8s linear infinite',
        'core-spin': 'spin 15s linear infinite',
        'core-pulse-delay': 'corePulse 4s ease-in-out infinite 2s',
        'shard-float': 'shardFloat 6s ease-in-out infinite',
        'wave-expand': 'waveExpand 4s ease-out infinite',
        'dimension-shift': 'dimensionShift 8s ease-in-out infinite',
        'neural-pulse': 'neuralPulse 3s ease-in-out infinite',
        'core-glow': 'coreGlow 6s ease-in-out infinite',
        'core-glow-alt': 'coreGlow 8s ease-in-out infinite reverse',
        'core-glow-fast': 'coreGlow 4s ease-in-out infinite',
        'barrier-pulse': 'barrierPulse 4s ease-in-out infinite',
        'mist-rise': 'mistRise 10s ease-in-out infinite',
        'scan-line': 'scanLine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'void-pulse': 'voidPulse 8s ease-in-out infinite',
        'light-beam': 'lightBeam 4s ease-in-out infinite',
        'neural-path': 'neuralPath 3s linear infinite',
        'crystal-form': 'crystalForm 10s linear infinite',
        'crystal-glow': 'crystalGlow 4s ease-in-out infinite',
        'energy-wisp': 'energyWisp 8s ease-in-out infinite',
        'rift-pulse': 'riftPulse 5s ease-in-out infinite',
        'advanced-scan': 'advancedScan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'plasma-pulse': 'plasmaPulse 8s ease-in-out infinite',
        'distortion-pulse': 'distortionPulse 15s ease-in-out infinite',
        'scan-subtle': 'scanSubtle 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'scan-minimal': 'scanMinimal 15s linear infinite',
        'float-minimal': 'floatMinimal 8s ease-in-out infinite',
        'mist-minimal': 'mistMinimal 8s ease-in-out infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'energy-flow': 'energyFlow 3s ease-in-out infinite',
        'hover-slow': 'hover 6s ease-in-out infinite',
        'ping-slow': 'ping 3s ease-in-out infinite',
        'progress': 'progress 4s ease-in-out infinite',
        'holo-glow': 'holoGlow 3s ease-in-out infinite',
        'circuit-blink': 'circuit-blink 1s ease-in-out infinite',
        'circuit-path': 'circuit-path 3s ease-in-out infinite',
        'power-node': 'power-node 20s ease-in-out infinite',
        'energy-burst': 'energy-burst 30s ease-in-out infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
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
