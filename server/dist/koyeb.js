// koyeb.ts
import express from "express";

// routes.ts
import { createServer } from "http";

// schema.ts
import { Schema, model } from "mongoose";
import { z } from "zod";
var documentSchema = new Schema({
  name: { type: String, required: true },
  fileType: { type: String, required: true },
  // Store the actual file data directly in the document as Buffer
  // Using select: false to avoid retrieving large files when not needed
  fileData: {
    type: Buffer,
    required: true,
    select: false
    // This ensures we don't fetch this large field unless we explicitly ask for it
  },
  // User who the document belongs to
  user: {
    type: String,
    required: true,
    enum: ["MATTHEW", "MOM", "DAD", "SAMUEL"]
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
    default: void 0,
    index: true
    // Add index for faster queries
  },
  createdAt: { type: Date, default: Date.now }
});
documentSchema.index({ shareToken: 1, shareEnabled: 1, shareExpiration: 1 });
var adminSchema = new Schema({
  passwordHash: { type: String, required: true }
});
var insertDocumentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fileData: z.string().min(1, "File data is required"),
  // Base64 encoded file
  fileType: z.string().min(1, "File type is required"),
  user: z.enum(["MATTHEW", "MOM", "DAD", "SAMUEL"], {
    required_error: "User is required",
    invalid_type_error: "User must be one of: MATTHEW, MOM, DAD, SAMUEL"
  })
});
var adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required")
});
var Document = model("Document", documentSchema);
var Admin = model("Admin", adminSchema);
var shareDocumentSchema = z.object({
  docId: z.string().min(1, "Document ID is required"),
  expirationDays: z.number().int().min(1).max(30).optional()
});
var validateShareTokenSchema = z.object({
  token: z.string().min(1, "Share token is required")
});

