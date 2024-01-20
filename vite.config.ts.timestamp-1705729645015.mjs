// vite.config.ts
import { defineConfig } from "file:///D:/Codes/UIdemo/react-demo/node_modules/vite/dist/node/index.js";
import { vitePluginForArco } from "file:///D:/Codes/UIdemo/react-demo/node_modules/@arco-plugins/vite-react/lib/index.js";
import react from "file:///D:/Codes/UIdemo/react-demo/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  resolve: {
    alias: [
      { find: "@", replacement: "/src" },
      { find: "@Project", replacement: "/src/Project" }
    ]
  },
  build: {
    target: "es2015",
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      input: {
        productedit: "/productedit.html",
        productmate: "/productmate.html",
        productcatesel: "/productcatesel.html"
      }
    }
  },
  server: {
    host: "192.168.110.110"
  },
  plugins: [
    react(),
    vitePluginForArco({
      theme: "../../../../../src/styles",
      modifyVars: {
        prefix: "erp"
      }
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDb2Rlc1xcXFxVSWRlbW9cXFxccmVhY3QtZGVtb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQ29kZXNcXFxcVUlkZW1vXFxcXHJlYWN0LWRlbW9cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0NvZGVzL1VJZGVtby9yZWFjdC1kZW1vL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHZpdGVQbHVnaW5Gb3JBcmNvIH0gZnJvbSAnQGFyY28tcGx1Z2lucy92aXRlLXJlYWN0J1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbXG4gICAgICB7IGZpbmQ6ICdAJywgcmVwbGFjZW1lbnQ6ICcvc3JjJyB9LFxuICAgICAgeyBmaW5kOiAnQFByb2plY3QnLCByZXBsYWNlbWVudDogJy9zcmMvUHJvamVjdCcgfVxuICAgIF1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjA0OCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBwcm9kdWN0ZWRpdDogJy9wcm9kdWN0ZWRpdC5odG1sJyxcbiAgICAgICAgcHJvZHVjdG1hdGU6ICcvcHJvZHVjdG1hdGUuaHRtbCcsXG4gICAgICAgIHByb2R1Y3RjYXRlc2VsOiAnL3Byb2R1Y3RjYXRlc2VsLmh0bWwnLFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzE5Mi4xNjguMTEwLjExMCcsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIHZpdGVQbHVnaW5Gb3JBcmNvKHtcbiAgICAgIHRoZW1lOiAnLi4vLi4vLi4vLi4vLi4vc3JjL3N0eWxlcycsXG4gICAgICBtb2RpZnlWYXJzOiB7XG4gICAgICAgIHByZWZpeDogJ2VycCcsXG4gICAgICB9XG4gICAgfSksXG4gIF0sXG4gIGNzczoge1xuICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcbiAgICAgIGxlc3M6IHtcbiAgICAgICAgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KVxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdRLFNBQVMsb0JBQW9CO0FBQ3JTLFNBQVMseUJBQXlCO0FBQ2xDLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxFQUFFLE1BQU0sS0FBSyxhQUFhLE9BQU87QUFBQSxNQUNqQyxFQUFFLE1BQU0sWUFBWSxhQUFhLGVBQWU7QUFBQSxJQUNsRDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixrQkFBa0I7QUFBQSxNQUNoQixPQUFPO0FBQUEsTUFDUCxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLG1CQUFtQjtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
