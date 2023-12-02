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
        productedit: "/src/pages/product/edit/index.html",
        productmate: "/src/pages/product/mate/index.html"
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDb2Rlc1xcXFxVSWRlbW9cXFxccmVhY3QtZGVtb1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcQ29kZXNcXFxcVUlkZW1vXFxcXHJlYWN0LWRlbW9cXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L0NvZGVzL1VJZGVtby9yZWFjdC1kZW1vL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHZpdGVQbHVnaW5Gb3JBcmNvIH0gZnJvbSAnQGFyY28tcGx1Z2lucy92aXRlLXJlYWN0J1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbXG4gICAgICB7IGZpbmQ6ICdAJywgcmVwbGFjZW1lbnQ6ICcvc3JjJyB9LFxuICAgICAgeyBmaW5kOiAnQFByb2plY3QnLCByZXBsYWNlbWVudDogJy9zcmMvUHJvamVjdCcgfVxuICAgIF1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjA0OCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBwcm9kdWN0ZWRpdDogJy9zcmMvcGFnZXMvcHJvZHVjdC9lZGl0L2luZGV4Lmh0bWwnLFxuICAgICAgICBwcm9kdWN0bWF0ZTogJy9zcmMvcGFnZXMvcHJvZHVjdC9tYXRlL2luZGV4Lmh0bWwnXG4gICAgICB9LFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6ICcxOTIuMTY4LjExMC4xMTAnLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB2aXRlUGx1Z2luRm9yQXJjbyh7XG4gICAgICB0aGVtZTogJy4uLy4uLy4uLy4uLy4uL3NyYy9zdHlsZXMnLFxuICAgICAgbW9kaWZ5VmFyczoge1xuICAgICAgICBwcmVmaXg6ICdlcnAnLFxuICAgICAgfVxuICAgIH0pLFxuICBdLFxuICBjc3M6IHtcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBsZXNzOiB7XG4gICAgICAgIGphdmFzY3JpcHRFbmFibGVkOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSlcblxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3USxTQUFTLG9CQUFvQjtBQUNyUyxTQUFTLHlCQUF5QjtBQUNsQyxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsRUFBRSxNQUFNLEtBQUssYUFBYSxPQUFPO0FBQUEsTUFDakMsRUFBRSxNQUFNLFlBQVksYUFBYSxlQUFlO0FBQUEsSUFDbEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUix1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsTUFDZjtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFJO0FBQ2YsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixrQkFBa0I7QUFBQSxNQUNoQixPQUFPO0FBQUEsTUFDUCxZQUFZO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILHFCQUFxQjtBQUFBLE1BQ25CLE1BQU07QUFBQSxRQUNKLG1CQUFtQjtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
