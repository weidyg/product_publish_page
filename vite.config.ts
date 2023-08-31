import { defineConfig } from 'vite'
import { vitePluginForArco } from '@arco-plugins/vite-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'es2015'
  },
  plugins: [
    vitePluginForArco({
      modifyVars: {
        prefix: 'erp',
      }
    }),
  ],
})
