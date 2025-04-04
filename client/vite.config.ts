
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use environment variable or default for base path
// This is important for GitHub Pages which uses the repo name as the base path
// For GitHub Pages, this should typically be '/repo-name/'
const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  plugins: [
    react()
  ],
  base: basePath, // Sets the base path for GitHub Pages
  preview: {
    host: '0.0.0.0',
    cors: true
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
    },
    allowedHosts: ['localhost', 'replit.dev', 'janeway.replit.dev', 'f73b69b9-0d22-40b4-9cee-03277ee641fe-00-3khz2g7l8fdh2.janeway.replit.dev']
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../server/shared")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true
  }
});
