
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
    runtimeErrorOverlay()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: process.env.REPLIT_ENVIRONMENT ? 443 : undefined,
      host: process.env.REPLIT_ENVIRONMENT ? process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co' : undefined,
      protocol: process.env.REPLIT_ENVIRONMENT ? 'wss' : undefined
    },
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    },
    // Allow any Replit hosts
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.replit.dev',
      '.repl.co',
      '.repl.run',
      '.replit.app',
      '.janeway.replit.dev',
      'f73b69b9-0d22-40b4-9cee-03277ee641fe-00-3khz2g7l8fdh2.janeway.replit.dev'
    ]
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
