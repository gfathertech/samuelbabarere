import type { Express, NextFunction, Request, Response } from "express"; // Added NextFunction, Request, Response
import { createServer, type Server } from "http";
import logger from './logger'; // Import pino logger
import { storage } from "./storage";
import { z } from "zod";
import nodemailer from 'nodemailer';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { 
  Document, 
  adminLoginSchema, // Import adminLoginSchema
  insertDocumentSchema, // Import insertDocumentSchema
  documentIdParamsSchema, // Import documentIdParamsSchema
  sharedTokenParamsSchema // Import sharedTokenParamsSchema
} from "./schema"; // Import Document model for all-documents endpoint

// Schemas defined in routes.ts
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  message: z.string().min(1, "Message is required"),
});

const getDocumentsQuerySchema = z.object({
  user: z.string().optional(),
});

const migrateDocumentsBodySchema = z.object({
  user: z.string().min(1, "User parameter is required"),
});

const transferDocumentsBodySchema = z.object({
  user: z.string().min(1, "User parameter is required"),
});

const shareBodySchema = z.object({
  expirationDays: z.number().int().min(1).max(30).optional(),
});


export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());
  
  // Simple status endpoint
  app.get("/api/status", (_req, res) => {
    res.json({ status: "operational", timestamp: new Date().toISOString() });
  });
  
  // Health check endpoint - useful for Koyeb to verify the service is running
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      mongodb: (mongoose.connection.readyState === 1) ? 'connected' : 'disconnected'
    });
  });
  app.post("/api/contact", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = contactSchema.parse(req.body);
      logger.info({ contactData: body }, "Contact form submission");

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'gfathertech@gmail.com',
          pass: process.env.EMAIL_PASSWORD || ''
        }
      });

      const mailOptions = {
        from: body.email,
        to: 'gfathertech@gmail.com',
        subject: `Contact Form Message from ${body.name}`,
        text: `Name: ${body.name}\nEmail: ${body.email}\nMessage: ${body.message}`
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error: any) {
      logger.error({ err: error }, "Email sending error");
      if (error instanceof z.ZodError) {
        error.status = 400;
        error.message = "Invalid input: " + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      } else {
        error.status = 400; // Default status for other errors in this handler
        // error.message remains as is or could be generic like "Failed to send email"
      }
      next(error);
    }
  });

  // Document management routes
  app.post("/api/auth/verify", async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Verifying admin password...");
      const body = adminLoginSchema.parse(req.body);

      // Avoid logging password directly in production
      // logger.info("Checking password: ", body.password); 
      const isValid = await storage.verifyAdminPassword(body.password);
      logger.info({ isValid }, "Password validation result");

      if (!isValid) {
        const err: any = new Error("Invalid password");
        err.status = 401;
        return next(err);
      }
      
      // Set auth cookie that expires in 30 minutes
      // Note: For the GitHub Pages setup, we primarily rely on localStorage auth
      // as cookies across domains won't work correctly, but we set this for API auth
      res.cookie('auth', 'true', {
        maxAge: 1800000, // 30 minutes in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none' // Allow cross-site cookie access
      });

      res.json({ success: true });
    } catch (error: any) {
      logger.error({ err: error }, "Authentication error");
      error.status = 500;
      next(error);
    }
  });

  app.get("/api/documents", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = getDocumentsQuerySchema.parse(req.query);
      logger.info(`Fetching documents from MongoDB${query.user ? ` for user: ${query.user}` : ''}...`);
      // Get documents filtered by user if specified
      const documents = await storage.getDocuments(query.user);

      // Create a sanitized version of documents without the fileData field
      const sanitizedDocuments = documents.map(doc => ({
        _id: doc._id,
        name: doc.name,
        fileType: doc.fileType,
        createdAt: doc.createdAt,
        user: doc.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      }));

      logger.info(`Found ${documents.length} documents`);
      res.json(sanitizedDocuments);
    } catch (error: any) {
      logger.error({ err: error }, "Error fetching documents");
      error.status = 500;
      next(error);
    }
  });
  
  // TEMPORARY: Get all documents without user filtering (for debugging)
  app.get("/api/all-documents", async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching ALL documents from MongoDB without user filtering...');
      // Use Mongoose's Document model directly (imported from schema)
      const documents = await Document.find({})
        .select({ fileData: 0 }) // Exclude the large fileData field
        .lean();
      
      // Create a sanitized version of documents
      const sanitizedDocuments = documents.map((doc: any) => ({
        _id: doc._id,
        name: doc.name,
        fileType: doc.fileType,
        createdAt: doc.createdAt,
        user: doc.user || 'NO USER FIELD'
      }));

      logger.info(`Found ${documents.length} total documents in MongoDB`);
      res.json(sanitizedDocuments);
    } catch (error: any) {
      logger.error({ err: error }, "Error fetching all documents");
      error.status = 500;
      next(error);
    }
  });
  
  // TEMPORARY: Migrate documents without user field to set a default user
  app.post("/api/migrate-documents", async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Migrating documents in MongoDB to assign user field...');
      const body = migrateDocumentsBodySchema.parse(req.body);
      
      // Find all documents without a user field
      const result = await Document.updateMany(
        { user: { $exists: false } }, // Find documents where user field doesn't exist
        { $set: { user: body.user } }             // Set the user field
      );
      
      logger.info({ modifiedCount: result.modifiedCount, user: body.user }, `Migration complete`);
      res.json({
        success: true,
        modifiedCount: result.modifiedCount,
        user: body.user
      });
    } catch (error: any) {
      logger.error({ err: error }, "Error migrating documents");
      error.status = 500;
      next(error);
    }
  });
  
  // TEMPORARY: Set all documents to a specific user (for transferring ownership)
  app.post("/api/transfer-all-documents", async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Transferring all documents to a new user...');
      const body = transferDocumentsBodySchema.parse(req.body);
      
      // Update all documents to the specified user
      const result = await Document.updateMany(
        {}, // Match all documents
        { $set: { user: body.user } } // Set the user field to the new value
      );
      
      logger.info({ modifiedCount: result.modifiedCount, user: body.user }, `Transfer complete`);
      res.json({
        success: true,
        modifiedCount: result.modifiedCount,
        user: body.user
      });
    } catch (error: any) {
      logger.error({ err: error }, "Error transferring documents");
      error.status = 500;
      next(error);
    }
  });

  // New endpoint to download a specific document by ID
  app.get("/api/documents/:id/download", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = documentIdParamsSchema.parse(req.params);
      const id = params.id;
      logger.info(`Downloading document ${id}`);

      const document = await storage.getDocumentById(id);

      if (!document) {
        logger.error(`Document ${id} not found for download`);
        const err: any = new Error("Document not found");
        err.status = 404;
        return next(err);
      }

      if (!document.fileData) {
        logger.error(`Document ${id} has no fileData field - this might be a selection issue`);
        const err: any = new Error("Document data is missing");
        err.status = 500;
        return next(err);
      }

      logger.info(`Preparing to send document ${id} of type ${document.fileType}`);

      // Set appropriate headers for the download
      res.setHeader('Content-Type', document.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
      res.setHeader('Cache-Control', 'no-cache');

      // fileData should now be a Buffer or null due to normalization in storage.ts
      if (!document.fileData || !(document.fileData instanceof Buffer)) {
        logger.error(`Processed document data for ${id} is missing, not a Buffer, or normalization failed.`);
        const err: any = new Error("Processed document data is unavailable or corrupted.");
        err.status = 500;
        return next(err);
      }
      
      logger.info(`Sending document ${id} with normalized fileData of length ${document.fileData.length}`);
      res.send(document.fileData);

    } catch (error: any) {
      logger.error({ err: error }, "Error downloading document");
      // If status is not already set by storage layer or previous logic, set a default
      if (!error.status) error.status = 500;
      next(error);
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = documentIdParamsSchema.parse(req.params);
      const id = params.id;
      logger.info(`Request to delete document ${id}`);

      const success = await storage.deleteDocument(id);
      if (!success) {
        const err: any = new Error("Document not found");
        err.status = 404;
        return next(err);
      }

      res.json({ success: true });
    } catch (error: any) {
      logger.error({ err: error }, "Error deleting document");
      error.status = 500;
      next(error);
    }
  });
  
  // Sharing functionality
  app.post("/api/documents/:id/share", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = documentIdParamsSchema.parse(req.params);
      const body = shareBodySchema.parse(req.body);
      const id = params.id;
      
      logger.info(`Creating shareable link for document ${id} with expiration in ${body.expirationDays || 7} days`);
      
      const shareToken = await storage.createShareableLink(id, body.expirationDays);
      
      // Create the full shareable URL
      // Just return the share token without the full URL to let the frontend construct it with proper BASE_URL
      // This allows the frontend to build the correct URL depending on the deployment environment
      
      res.json({ 
        success: true, 
        shareToken 
      });
    } catch (error: any) {
      logger.error({ err: error }, "Error creating shareable link");
      error.status = 500;
      next(error);
    }
  });
  
  app.delete("/api/documents/:id/share", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = documentIdParamsSchema.parse(req.params);
      const id = params.id;
      logger.info(`Disabling sharing for document ${id}`);
      
      const success = await storage.disableSharing(id);
      if (!success) {
        const err: any = new Error("Document not found");
        err.status = 404;
        return next(err);
      }
      
      res.json({ success: true });
    } catch (error: any) {
      logger.error({ err: error }, "Error disabling sharing");
      error.status = 500;
      next(error);
    }
  });
  
  app.get("/api/shared/:token", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = sharedTokenParamsSchema.parse(req.params);
      const token = params.token;
      logger.info(`Fetching shared document with token: ${token}`);
      
      const document = await storage.getDocumentByShareToken(token);
      
      if (!document) {
        logger.warn(`No valid document found for share token: ${token}`);
        const err: any = new Error("Shared document not found or link has expired");
        err.status = 404;
        return next(err);
      }
      
      logger.info(`Found shared document: ${document._id}, expires: ${document.shareExpiration}`);
      
      // If direct browser access, we won't force a client redirect
      // The browser will be directed via GitHub Pages routing
      if (req.headers.accept?.includes('text/html') && !req.headers['x-requested-with']) {
        // Just return the document data through the API - client rendering will handle the display
        // No redirection needed as we're using client-side routing
      }
      
      // Convert document data to base64 data URL
      const getDataUrl = (fileBuffer: Buffer | null | undefined, fileType: string): string => {
        if (!fileBuffer || !(fileBuffer instanceof Buffer)) {
          logger.warn({ fileType, hasFileData: !!fileBuffer }, "Cannot generate data URL from invalid or missing file buffer");
          return ''; 
        }
        return `data:${fileType};base64,${fileBuffer.toString('base64')}`;
      };
      
      const content = getDataUrl(document.fileData, document.fileType);
      
      if (!content) {
        // This condition is now more critical as it implies fileData was null/invalid after normalization
        logger.error(`Failed to generate content for shared document ${document._id} because fileData was invalid or missing post-normalization.`);
        // Potentially send an error response or ensure previewAvailable handles this
      }
      
      // Return document data with preview content
      res.json({
        _id: document._id,
        name: document.name,
        fileType: document.fileType,
        createdAt: document.createdAt,
        type: document.fileType,
        content,
        previewAvailable: !!content,
        user: document.user || 'SHARED', // Mark as shared document
        expiresAt: document.shareExpiration
      });
    } catch (error: any) {
      logger.error({ err: error }, "Error fetching shared document");
      error.status = 500;
      next(error);
    }
  });

  // Preview endpoint handler
  app.get("/api/documents/:id/preview", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = documentIdParamsSchema.parse(req.params);
      const id = params.id;
      logger.info(`Generating preview for document ${id}`);

      const document = await storage.getDocumentById(id);

      if (!document) {
        logger.error(`Document ${id} not found for preview`);
        const err: any = new Error("Document not found");
        err.status = 404;
        return next(err);
      }

      if (!document.fileData) {
        logger.error(`Document ${id} has no fileData field`);
        const err: any = new Error("Document data is missing");
        err.status = 500;
        return next(err);
      }

      // If direct browser access, we won't force a client redirect
      // The browser will be directed via GitHub Pages routing
      if (req.headers.accept?.includes('text/html') && !req.headers['x-requested-with']) {
        // Just return the document data through the API - client rendering will handle the display
        // No redirection needed as we're using client-side routing
      }

      // Convert document data to base64 data URL
      // This function is now identical to the one in /api/shared/:token, consider moving to a shared utility if more uses arise
      const getDataUrl = (fileBuffer: Buffer | null | undefined, fileType: string): string => {
        if (!fileBuffer || !(fileBuffer instanceof Buffer)) {
          logger.warn({ fileType, hasFileData: !!fileBuffer }, "Cannot generate data URL from invalid or missing file buffer for preview");
          return ''; 
        }
        return `data:${fileType};base64,${fileBuffer.toString('base64')}`;
      };

      const content = getDataUrl(document.fileData, document.fileType);
      
      if (!content && document.fileData) { // Log if fileData was present but still failed (should be rare now)
          logger.error(`Failed to generate preview content for document ${id} despite fileData being present post-normalization.`);
      }
      
      res.json({
        type: document.fileType,
        name: document.name,
        content,
        previewAvailable: !!content,
        user: document.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      });

    } catch (error: any) {
      logger.error({ err: error }, "Error generating document preview");
      error.status = 500;
      next(error);
    }
  });

  app.post("/api/documents", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = insertDocumentSchema.parse(req.body);
      // Only log the document name, not the entire body with file data
      logger.info("Creating new document:", body.name);

      const document = await storage.createDocument(body);

      // Return document without the large fileData field
      const sanitizedResponse = {
        _id: document._id,
        name: document.name,
        fileType: document.fileType,
        createdAt: document.createdAt,
        user: document.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      };

      logger.info({ document: sanitizedResponse }, "Document created successfully");
      res.json(sanitizedResponse);
    } catch (error: any) {
      logger.error({ err: error }, "Error creating document");
      if (error instanceof z.ZodError) {
        error.status = 400;
        error.message = "Invalid input: " + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      } else {
        error.status = 500;
      }
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}