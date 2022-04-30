import { fileURLToPath, URL } from "url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      proxy: {
        "/odds-api": {
          target: env.VITE_ODDS_API,
          rewrite: (path) => path.replace(/^\/odds-api/, ""),
        },
        "/kcapp-api": {
          target: env.VITE_KCAPP_API,
          rewrite: (path) => path.replace(/^\/kcapp-api/, ""),
        },
      },
    },
  };
});
