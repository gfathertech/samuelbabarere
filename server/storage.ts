import { type InsertDocument, Document, Admin, IDocument, ShareDocument } from "./schema";
import * as bcrypt from "bcrypt";
import mongoose from "mongoose";
import crypto from "crypto";

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

  async getDocuments(user?: string): Promise<any[]> {
    console.log(`Fetching documents from MongoDB${user ? ` for user: ${user}` : ''}...`);
    try {
      let query = {};
      
      // If user is specified, filter by user
      if (user) {
        query = { user };
      }
      
      const documents = await Document.find(query)
        .sort({ createdAt: -1 })
        .lean();

      console.log(`Found ${documents.length} documents${user ? ` for user ${user}` : ''}`);
      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }
  
  // Generate a secure random token
  private generateShareToken(): string {
    return crypto.randomBytes(24).toString('hex');
  }
  
  async createShareableLink(docId: string, expirationDays: number = 7): Promise<string> {
    console.log(`Creating shareable link for document ${docId} with expiration in ${expirationDays} days`);
    try {
      // Find the document to ensure it exists
      const document = await Document.findById(docId);
      if (!document) {
        console.log(`Document ${docId} not found`);
        throw new Error('Document not found');
      }
      
      // Generate a secure token
      const shareToken = this.generateShareToken();
      
      // Calculate expiration date (default: 7 days from now)
      const shareExpiration = new Date();
      shareExpiration.setDate(shareExpiration.getDate() + expirationDays);
      
      console.log(`Setting expiration date to: ${shareExpiration.toISOString()} (${expirationDays} days from now)`);
      
      // Update the document with sharing information
      document.shareEnabled = true;
      document.shareToken = shareToken;
      document.shareExpiration = shareExpiration;
      await document.save();
      
      // Verify expiration date was saved correctly
      const updatedDoc = await Document.findById(docId);
      if (updatedDoc && updatedDoc.shareExpiration) {
        console.log(`Verified document ${docId} expiration date: ${updatedDoc.shareExpiration.toISOString()}`);
      }
      
      console.log(`Shareable link created for document ${docId} with token: ${shareToken}`);
      return shareToken;
    } catch (error) {
      console.error(`Error creating shareable link for document ${docId}:`, error);
      throw error;
    }
  }
  
  async getDocumentByShareToken(token: string): Promise<any> {
    console.log(`Fetching document by share token: ${token}`);
    try {
      const now = new Date();
      console.log(`Current date for comparison: ${now.toISOString()}`);
      
      // Find document by share token
      const document = await Document.findOne({ 
        shareToken: token,
        shareEnabled: true,
        shareExpiration: { $gt: now } // Check if token hasn't expired
      })
      .select('+fileData')
      .lean();
      
      if (!document) {
        console.log(`No valid document found for share token: ${token}`);
        return null;
      }
      
      console.log(`Found document ${document._id} via share token. Expiration: ${document.shareExpiration}`);
      return document;
    } catch (error) {
      console.error(`Error fetching document by share token ${token}:`, error);
      throw error;
    }
  }
  
  async disableSharing(docId: string): Promise<boolean> {
    console.log(`Disabling sharing for document ${docId}`);
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
        console.log(`Document ${docId} not found`);
        return false;
      }
      
      console.log(`Sharing disabled for document ${docId}`);
      return true;
    } catch (error) {
      console.error(`Error disabling sharing for document ${docId}:`, error);
      throw error;
    }
  }

  async createDocument(doc: InsertDocument): Promise<any> {
    console.log("Creating document in MongoDB");
    try {
      let fileData = doc.fileData;
      if (fileData.includes('base64,')) {
        const parts = fileData.split('base64,');
        fileData = parts[1];
        console.log("Extracted base64 data from data URL");
      }

      const fileBuffer = Buffer.from(fileData, 'base64');
      console.log(`Created buffer of length: ${fileBuffer.length}`);

      const newDocument = await Document.create({
        name: doc.name,
        fileType: doc.fileType,
        fileData: fileBuffer,
        user: doc.user || 'MATTHEW' // Default to MATTHEW for backward compatibility
      });

      console.log(`Document created in MongoDB: ${newDocument._id}`);
      return newDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getDocumentById(id: string): Promise<any> {
    console.log(`Fetching document ${id} from MongoDB`);
    try {
      const document = await Document.findById(id)
        .select('+fileData')
        .lean();

      if (!document) {
        console.log(`Document ${id} not found`);
        return null;
      }
      console.log(`Found document ${id} with fileData ${document.fileData ? 'present' : 'missing'}`);
      return document;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  }

  async verifyAdminPassword(password: string): Promise<boolean> {
    console.log("Verifying admin password against MongoDB");

    try {
      const admin = await Admin.findOne();
      console.log("Admin lookup result:", admin ? "Found" : "Not found");

      if (!admin) {
        console.log("No admin user found in MongoDB");
        return false;
      }

      const isValid = await bcrypt.compare(password, admin.passwordHash);
      console.log(`Password validation result: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('Error verifying admin password:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    console.log(`Deleting document ${id} from MongoDB`);
    try {
      const result = await Document.findByIdAndDelete(id);
      if (!result) {
        console.log(`Document ${id} not found for deletion`);
        return false;
      }
      console.log(`Document ${id} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }

  async initializeAdminPassword(defaultPassword: string): Promise<void> {
    try {
      console.log("Checking for existing admin in MongoDB...")
      const admin = await Admin.findOne();

      if (!admin) {
        console.log("No admin found in MongoDB. Creating admin with default password");
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        const newAdmin = await Admin.create({ passwordHash });
        console.log("Admin user created in MongoDB with ID:", newAdmin._id);
      } else {
        console.log("Admin user already exists with ID:", admin._id);
      }
    } catch (error) {
      console.error('Error initializing admin password:', error);
      throw error;
    }
  }
}

// Use MongoDB exclusively
console.log("Using MongoDB exclusively for storage");
export const storage = new MongoDBStorage();

// Initialize admin password
storage.initializeAdminPassword("50100150")
  .then(() => console.log('✅ Admin password initialized successfully'))
  .catch(err => console.error('❌ Error initializing admin password:', err));