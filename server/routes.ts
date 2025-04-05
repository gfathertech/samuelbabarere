import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import nodemailer from 'nodemailer';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { Document } from "./schema"; // Import Document model for all-documents endpoint

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  message: z.string().min(1, "Message is required"),
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
  app.post("/api/contact", async (req, res) => {
    try {
      const data = contactSchema.parse(req.body);
      console.log("Contact form submission:", data);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'gfathertech@gmail.com',
          pass: process.env.EMAIL_PASSWORD || ''
        }
      });

      const mailOptions = {
        from: data.email,
        to: 'gfathertech@gmail.com',
        subject: `Contact Form Message from ${data.name}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to send email"
      });
    }
  });

  // Document management routes
  app.post("/api/auth/verify", async (req, res) => {
    try {
      console.log("Verifying admin password...");
      const { password } = req.body;

      if (!password) {
        console.log("No password provided");
        return res.status(400).json({ message: "Password is required" });
      }

      console.log("Checking password: ", password);
      const isValid = await storage.verifyAdminPassword(password);
      console.log("Password validation result:", isValid);

      if (!isValid) {
        return res.status(401).json({ message: "Invalid password" });
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
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const user = req.query.user as string | undefined;
      console.log(`Fetching documents from MongoDB${user ? ` for user: ${user}` : ''}...`);
      // Get documents filtered by user if specified
      const documents = await storage.getDocuments(user);

      // Create a sanitized version of documents without the fileData field
      const sanitizedDocuments = documents.map(doc => ({
        _id: doc._id,
        name: doc.name,
        fileType: doc.fileType,
        createdAt: doc.createdAt,
        user: doc.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      }));

      console.log(`Found ${documents.length} documents`);
      res.json(sanitizedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  
  // TEMPORARY: Get all documents without user filtering (for debugging)
  app.get("/api/all-documents", async (req, res) => {
    try {
      console.log('Fetching ALL documents from MongoDB without user filtering...');
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

      console.log(`Found ${documents.length} total documents in MongoDB`);
      res.json(sanitizedDocuments);
    } catch (error) {
      console.error("Error fetching all documents:", error);
      res.status(500).json({ message: "Failed to fetch all documents" });
    }
  });
  
  // TEMPORARY: Migrate documents without user field to set a default user
  app.post("/api/migrate-documents", async (req, res) => {
    try {
      console.log('Migrating documents in MongoDB to assign user field...');
      const { user } = req.body;
      
      if (!user) {
        return res.status(400).json({ message: "User parameter is required" });
      }
      
      // Find all documents without a user field
      const result = await Document.updateMany(
        { user: { $exists: false } }, // Find documents where user field doesn't exist
        { $set: { user } }             // Set the user field
      );
      
      console.log(`Migration complete: ${result.modifiedCount} documents updated with user: ${user}`);
      res.json({
        success: true,
        modifiedCount: result.modifiedCount,
        user
      });
    } catch (error) {
      console.error("Error migrating documents:", error);
      res.status(500).json({ message: "Failed to migrate documents" });
    }
  });
  
  // TEMPORARY: Set all documents to a specific user (for transferring ownership)
  app.post("/api/transfer-all-documents", async (req, res) => {
    try {
      console.log('Transferring all documents to a new user...');
      const { user } = req.body;
      
      if (!user) {
        return res.status(400).json({ message: "User parameter is required" });
      }
      
      // Update all documents to the specified user
      const result = await Document.updateMany(
        {}, // Match all documents
        { $set: { user } } // Set the user field to the new value
      );
      
      console.log(`Transfer complete: ${result.modifiedCount} documents updated with user: ${user}`);
      res.json({
        success: true,
        modifiedCount: result.modifiedCount,
        user
      });
    } catch (error) {
      console.error("Error transferring documents:", error);
      res.status(500).json({ message: "Failed to transfer documents" });
    }
  });

  // New endpoint to download a specific document by ID
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Downloading document ${id}`);

      const document = await storage.getDocumentById(id);

      if (!document) {
        console.error(`Document ${id} not found for download`);
        return res.status(404).json({ message: "Document not found" });
      }

      if (!document.fileData) {
        console.error(`Document ${id} has no fileData field - this might be a selection issue`);
        return res.status(500).json({ message: "Document data is missing" });
      }

      console.log(`Preparing to send document ${id} of type ${document.fileType}`);

      // Set appropriate headers for the download
      res.setHeader('Content-Type', document.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
      res.setHeader('Cache-Control', 'no-cache');

      // Handle the document's fileData properly based on its type
      try {
        console.log(`FileData type: ${typeof document.fileData}, isBuffer: ${Buffer.isBuffer(document.fileData)}`);

        // Check if it's a Buffer instance or Buffer-like object
        if (Buffer.isBuffer(document.fileData)) {
          console.log(`Document ${id} has fileData as direct Buffer of length: ${document.fileData.length}`);
          return res.send(document.fileData);
        }

        // Handle MongoDB Buffer object (which may not be detected as Buffer by isBuffer)
        else if (document.fileData && typeof document.fileData === 'object' && document.fileData.buffer && document.fileData.type === 'Buffer') {
          console.log(`Document ${id} has fileData as MongoDB Buffer object`);
          const buffer = Buffer.from(document.fileData.buffer);
          console.log(`Successfully created buffer from MongoDB Buffer of length: ${buffer.length}`);
          return res.send(buffer);
        }

        // Handle plain object with buffer property
        else if (document.fileData && typeof document.fileData === 'object' && document.fileData.buffer) {
          console.log(`Document ${id} has fileData with buffer property`);
          const buffer = Buffer.from(document.fileData.buffer);
          console.log(`Created buffer from object buffer property of length: ${buffer.length}`);
          return res.send(buffer);
        }

        // Handle array/buffer data
        else if (document.fileData && typeof document.fileData === 'object' && Array.isArray(document.fileData)) {
          console.log(`Document ${id} has fileData as array`);
          const buffer = Buffer.from(document.fileData);
          console.log(`Created buffer from array data of length: ${buffer.length}`);
          return res.send(buffer);
        }

        // If fileData is a string (from memory storage or older MongoDB format)
        else if (typeof document.fileData === 'string') {
          let fileData = document.fileData;

          // Remove data URL prefix if present
          if (fileData.includes('base64,')) {
            const parts = fileData.split('base64,');
            fileData = parts[1];
            console.log(`Extracted base64 data from data URL`);
          }

          // Convert to buffer and send
          const buffer = Buffer.from(fileData, 'base64');
          console.log(`Successfully converted string data to buffer of length: ${buffer.length}`);
          return res.send(buffer);
        }

        // Last resort - try to stringify and then convert back
        else if (document.fileData) {
          console.log(`Document ${id} has fileData in non-standard format, attempting conversion:`, typeof document.fileData);
          try {
            // Log the structure of the data for debugging
            console.log("FileData structure:", JSON.stringify(document.fileData).substring(0, 100) + "...");

            // Try to create buffer directly from the object
            const buffer = Buffer.from(document.fileData);
            console.log(`Created buffer directly from object of length: ${buffer.length}`);
            return res.send(buffer);
          } catch (err) {
            console.error(`Failed to convert object to buffer:`, err);
            return res.status(500).json({ message: "Could not convert document data format" });
          }
        }

        // Unknown format or no data
        else {
          console.error(`Document ${id} has invalid fileData:`, document.fileData);
          return res.status(500).json({ message: "Document data is missing or in an unprocessable format" });
        }
      } catch (bufferError) {
        console.error(`Error processing document data:`, bufferError);
        return res.status(500).json({ message: "Failed to process document data" });
      }

    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Request to delete document ${id}`);

      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  
  // Sharing functionality
  app.post("/api/documents/:id/share", async (req, res) => {
    try {
      const id = req.params.id;
      const { expirationDays } = req.body;
      console.log(`Creating shareable link for document ${id} with expiration in ${expirationDays || 7} days`);
      
      const shareToken = await storage.createShareableLink(id, expirationDays);
      
      // Create the full shareable URL
      // Just return the share token without the full URL to let the frontend construct it with proper BASE_URL
      // This allows the frontend to build the correct URL depending on the deployment environment
      
      res.json({ 
        success: true, 
        shareToken 
      });
    } catch (error) {
      console.error("Error creating shareable link:", error);
      res.status(500).json({ message: "Failed to create shareable link" });
    }
  });
  
  app.delete("/api/documents/:id/share", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Disabling sharing for document ${id}`);
      
      const success = await storage.disableSharing(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error disabling sharing:", error);
      res.status(500).json({ message: "Failed to disable sharing" });
    }
  });
  
  app.get("/api/shared/:token", async (req, res) => {
    try {
      const token = req.params.token;
      console.log(`Fetching shared document with token: ${token}`);
      
      if (!token || token.length < 10) {
        console.log(`Invalid share token format: ${token}`);
        return res.status(400).json({ message: "Invalid share token format" });
      }
      
      const document = await storage.getDocumentByShareToken(token);
      
      if (!document) {
        console.log(`No valid document found for share token: ${token}`);
        return res.status(404).json({ message: "Shared document not found or link has expired" });
      }
      
      console.log(`Found shared document: ${document._id}, expires: ${document.shareExpiration}`);
      
      // If direct browser access, we won't force a client redirect
      // The browser will be directed via GitHub Pages routing
      if (req.headers.accept?.includes('text/html') && !req.headers['x-requested-with']) {
        // Just return the document data through the API - client rendering will handle the display
        // No redirection needed as we're using client-side routing
      }
      
      // Convert document data to base64 data URL
      const getDataUrl = (fileData: any): string => {
        if (Buffer.isBuffer(fileData)) {
          return `data:${document.fileType};base64,${fileData.toString('base64')}`;
        }
        if (fileData.buffer) {
          return `data:${document.fileType};base64,${Buffer.from(fileData.buffer).toString('base64')}`;
        }
        if (typeof fileData === 'string') {
          return fileData.startsWith('data:') ? fileData : `data:${document.fileType};base64,${fileData}`;
        }
        return '';
      };
      
      const content = getDataUrl(document.fileData);
      
      if (!content) {
        console.error(`Failed to generate content for shared document: ${document._id}`);
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
    } catch (error) {
      console.error("Error fetching shared document:", error);
      res.status(500).json({ message: "Failed to fetch shared document" });
    }
  });

  // Preview endpoint handler
  app.get("/api/documents/:id/preview", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(`Generating preview for document ${id}`);

      const document = await storage.getDocumentById(id);

      if (!document) {
        console.error(`Document ${id} not found for preview`);
        return res.status(404).json({ message: "Document not found" });
      }

      if (!document.fileData) {
        console.error(`Document ${id} has no fileData field`);
        return res.status(500).json({ message: "Document data is missing" });
      }

      // If direct browser access, we won't force a client redirect
      // The browser will be directed via GitHub Pages routing
      if (req.headers.accept?.includes('text/html') && !req.headers['x-requested-with']) {
        // Just return the document data through the API - client rendering will handle the display
        // No redirection needed as we're using client-side routing
      }

      // Convert document data to base64 data URL
      const getDataUrl = (fileData: any): string => {
        if (Buffer.isBuffer(fileData)) {
          return `data:${document.fileType};base64,${fileData.toString('base64')}`;
        }
        if (fileData.buffer) {
          return `data:${document.fileType};base64,${Buffer.from(fileData.buffer).toString('base64')}`;
        }
        if (typeof fileData === 'string') {
          return fileData.startsWith('data:') ? fileData : `data:${document.fileType};base64,${fileData}`;
        }
        return '';
      };

      const content = getDataUrl(document.fileData);
      
      res.json({
        type: document.fileType,
        name: document.name,
        content,
        previewAvailable: !!content,
        user: document.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      });

    } catch (error) {
      console.error("Error generating document preview:", error);
      res.status(500).json({ message: "Failed to generate document preview" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      // Only log the document name, not the entire body with file data
      console.log("Creating new document:", req.body.name);

      const document = await storage.createDocument(req.body);

      // Return document without the large fileData field
      const sanitizedResponse = {
        _id: document._id,
        name: document.name,
        fileType: document.fileType,
        createdAt: document.createdAt,
        user: document.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      };

      console.log("Document created successfully:", sanitizedResponse);
      res.json(sanitizedResponse);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}