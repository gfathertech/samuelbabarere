
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: process.env.REPLIT_ENVIRONMENT ? 443 : undefined,
      host: process.env.REPLIT_ENVIRONMENT ? process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co' : undefined,
      protocol: process.env.REPLIT_ENVIRONMENT ? 'wss' : undefined,
    },
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../server/shared"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },
});