// storage.ts
import * as bcrypt from "bcrypt";
import crypto from "crypto";
var MongoDBStorage = class {
  async getDocuments(user) {
    console.log(`Fetching documents from MongoDB${user ? ` for user: ${user}` : ""}...`);
    try {
      let query = {};
      if (user) {
        query = { user };
      }
      const documents = await Document.find(query).sort({ createdAt: -1 }).lean();
      console.log(`Found ${documents.length} documents${user ? ` for user ${user}` : ""}`);
      return documents;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  }
  // Generate a secure random token
  generateShareToken() {
    return crypto.randomBytes(24).toString("hex");
  }
  async createShareableLink(docId, expirationDays = 7) {
    console.log(`Creating shareable link for document ${docId} with expiration in ${expirationDays} days`);
    try {
      const document = await Document.findById(docId);
      if (!document) {
        console.log(`Document ${docId} not found`);
        throw new Error("Document not found");
      }
      const shareToken = this.generateShareToken();
      const shareExpiration = /* @__PURE__ */ new Date();
      shareExpiration.setDate(shareExpiration.getDate() + expirationDays);
      console.log(`Setting expiration date to: ${shareExpiration.toISOString()} (${expirationDays} days from now)`);
      document.shareEnabled = true;
      document.shareToken = shareToken;
      document.shareExpiration = shareExpiration;
      await document.save();
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
  async getDocumentByShareToken(token) {
    console.log(`Fetching document by share token: ${token}`);
    try {
      const now = /* @__PURE__ */ new Date();
      console.log(`Current date for comparison: ${now.toISOString()}`);
      const document = await Document.findOne({
        shareToken: token,
        shareEnabled: true,
        shareExpiration: { $gt: now }
        // Check if token hasn't expired
      }).select("+fileData").lean();
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
  async disableSharing(docId) {
    console.log(`Disabling sharing for document ${docId}`);
    try {
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
  async createDocument(doc) {
    console.log("Creating document in MongoDB");
    try {
      let fileData = doc.fileData;
      if (fileData.includes("base64,")) {
        const parts = fileData.split("base64,");
        fileData = parts[1];
        console.log("Extracted base64 data from data URL");
      }
      const fileBuffer = Buffer.from(fileData, "base64");
      console.log(`Created buffer of length: ${fileBuffer.length}`);
      const newDocument = await Document.create({
        name: doc.name,
        fileType: doc.fileType,
        fileData: fileBuffer,
        user: doc.user || "MATTHEW"
        // Default to MATTHEW for backward compatibility
      });
      console.log(`Document created in MongoDB: ${newDocument._id}`);
      return newDocument;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  }
  async getDocumentById(id) {
    console.log(`Fetching document ${id} from MongoDB`);
    try {
      const document = await Document.findById(id).select("+fileData").lean();
      if (!document) {
        console.log(`Document ${id} not found`);
        return null;
      }
      console.log(`Found document ${id} with fileData ${document.fileData ? "present" : "missing"}`);
      return document;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      throw error;
    }
  }
  async verifyAdminPassword(password) {
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
      console.error("Error verifying admin password:", error);
      throw error;
    }
  }
  async deleteDocument(id) {
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
  async initializeAdminPassword(defaultPassword) {
    try {
      console.log("Checking for existing admin in MongoDB...");
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
      console.error("Error initializing admin password:", error);
      throw error;
    }
  }
};
console.log("Using MongoDB exclusively for storage");
var storage = new MongoDBStorage();
storage.initializeAdminPassword("50100150").then(() => console.log("\u2705 Admin password initialized successfully")).catch((err) => console.error("\u274C Error initializing admin password:", err));

// routes.ts
import { z as z2 } from "zod";
import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
var contactSchema = z2.object({
  name: z2.string().min(1, "Name is required"),
  email: z2.string().email("Invalid email format"),
  message: z2.string().min(1, "Message is required")
});
async function registerRoutes(app2) {
  app2.use(cookieParser());
  app2.get("/api/status", (_req, res) => {
    res.json({ status: "operational", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const data = contactSchema.parse(req.body);
      console.log("Contact form submission:", data);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "gfathertech@gmail.com",
          pass: process.env.EMAIL_PASSWORD || ""
        }
      });
      const mailOptions = {
        from: data.email,
        to: "gfathertech@gmail.com",
        subject: `Contact Form Message from ${data.name}`,
        text: `Name: ${data.name}
Email: ${data.email}
Message: ${data.message}`
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
  app2.post("/api/auth/verify", async (req, res) => {
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
      res.cookie("auth", "true", {
        maxAge: 18e5,
        // 30 minutes in milliseconds
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
        // Allow cross-site cookie access
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  app2.get("/api/documents", async (req, res) => {
    try {
      const user = req.query.user;
      console.log(`Fetching documents from MongoDB${user ? ` for user: ${user}` : ""}...`);
      const documents = await storage.getDocuments(user);
      const sanitizedDocuments = documents.map((doc) => ({
        _id: doc._id,
        name: doc.name,
        fileType: doc.fileType,
        createdAt: doc.createdAt,
        user: doc.user || "MATTHEW"
        // Default to MATTHEW for backward compatibility
      }));
      console.log(`Found ${documents.length} documents`);
      res.json(sanitizedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.get("/api/all-documents", async (req, res) => {
    try {
      console.log("Fetching ALL documents from MongoDB without user filtering...");
      const documents = await Document.find({}).select({ fileData: 0 }).lean();
      const sanitizedDocuments = documents.map((doc) => ({
        _id: doc._id,
        name: doc.name,
        fileType: doc.fileType,
        createdAt: doc.createdAt,
        user: doc.user || "NO USER FIELD"
      }));
      console.log(`Found ${documents.length} total documents in MongoDB`);
      res.json(sanitizedDocuments);
    } catch (error) {
      console.error("Error fetching all documents:", error);
      res.status(500).json({ message: "Failed to fetch all documents" });
    }
  });
  app2.post("/api/migrate-documents", async (req, res) => {
    try {
      console.log("Migrating documents in MongoDB to assign user field...");
      const { user } = req.body;
      if (!user) {
        return res.status(400).json({ message: "User parameter is required" });
      }
      const result = await Document.updateMany(
        { user: { $exists: false } },
        // Find documents where user field doesn't exist
        { $set: { user } }
        // Set the user field
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
  app2.post("/api/transfer-all-documents", async (req, res) => {
    try {
      console.log("Transferring all documents to a new user...");
      const { user } = req.body;
      if (!user) {
        return res.status(400).json({ message: "User parameter is required" });
      }
      const result = await Document.updateMany(
        {},
        // Match all documents
        { $set: { user } }
        // Set the user field to the new value
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
  app2.get("/api/documents/:id/download", async (req, res) => {
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
      res.setHeader("Content-Type", document.fileType);
      res.setHeader("Content-Disposition", `attachment; filename="${document.name}"`);
      res.setHeader("Cache-Control", "no-cache");
      try {
        console.log(`FileData type: ${typeof document.fileData}, isBuffer: ${Buffer.isBuffer(document.fileData)}`);
        if (Buffer.isBuffer(document.fileData)) {
          console.log(`Document ${id} has fileData as direct Buffer of length: ${document.fileData.length}`);
          return res.send(document.fileData);
        } else if (document.fileData && typeof document.fileData === "object" && document.fileData.buffer && document.fileData.type === "Buffer") {
          console.log(`Document ${id} has fileData as MongoDB Buffer object`);
          const buffer = Buffer.from(document.fileData.buffer);
          console.log(`Successfully created buffer from MongoDB Buffer of length: ${buffer.length}`);
          return res.send(buffer);
        } else if (document.fileData && typeof document.fileData === "object" && document.fileData.buffer) {
          console.log(`Document ${id} has fileData with buffer property`);
          const buffer = Buffer.from(document.fileData.buffer);
          console.log(`Created buffer from object buffer property of length: ${buffer.length}`);
          return res.send(buffer);
        } else if (document.fileData && typeof document.fileData === "object" && Array.isArray(document.fileData)) {
          console.log(`Document ${id} has fileData as array`);
          const buffer = Buffer.from(document.fileData);
          console.log(`Created buffer from array data of length: ${buffer.length}`);
          return res.send(buffer);
        } else if (typeof document.fileData === "string") {
          let fileData = document.fileData;
          if (fileData.includes("base64,")) {
            const parts = fileData.split("base64,");
            fileData = parts[1];
            console.log(`Extracted base64 data from data URL`);
          }
          const buffer = Buffer.from(fileData, "base64");
          console.log(`Successfully converted string data to buffer of length: ${buffer.length}`);
          return res.send(buffer);
        } else if (document.fileData) {
          console.log(`Document ${id} has fileData in non-standard format, attempting conversion:`, typeof document.fileData);
          try {
            console.log("FileData structure:", JSON.stringify(document.fileData).substring(0, 100) + "...");
            const buffer = Buffer.from(document.fileData);
            console.log(`Created buffer directly from object of length: ${buffer.length}`);
            return res.send(buffer);
          } catch (err) {
            console.error(`Failed to convert object to buffer:`, err);
            return res.status(500).json({ message: "Could not convert document data format" });
          }
        } else {
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
  app2.delete("/api/documents/:id", async (req, res) => {
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
  app2.post("/api/documents/:id/share", async (req, res) => {
    try {
      const id = req.params.id;
      const { expirationDays } = req.body;
      console.log(`Creating shareable link for document ${id} with expiration in ${expirationDays || 7} days`);
      const shareToken = await storage.createShareableLink(id, expirationDays);
      res.json({
        success: true,
        shareToken
      });
    } catch (error) {
      console.error("Error creating shareable link:", error);
      res.status(500).json({ message: "Failed to create shareable link" });
    }
  });
  app2.delete("/api/documents/:id/share", async (req, res) => {
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
  app2.get("/api/shared/:token", async (req, res) => {
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
      if (req.headers.accept?.includes("text/html") && !req.headers["x-requested-with"]) {
      }
      const getDataUrl = (fileData) => {
        if (Buffer.isBuffer(fileData)) {
          return `data:${document.fileType};base64,${fileData.toString("base64")}`;
        }
        if (fileData.buffer) {
          return `data:${document.fileType};base64,${Buffer.from(fileData.buffer).toString("base64")}`;
        }
        if (typeof fileData === "string") {
          return fileData.startsWith("data:") ? fileData : `data:${document.fileType};base64,${fileData}`;
        }
        return "";
      };
      const content = getDataUrl(document.fileData);
      if (!content) {
        console.error(`Failed to generate content for shared document: ${document._id}`);
      }
      res.json({
        _id: document._id,
        name: document.name,
        fileType: document.fileType,
        createdAt: document.createdAt,
        type: document.fileType,
        content,
        previewAvailable: !!content,
        user: document.user || "SHARED",
        // Mark as shared document
        expiresAt: document.shareExpiration
      });
    } catch (error) {
      console.error("Error fetching shared document:", error);
      res.status(500).json({ message: "Failed to fetch shared document" });
    }
  });
  app2.get("/api/documents/:id/preview", async (req, res) => {
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
      if (req.headers.accept?.includes("text/html") && !req.headers["x-requested-with"]) {
      }
      const getDataUrl = (fileData) => {
        if (Buffer.isBuffer(fileData)) {
          return `data:${document.fileType};base64,${fileData.toString("base64")}`;
        }
        if (fileData.buffer) {
          return `data:${document.fileType};base64,${Buffer.from(fileData.buffer).toString("base64")}`;
        }
        if (typeof fileData === "string") {
          return fileData.startsWith("data:") ? fileData : `data:${document.fileType};base64,${fileData}`;
        }
        return "";
      };
      const content = getDataUrl(document.fileData);
      res.json({
        type: document.fileType,
        name: document.name,
        content,
        previewAvailable: !!content,
        user: document.user || "MATTHEW"
        // Default to MATTHEW for backward compatibility
      });
    } catch (error) {
      console.error("Error generating document preview:", error);
      res.status(500).json({ message: "Failed to generate document preview" });
    }
  });
  app2.post("/api/documents", async (req, res) => {
    try {
      console.log("Creating new document:", req.body.name);
      const document = await storage.createDocument(req.body);
      const sanitizedResponse = {
        _id: document._id,
        name: document.name,
        fileType: document.fileType,
        createdAt: document.createdAt,
        user: document.user || "MATTHEW"
        // Default to MATTHEW for backward compatibility
      };
      console.log("Document created successfully:", sanitizedResponse);
      res.json(sanitizedResponse);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// koyeb.ts
import dotenv from "dotenv";
import cors from "cors";

// db.ts
import mongoose from "mongoose";
var MAX_RETRIES = 3;
var RETRY_INTERVAL = 5e3;
var retryCount = 0;
var validateMongoURI = (uri) => {
  const uriPattern = /^mongodb(\+srv)?:\/\/.+/;
  const valid = uriPattern.test(uri);
  if (!valid) {
    console.error("\u274C Invalid MongoDB URI format. URI should start with mongodb:// or mongodb+srv://");
  }
  return valid;
};
var connectWithRetry = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("\u274C MONGODB_URI not set. Please provide a MongoDB connection string.");
    throw new Error("MongoDB connection string not provided");
  }
  if (!validateMongoURI(process.env.MONGODB_URI)) {
    console.error("\u274C Invalid MongoDB URI format. Please check your connection string.");
    throw new Error("Invalid MongoDB URI format");
  }
  console.log(`\u{1F50D} MONGODB_URI starts with: ${process.env.MONGODB_URI.substring(0, 15)}...`);
  try {
    console.log(`Attempting to connect to MongoDB (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5e3,
      socketTimeoutMS: 3e4,
      connectTimeoutMS: 1e4,
      maxPoolSize: 5,
      retryWrites: true,
      w: "majority"
    });
    console.log("\u2705 Successfully connected to MongoDB");
    retryCount = 0;
  } catch (err) {
    console.error("\u274C MongoDB connection error:", err);
    console.log("\u{1F4CC} Error details:", JSON.stringify(err, null, 2));
    if (retryCount < MAX_RETRIES - 1) {
      retryCount++;
      console.log(`\u23F3 Retrying connection in ${RETRY_INTERVAL / 1e3} seconds...`);
      setTimeout(connectWithRetry, RETRY_INTERVAL);
    } else {
      console.error(`\u274C Failed to connect after ${MAX_RETRIES} attempts. Application requires MongoDB to function.`);
      throw new Error("Failed to connect to MongoDB after multiple attempts");
    }
  }
};
mongoose.connection.on("connected", () => {
  console.log("\u{1F504} Mongoose connected to MongoDB server");
});
mongoose.connection.on("error", (err) => {
  console.error("\u274C Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("\u26A0\uFE0F Mongoose disconnected from MongoDB server");
  if (retryCount === 0) {
    console.log("\u{1F504} Attempting reconnection...");
    setTimeout(connectWithRetry, RETRY_INTERVAL);
  }
});
connectWithRetry();
var db = mongoose.connection;

// koyeb.ts
dotenv.config();
var app = express();
app.use(cors({
  origin: [
    "https://samuelbabarere.github.io",
    "https://portfolio.samuelbabarere.net",
    "http://localhost:5000",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
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
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    console.log(`API server running on port ${port}`);
  });
})();
