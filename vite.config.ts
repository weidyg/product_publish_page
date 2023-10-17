import { defineConfig } from 'vite'
import { vitePluginForArco } from '@arco-plugins/vite-react'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2015',
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    host: '192.168.110.110',
  },
  plugins: [
    react(),
    vitePluginForArco({
      theme: '@arco-design/theme-line',
      modifyVars: {
        prefix: 'erp',
      }
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})
