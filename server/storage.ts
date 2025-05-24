import { type InsertDocument, Document, Admin, IDocument, ShareDocument } from "./schema";
import * as bcrypt from "bcrypt";
import mongoose from "mongoose";
import crypto from "crypto";
import logger from './logger'; // Import pino logger

export interface IStorage {
  getDocuments(user?: string): Promise<any[]>;
  createDocument(doc: InsertDocument): Promise<any>;
  getDocumentById(id: string): Promise<any>;
  verifyAdminPassword(password: string): Promise<boolean>;
  initializeAdminPassword(defaultPassword: string): Promise<void>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Sharing functionality
  createShareableLink(docId: string, expirationDays?: number): Promise<string>;
  getDocumentByShareToken(token: string): Promise<any>;
  disableSharing(docId: string): Promise<boolean>;
}

// MongoDB implementation
export class MongoDBStorage implements IStorage {

  private _normalizeFileDataToBuffer(fileData: any): Buffer | null {
    if (!fileData) {
      logger.warn("Normalization received null or undefined fileData.");
      return null;
    }

    if (fileData instanceof Buffer) {
      logger.info("fileData is already a Buffer.");
      return fileData;
    }

    // Handle MongoDB Buffer object (which may not be detected as Buffer by isBuffer)
    // BSON.Binary typically has a .buffer property that is a Buffer
    if (fileData.buffer && fileData.buffer instanceof Buffer) {
        logger.info("fileData is a BSON.Binary or similar wrapper, extracting buffer.");
        return fileData.buffer;
    }
    
    // Handle array/buffer data (e.g., from older formats or specific drivers)
    if (Array.isArray(fileData)) {
      logger.info("fileData is an array, converting to Buffer.");
      return Buffer.from(fileData);
    }

    // Handle string (assuming base64 encoded, potentially with data URL prefix)
    if (typeof fileData === 'string') {
      logger.info("fileData is a string, attempting base64 conversion.");
      let base64Data = fileData;
      if (fileData.includes('base64,')) {
        base64Data = fileData.split('base64,')[1];
        logger.info("Removed data URL prefix from string.");
      }
      try {
        const buffer = Buffer.from(base64Data, 'base64');
        logger.info(`Successfully converted base64 string to buffer of length: ${buffer.length}`);
        return buffer;
      } catch (err) {
        logger.error({ err }, "Failed to convert base64 string to Buffer during normalization.");
        return null;
      }
    }
    
    // If it's an object but not a recognized buffer wrapper, and doesn't have a buffer property, log and return null
    if (typeof fileData === 'object') {
        logger.warn({ type: typeof fileData, keys: Object.keys(fileData) }, "fileData is an unrecognized object structure for buffer normalization.");
        return null;
    }

    logger.warn({ type: typeof fileData }, "fileData is of an unhandled type for normalization.");
    return null;
  }

  async getDocuments(user?: string): Promise<any[]> {
    logger.info(`Fetching documents from MongoDB${user ? ` for user: ${user}` : ''}...`);
    try {
      let query = {};
      
      // If user is specified, filter by user
      if (user) {
        query = { user };
      }
      
      const documents = await Document.find(query)
        .sort({ createdAt: -1 })
        .lean();

      logger.info(`Found ${documents.length} documents${user ? ` for user ${user}` : ''}`);
      return documents;
    } catch (error: any) {
      logger.error({ err: error }, 'Error fetching documents');
      throw error;
    }
  }
  
  // Generate a secure random token
  private generateShareToken(): string {
    return crypto.randomBytes(24).toString('hex');
  }
  
