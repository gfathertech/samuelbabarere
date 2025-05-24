import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger as createViteInternalLogger } from "vite"; // Renamed createLogger
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../client/vite.config";
import { nanoid } from "nanoid";
import logger from './logger'; // Import pino logger

const viteUserLogger = logger.child({ component: 'vite-setup' }); // Create a child logger for this module
const viteInternalLogger = createViteInternalLogger(); // Keep Vite's own logger for its internal messages

export async function setupVite(app: Express, server: Server) {
  viteUserLogger.info("Setting up Vite server...");
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: { // Use Vite's internal logger for its messages
      ...viteInternalLogger,
      error: (msg, options) => {
        viteInternalLogger.error(msg, options); // Log Vite error
        viteUserLogger.error({ err: options?.error || new Error(msg) }, "Vite setup error, exiting."); // Log with pino
        process.exit(1); // Still exit on Vite error
      },
      // Optionally, you can map other vite internal logs to pino if needed
      // info: (msg) => viteUserLogger.info(msg), 
      // warn: (msg) => viteUserLogger.warn(msg),
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`, // Cache busting for main.tsx
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e: any) {
      vite.ssrFixStacktrace(e as Error);
      viteUserLogger.error({ err: e, url: req.originalUrl }, "Error during Vite HTML transformation");
      next(e);
    }
  });
  viteUserLogger.info("Vite server setup complete.");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  viteUserLogger.info(`Serving static files from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    viteUserLogger.error(`Static files directory not found: ${distPath}. Make sure to build the client first.`);
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
  viteUserLogger.info("Static file serving configured.");
}
