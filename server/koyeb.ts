import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file FIRST
dotenv.config();

// Now import db.ts to ensure MongoDB connection is attempted with loaded env vars
import "./db";

const app = express();
// Set up CORS to allow requests from GitHub Pages
app.use(cors({
  origin: [
    'https://samuelbabarere.github.io', 
    'https://portfolio.samuelbabarere.net',
    'http://localhost:5000', 
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Increase JSON payload size limit for file uploads (base64 encoded files can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // For production deployment on Koyeb, we only need the API routes
  // No need for Vite setup or static file serving since frontend is on GitHub Pages

  // ALWAYS serve the app on port 5000
  // this serves the API endpoints only.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`API server running on port ${port}`);
  });
})();