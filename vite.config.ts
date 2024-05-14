import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
const path = require('path')

export default defineConfig({
  define: {
    'process.env': {}
  },
  server: {
    host: true,
    port:3000
  },
  build: {
    target: ["esnext"], // 👈 build.target
    minify: false,
    outDir: './build',
    sourcemap:false
  },

  optimizeDeps: { // 👈 optimizedeps
    esbuildOptions: {
      target: "esnext",
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      supported: {
        bigint: true
      },
    }
  },

  plugins: [
      reactRefresh(),
  ],
  resolve: {
    alias: {
      '@walletconnect/ethereum-provider': '../../../@walletconnect/ethereum-provider/dist/index.es.js',
      '@walletconnect/utils': '../../../@walletconnect/utils/dist/index.umd.js',
      '@': path.resolve(__dirname, './src'),
    }
  }
})
