
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react()
  ],
  preview: {
    host: '0.0.0.0',
    cors: true,
    allowedHosts: 'all',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: false, // Completely disable HMR to avoid WebSocket issues in Replit
    proxy: {
      '/api': {
        target: 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../server/shared")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true
  }
});
