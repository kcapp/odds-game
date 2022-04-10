import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // string shorthand
      "/api": {
        target: "http://localhost:9999",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/kcapp-api": {
        target: "http://localhost:8001",
        rewrite: (path) => path.replace(/^\/kcapp-api/, ""),
      },
      // "/socket.io": {
      //   target: "http://localhost:3000",
      //   rewrite: (path) => path.replace(/^\/socket.io/, ""),
      //   ws: true,
      // },
    },
  },
});
