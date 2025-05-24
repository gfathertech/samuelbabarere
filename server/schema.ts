import { Schema, model } from 'mongoose';
import { z } from "zod";

// Document Schema
const documentSchema = new Schema({
  name: { type: String, required: true },
  fileType: { type: String, required: true },
  // Store the actual file data directly in the document as Buffer
  // Using select: false to avoid retrieving large files when not needed
  fileData: { 
    type: Buffer, 
    required: true, 
    select: false  // This ensures we don't fetch this large field unless we explicitly ask for it
  },
  // User who the document belongs to
  user: { 
    type: String,
    required: true,
    enum: ['MATTHEW', 'MOM', 'DAD', 'SAMUEL']
  },
  // Sharing functionality
  shareEnabled: { 
    type: Boolean, 
    default: false 
  },
  shareToken: { 
    type: String, 
    sparse: true, 
    index: true 
  },
  shareExpiration: { 
    type: Date, 
    default: undefined,
    index: true // Add index for faster queries
  },
  createdAt: { type: Date, default: Date.now }
});

// Create a compound index for efficient shared document queries
documentSchema.index({ shareToken: 1, shareEnabled: 1, shareExpiration: 1 });

// Admin Schema
const adminSchema = new Schema({
  passwordHash: { type: String, required: true }
});

// Zod Schemas for validation
export const insertDocumentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fileData: z.string().min(1, "File data is required"), // Base64 encoded file
  fileType: z.string().min(1, "File type is required"),
  user: z.enum(['MATTHEW', 'MOM', 'DAD', 'SAMUEL'], {
    required_error: "User is required",
    invalid_type_error: "User must be one of: MATTHEW, MOM, DAD, SAMUEL",
  }),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Mongoose Models
export const Document = model('Document', documentSchema);
export const Admin = model('Admin', adminSchema);

// Types
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentType = typeof Document;

// Interface for document objects
export interface IDocument {
  _id: string;
  name: string;
  fileData: string | Buffer; // Can be string (memory storage) or Buffer (MongoDB)
  fileType: string;
  user: 'MATTHEW' | 'MOM' | 'DAD' | 'SAMUEL';
  shareEnabled?: boolean;
  shareToken?: string;
  shareExpiration?: Date | null;
  createdAt: string;
}

// Schema for sharing a document
export const shareDocumentSchema = z.object({
  docId: z.string().min(1, "Document ID is required"),
  expirationDays: z.number().int().min(1).max(30).optional(),
});

// Schema for validating a share token
export const validateShareTokenSchema = z.object({
  token: z.string().min(1, "Share token is required"),
});

// Schema for validating MongoDB ObjectId in route parameters
export const documentIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Object ID format"),
});

// Schema for validating share token in route parameters
export const sharedTokenParamsSchema = z.object({
  token: z.string().min(1, "Token parameter is required"),
});

export type ShareDocument = z.infer<typeof shareDocumentSchema>;