  async createShareableLink(docId: string, expirationDays: number = 7): Promise<string> {
    logger.info(`Creating shareable link for document ${docId} with expiration in ${expirationDays} days`);
    try {
      // Find the document to ensure it exists
      const document = await Document.findById(docId);
      if (!document) {
        logger.warn(`Document ${docId} not found`);
        throw new Error('Document not found');
      }
      
      // Generate a secure token
      const shareToken = this.generateShareToken();
      
      // Calculate expiration date (default: 7 days from now)
      const shareExpiration = new Date();
      shareExpiration.setDate(shareExpiration.getDate() + expirationDays);
      
      logger.info(`Setting expiration date to: ${shareExpiration.toISOString()} (${expirationDays} days from now)`);
      
      // Update the document with sharing information
      document.shareEnabled = true;
      document.shareToken = shareToken;
      document.shareExpiration = shareExpiration;
      await document.save();
      
      // Verify expiration date was saved correctly
      const updatedDoc = await Document.findById(docId);
      if (updatedDoc && updatedDoc.shareExpiration) {
        logger.info(`Verified document ${docId} expiration date: ${updatedDoc.shareExpiration.toISOString()}`);
      }
      
      logger.info(`Shareable link created for document ${docId} with token: ${shareToken}`);
      return shareToken;
    } catch (error: any) {
      logger.error({ err: error, docId }, `Error creating shareable link for document`);
      throw error;
    }
  }
  
  async getDocumentByShareToken(token: string): Promise<any> {
    logger.info(`Fetching document by share token: ${token}`);
    try {
      const now = new Date();
      logger.info(`Current date for comparison: ${now.toISOString()}`);
      
      // Find document by share token
      const document = await Document.findOne({ 
        shareToken: token,
        shareEnabled: true,
        shareExpiration: { $gt: now } // Check if token hasn't expired
      })
      .select('+fileData')
      .lean();
      
      if (!document) {
        logger.warn(`No valid document found for share token: ${token}`);
        return null;
      }
      
      if (document.fileData) {
        const normalizedBuffer = this._normalizeFileDataToBuffer(document.fileData);
        if (normalizedBuffer) {
          document.fileData = normalizedBuffer;
          logger.info(`Document ${document._id} fileData normalized for share token: ${token}`);
        } else {
          logger.error(`Failed to normalize fileData for document ${document._id} (share token ${token}). fileData will be null.`);
          document.fileData = null; 
        }
      }
      
      logger.info(`Found document ${document._id} via share token. Expiration: ${document.shareExpiration}`);
      return document;
    } catch (error: any) {
      logger.error({ err: error, token }, `Error fetching document by share token`);
      throw error;
    }
  }
  
  async disableSharing(docId: string): Promise<boolean> {
    logger.info(`Disabling sharing for document ${docId}`);
    try {
      // Update using updateOne instead of findById and save
      const result = await Document.updateOne(
        { _id: docId },
        { 
          $set: { shareEnabled: false },
          $unset: { shareToken: "", shareExpiration: "" }
        }
      );
      
      if (result.matchedCount === 0) {
        logger.warn(`Document ${docId} not found for disabling sharing`);
        return false;
      }
      
      logger.info(`Sharing disabled for document ${docId}`);
      return true;
    } catch (error: any) {
      logger.error({ err: error, docId }, `Error disabling sharing for document`);
      throw error;
    }
  }

  async createDocument(doc: InsertDocument): Promise<any> {
    logger.info("Creating document in MongoDB");
    try {
      let fileData = doc.fileData;
      if (fileData.includes('base64,')) {
        const parts = fileData.split('base64,');
        fileData = parts[1];
        logger.info("Extracted base64 data from data URL");
      }

      const fileBuffer = Buffer.from(fileData, 'base64');
      logger.info(`Created buffer of length: ${fileBuffer.length}`);

      const newDocument = await Document.create({
        name: doc.name,
        fileType: doc.fileType,
        fileData: fileBuffer,
        user: doc.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      });

      logger.info(`Document created in MongoDB: ${newDocument._id}`);
      return newDocument;
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating document');
      throw error;
    }
  }

