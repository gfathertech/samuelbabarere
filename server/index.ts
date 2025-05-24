import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite"; // Removed log import
import logger from './logger'; // Import pino logger
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file FIRST
dotenv.config();

// Now import db.ts to ensure MongoDB connection is attempted with loaded env vars
import "./db";

const app = express();

// Define CORS origins based on environment
const productionOrigins = [
  'https://samuelbabarere.github.io', 
  'https://portfolio.samuelbabarere.net'
];
const developmentOrigins = [
  'https://samuelbabarere.github.io', 
  'https://portfolio.samuelbabarere.net',
  'http://localhost:5000', 
  'http://localhost:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000'
];

const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? productionOrigins 
  : developmentOrigins;

// Log the CORS configuration being used
logger.info(
  { 
    allowedOrigins, 
    environment: process.env.NODE_ENV || 'development' 
  }, 
  "CORS configured with allowed origins"
);

// Set up CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Increase JSON payload size limit for file uploads (base64 encoded files can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logData: any = {
        method: req.method,
        path,
        status: res.statusCode,
        durationMs: duration,
      };
      if (capturedJsonResponse) {
        // Only include response if it's not excessively large, or summarize it
        const responseStr = JSON.stringify(capturedJsonResponse);
        if (responseStr.length < 1000) { // Example limit
          logData.response = capturedJsonResponse;
        } else {
          logData.responsePreview = responseStr.substring(0, 100) + "...";
        }
      }
      logger.info(logData, `${req.method} ${path} ${res.statusCode} - ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error details
    logger.error({
      err, // pino will automatically handle error serialization including stack
      method: req.method,
      path: req.path,
      status, // include status in the log object
    }, `Error during ${req.method} ${req.path}: ${message}`);

    res.status(status).json({ status, message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info(`Server listening on port ${port}`);
  });
})();
