
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file FIRST
dotenv.config();

// Now import db.ts to ensure MongoDB connection is attempted with loaded env vars
import "./db";

const app = express();

// Set up CORS to allow requests from GitHub Pages and other allowed origins
app.use(cors({
  // Accept all origins for now, to make testing easier
  // In a real production environment, you'd want to restrict this
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://samuelbabarere.github.io', 
      'https://portfolio.samuelbabarere.net',
      'http://localhost:5000', 
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS request from origin:', origin);
      // Still allow it for now, but log for debugging
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Increase JSON payload size limit for file uploads (base64 encoded files can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debugging middleware for CORS and options requests
app.use((req: Request, res: Response, next: NextFunction) => {
  // Log all request origins to debug CORS issues
  console.log(`Request from origin: ${req.headers.origin || 'no origin'} to ${req.method} ${req.path}`);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request with headers:', JSON.stringify(req.headers));
  }
  
  next();
});

// Simple logging middleware
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

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // 404 handling for API routes
  app.use('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Start the server
  const port = process.env.PORT || 3000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`API server running on http://0.0.0.0:${port}`);
    console.log(`API is available at http://0.0.0.0:${port}/api`);
  });
})();