  async getDocumentById(id: string): Promise<any> {
    logger.info(`Fetching document ${id} from MongoDB`);
    try {
      const document = await Document.findById(id)
        .select('+fileData')
        .lean();

      if (!document) {
        logger.warn(`Document ${id} not found`);
        return null;
      }
      
      if (document.fileData) {
        const normalizedBuffer = this._normalizeFileDataToBuffer(document.fileData);
        if (normalizedBuffer) {
          document.fileData = normalizedBuffer;
          logger.info(`Document ${id} fileData normalized.`);
        } else {
          logger.error(`Failed to normalize fileData for document ${id}. fileData will be null.`);
          document.fileData = null;
        }
      }
      
      logger.info(`Found document ${id} with fileData ${document.fileData ? 'present' : 'missing (after normalization attempt)'}`);
      return document;
    } catch (error: any) {
      logger.error({ err: error, id }, `Error fetching document by ID`);
      throw error;
    }
  }

  async verifyAdminPassword(password: string): Promise<boolean> {
    logger.info("Verifying admin password against MongoDB");

    try {
      const admin = await Admin.findOne();
      logger.info("Admin lookup result:", admin ? "Found" : "Not found");

      if (!admin) {
        logger.warn("No admin user found in MongoDB");
        return false;
      }

      const isValid = await bcrypt.compare(password, admin.passwordHash);
      logger.info(`Password validation result: ${isValid}`);
      return isValid;
    } catch (error: any) {
      logger.error({ err: error }, 'Error verifying admin password');
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    logger.info(`Deleting document ${id} from MongoDB`);
    try {
      const result = await Document.findByIdAndDelete(id);
      if (!result) {
        logger.warn(`Document ${id} not found for deletion`);
        return false;
      }
      logger.info(`Document ${id} deleted successfully`);
      return true;
    } catch (error: any) {
      logger.error({ err: error, id }, `Error deleting document`);
      throw error;
    }
  }

  async initializeAdminPassword(initialPassword?: string): Promise<void> {
    try {
      logger.info("Checking for existing admin in MongoDB...");
      const admin = await Admin.findOne();

      if (!admin) {
        if (!initialPassword) {
          logger.error(
            "CRITICAL: No admin user found and INITIAL_ADMIN_PASSWORD environment variable is not set. " +
            "Admin account cannot be initialized. Please set the INITIAL_ADMIN_PASSWORD."
          );
          // Potentially throw an error or exit, depending on desired application behavior for critical setup failure.
          // For now, just returning to prevent creation.
          return; 
        }
        logger.info("No admin found in MongoDB. Creating admin with password from environment variable...");
        const passwordHash = await bcrypt.hash(initialPassword, 10);

        const newAdmin = await Admin.create({ passwordHash });
        logger.info({ adminId: newAdmin._id },"Successfully initialized admin user.");
      } else {
        logger.info({ adminId: admin._id }, "Admin user already exists, skipping initialization.");
      }
    } catch (error: any) {
      logger.error({ err: error }, 'Error initializing admin password');
      // Re-throwing the error might be appropriate if the application cannot run without this setup.
      throw error; 
    }
  }
}

// Use MongoDB exclusively
logger.info("Using MongoDB exclusively for storage");
export const storage = new MongoDBStorage();

// Initialize admin password from environment variable
const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
if (initialAdminPassword) {
  logger.info("Attempting to initialize admin password from environment variable...");
} else {
  // This log will appear if the variable is not set, even if an admin already exists.
  // The critical error inside initializeAdminPassword will only log if an admin *needs* to be created.
  logger.warn("INITIAL_ADMIN_PASSWORD environment variable is not set. " + 
               "If no admin user exists, initialization will be skipped.");
}

storage.initializeAdminPassword(initialAdminPassword)
  .then(() => {
    // Success messages are now handled within initializeAdminPassword or if skipped.
  })
  .catch(err => {
    // Error logging is handled within initializeAdminPassword.
    // If we re-throw from there, the application might crash here if not caught, which could be intended.
    logger.fatal({ err }, "Failed to complete admin password initialization process due to an error from initializeAdminPassword.");
    // process.exit(1); // Consider exiting if admin setup is critical and fails
  });