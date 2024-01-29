import { defineConfig } from 'vite'
import { vitePluginForArco } from '@arco-plugins/vite-react'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@Project', replacement: '/src/Project' }
    ]
  },
  build: {
    target: 'es2015',
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      input: {
        productedit: '/productedit.html',
        productmate: '/productmate.html',
        productcatesel: '/productcatesel.html',
        wmsrateedit: '/wmsrateedit.html',
      }
    }
  },
  server: {
    host: '192.168.110.110',
  },
  plugins: [
    react(),
    vitePluginForArco({
      theme: '../../../../../src/styles',
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

