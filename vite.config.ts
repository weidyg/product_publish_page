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
        productedit: '/src/pages/product/edit/index.html',
        productmate: '/src/pages/product/mate/index.html'
      },
      output: {
        // manualChunks(id) {
        //   if (id.includes('node_modules')) {
        //     return 'vendor';
        //   }
        // }
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

