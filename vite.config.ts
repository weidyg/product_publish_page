import { defineConfig } from 'vite'
import { vitePluginForArco } from '@arco-plugins/vite-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vitePluginForArco({
      modifyVars: {
        prefix: 'erp',
      }
    }),
  ],
})
