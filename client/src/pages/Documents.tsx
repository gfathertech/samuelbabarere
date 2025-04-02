import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Download, 
  Trash2, 
  FileText, 
  Image, 
  Archive, 
  File, 
  Calendar,
  BookText,
  Code,
  FileJson,
  FileSpreadsheet,
  FileVideo,
  PresentationIcon,
  FileAudio,
  Loader2,
  Eye,
  Users,
  Share2,
  Link as LinkIcon,
  Copy,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Document {
  _id: string;
  name: string;
  fileType: string;
  createdAt: string;
  user?: string; // Make it optional for backward compatibility
}

interface DocumentPreview {
  type: string;
  content?: string;
  previewAvailable: boolean;
}

// Helper function to get appropriate icon for file type
function getFileIcon(fileType: string, size: number = 16) {
  const iconClass = `w-${size === 16 ? '4' : size === 24 ? '6' : '5'} h-${size === 16 ? '4' : size === 24 ? '6' : '5'} ${size > 16 ? 'text-pink-500' : 'text-gray-500'}`;
  
  if (fileType.startsWith('image/')) {
    return <Image className={iconClass} />;
  } else if (fileType.includes('pdf')) {
    return <BookText className={iconClass} />;
  } else if (fileType.includes('json') || fileType.includes('application/json')) {
    return <FileJson className={iconClass} />;
  } else if (
    fileType.includes('javascript') || 
    fileType.includes('html') || 
    fileType.includes('css') || 
    fileType.includes('xml') || 
    fileType.includes('text/plain')
  ) {
    return <Code className={iconClass} />;
  } else if (fileType.includes('zip') || fileType.includes('archive')) {
    return <Archive className={iconClass} />;
  } else if (
    fileType.includes('excel') ||
    fileType.includes('spreadsheet') ||
    fileType.includes('csv') ||
    fileType.includes('xls') ||
    fileType.includes('sheet')
  ) {
    return <FileSpreadsheet className={iconClass} />;
  } else if (
    fileType.includes('video') || 
    fileType.includes('mp4') || 
    fileType.includes('avi') || 
    fileType.includes('mov')
  ) {
    return <FileVideo className={iconClass} />;
  } else if (
    fileType.includes('audio') || 
    fileType.includes('mp3') || 
    fileType.includes('wav') || 
    fileType.includes('ogg')
  ) {
    return <FileAudio className={iconClass} />;
  } else if (
    fileType.includes('presentation') || 
    fileType.includes('powerpoint') || 
    fileType.includes('ppt') || 
    fileType.includes('slide')
  ) {
    return <PresentationIcon className={iconClass} />;
  } else if (
    fileType.includes('word') || 
    fileType.includes('doc') || 
    fileType.includes('document') || 
    fileType.includes('text')
  ) {
    return <FileText className={iconClass} />;
  } else {
    return <File className={iconClass} />;
  }
}

// Format the file type for display
function formatFileType(fileType: string): string {
  if (fileType.startsWith('image/')) {
    const format = fileType.split('/')[1].toUpperCase();
    return `Image (${format})`;
  } else if (fileType === 'application/pdf') {
    return 'PDF Document';
  } else if (fileType === 'application/json') {
    return 'JSON File';
  } else if (fileType === 'text/html') {
    return 'HTML Document';
  } else if (fileType === 'text/css') {
    return 'CSS Stylesheet';
  } else if (fileType === 'text/javascript' || fileType === 'application/javascript') {
    return 'JavaScript File';
  } else if (fileType === 'text/plain') {
    return 'Text Document';
  } else if (fileType === 'application/zip' || fileType === 'application/x-zip-compressed') {
    return 'ZIP Archive';
  } else if (fileType.startsWith('video/')) {
    const format = fileType.split('/')[1].toUpperCase();
    return `Video (${format})`;
  } else if (fileType.startsWith('audio/')) {
    const format = fileType.split('/')[1].toUpperCase();
    return `Audio (${format})`;
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'Word Document';
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    return 'Excel Spreadsheet';
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    return 'PowerPoint Presentation';
  } else if (fileType === 'application/msword') {
    return 'Word Document (.doc)';
  } else if (fileType === 'application/vnd.ms-excel') {
    return 'Excel Spreadsheet (.xls)';
  } else if (fileType === 'application/vnd.ms-powerpoint') {
    return 'PowerPoint Presentation (.ppt)';
  } else if (fileType === 'text/csv') {
    return 'CSV File';
  } else if (fileType === 'application/xml' || fileType === 'text/xml') {
    return 'XML Document';
  } else {
    // For unknown file types, just show the MIME type
    return fileType;
  }
}

function DocumentPreviewContent({ doc }: { doc: Document }) {
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<DocumentPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents/${doc._id}/preview`);
        if (!response.ok) {
          throw new Error("Failed to load preview");
        }
        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        setError("Preview not available");
        console.error("Preview error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [doc._id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[150px]">
        <div className="animate-spin h-6 w-6 border-2 border-pink-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Error state
  if (error || !previewData) {
    return (
      <div className="p-4 text-center text-gray-500">
        <File className="mx-auto w-8 h-8 mb-2 text-gray-400" />
        <p>Preview not available</p>
      </div>
    );
  }

  // No preview available
  if (!previewData.previewAvailable) {
    return (
      <div className="p-4 text-center text-gray-500">
        {previewData.type.startsWith('image/') ? (
          <Image className="mx-auto w-8 h-8 mb-2 text-gray-400" />
        ) : previewData.type.includes('pdf') ? (
          <FileText className="mx-auto w-8 h-8 mb-2 text-gray-400" />
        ) : previewData.type.includes('zip') || previewData.type.includes('archive') ? (
          <Archive className="mx-auto w-8 h-8 mb-2 text-gray-400" />
        ) : (
          <File className="mx-auto w-8 h-8 mb-2 text-gray-400" />
        )}
        <p>Preview not available for this file type</p>
      </div>
    );
  }

  // Render preview based on file type
  if (previewData.type.startsWith('image/')) {
    return (
      <div className="p-2 flex items-center justify-center">
        <img 
          src={previewData.content} 
          alt={doc.name} 
          className="max-w-full max-h-[200px] object-contain rounded" 
        />
      </div>
    );
  }

  // Video preview
  if (previewData.type.startsWith('video/') && previewData.content) {
    return (
      <div className="p-2 flex flex-col items-center justify-center">
        <div className="bg-white rounded overflow-hidden shadow-md w-full">
          <video 
            controls
            src={previewData.content}
            className="w-full max-h-[200px]"
            preload="metadata"
          >
            <div className="flex flex-col items-center justify-center h-[200px] bg-gray-100 p-4">
              <FileVideo className="w-12 h-12 text-pink-600 mb-2" />
              <p className="text-sm text-gray-600">Video Preview</p>
              <p className="text-xs text-gray-500 mt-1">Your browser cannot play this video format</p>
            </div>
          </video>
        </div>
      </div>
    );
  }

  // Audio preview
  if (previewData.type.startsWith('audio/') && previewData.content) {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <div className="bg-gray-100 p-3 rounded-xl w-full flex flex-col items-center">
          <FileAudio className="w-10 h-10 text-pink-600 mb-3" />
          <audio 
            controls
            src={previewData.content}
            className="w-full max-w-[250px]"
            preload="metadata"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  }

  // Text preview
  if (
    previewData.type === 'text/plain' || 
    previewData.type === 'text/html' ||
    previewData.type === 'text/css' ||
    previewData.type === 'text/javascript' ||
    previewData.type === 'application/json' ||
    previewData.type === 'text/xml' ||
    previewData.type === 'application/xml'
  ) {
    return (
      <div className="p-3">
        <div className="bg-gray-100 p-2 rounded text-xs font-mono max-h-[200px] overflow-auto whitespace-pre-wrap">
          {previewData.content}
        </div>
        {previewData.content && previewData.content.length >= 1000 && (
          <div className="text-xs text-right mt-1 text-gray-500">
            (Showing first 1000 characters)
          </div>
        )}
      </div>
    );
  }

  // PDF preview - always show for PDFs
  if (previewData.type === 'application/pdf' && previewData.content) {
    return (
      <div className="p-2 flex flex-col items-center justify-center">
        <div className="bg-white rounded overflow-hidden shadow-md max-h-[200px] w-full">
          <div className="flex flex-col items-center justify-center h-[200px] bg-gray-100 p-4">
            <BookText className="w-12 h-12 text-pink-600 mb-2" />
            <p className="text-sm text-gray-600">PDF Document</p>
            <div className="flex gap-2 mt-3">
              <a 
                href={previewData.content}
                className="text-xs flex items-center text-blue-600 hover:text-blue-800 bg-white px-3 py-1 rounded-full shadow-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> Preview
              </a>
              <a 
                href={`/api/documents/${doc._id}/download`}
                className="text-xs flex items-center text-pink-600 hover:text-pink-800 bg-white px-3 py-1 rounded-full shadow-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Download
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for other file types
  return (
    <div className="p-4 text-center text-gray-500">
      <File className="mx-auto w-8 h-8 mb-2 text-gray-400" />
      <p>Preview not available for this file type</p>
    </div>
  );
}

export default function Documents() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for auth cookie presence first
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth='));
    
    // If cookie exists, use it
    if (authCookie) {
      return true;
    }
    
    // Otherwise check localStorage as fallback
    const storedAuth = localStorage.getItem('isAuthenticated');
    const authTimestamp = localStorage.getItem('authTimestamp');
    
    // If we have stored auth and it's less than 30 minutes old, consider it valid
    if (storedAuth === 'true' && authTimestamp) {
      const now = new Date().getTime();
      const timestamp = parseInt(authTimestamp, 10);
      const thirtyMinutesInMs = 30 * 60 * 1000;
      
      // If the stored auth is less than 30 minutes old, use it
      if ((now - timestamp) < thirtyMinutesInMs) {
        return true;
      }
    }
    
    return false;
  });

  // Update authentication status when localStorage changes (for cross-tab support)
  useEffect(() => {
    const checkAuthState = () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const authTimestamp = localStorage.getItem('authTimestamp');
      
      if (storedAuth === 'true' && authTimestamp) {
        const now = new Date().getTime();
        const timestamp = parseInt(authTimestamp, 10);
        const thirtyMinutesInMs = 30 * 60 * 1000;
        
        if ((now - timestamp) < thirtyMinutesInMs) {
          setIsAuthenticated(true);
        } else {
          // Expired local auth
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('authTimestamp');
          setIsAuthenticated(false);
        }
      }
    };
    
    // Check when the component mounts
    checkAuthState();
    
    // Only clear on actual page unload, not navigation
    const handleBeforeUnload = () => {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authTimestamp');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const [password, setPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("SAMUEL");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [documentToShare, setDocumentToShare] = useState<Document | null>(null);
  const [sharingExpiration, setSharingExpiration] = useState<number>(7); // 7 days default
  const [shareLink, setShareLink] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Refetch documents when the selected user changes
  useEffect(() => {
    if (isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', selectedUser] });
    }
  }, [selectedUser, isAuthenticated, queryClient]);

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setConfirmName("");
    setDeleteDialogOpen(true);
  };
  
  const handleShareClick = (doc: Document) => {
    setDocumentToShare(doc);
    setShareLink("");
    setSharingExpiration(7);
    setShareDialogOpen(true);
  };
  
  const handleCreateShareLink = async () => {
    if (!documentToShare) return;
    
    setIsSharing(true);
    try {
      const response = await fetch(`/api/documents/${documentToShare._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expirationDays: sharingExpiration }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create shareable link');
      }
      
      const data = await response.json();
      setShareLink(data.shareUrl);
      
      toast({
        title: "Success",
        description: "Shareable link created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shareable link",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast({
        title: "Copied",
        description: "Link copied to clipboard",
      });
    }
  };
  
  const handleDisableSharing = async () => {
    if (!documentToShare) return;
    
    setIsSharing(true);
    try {
      const response = await fetch(`/api/documents/${documentToShare._id}/share`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disable sharing');
      }
      
      setShareLink("");
      
      toast({
        title: "Success",
        description: "Document sharing disabled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable sharing",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleConfirmDelete = () => {
    if (documentToDelete && confirmName === documentToDelete.name) {
      deleteMutation.mutate(documentToDelete._id);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      setConfirmName("");
    } else {
      toast({
        title: "Error",
        description: "The document name you entered does not match. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', selectedUser] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents', selectedUser],
    queryFn: async () => {
      const response = await fetch(`/api/documents?user=${selectedUser}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const verifyPassword = async () => {
    try {
      // Verify password with the server
      await apiRequest('POST', '/api/auth/verify', { password });
      
      // Set authentication state in React state
      setIsAuthenticated(true);
      
      // Store authentication in localStorage with timestamp for fallback
      const currentTime = new Date().getTime();
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authTimestamp', currentTime.toString());
      
      // Show success message
      toast({
        title: "Success",
        description: "Access granted to documents",
      });
    } catch (error) {
      // Clear any existing authentication state on error
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authTimestamp');
      
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const uploadDocument = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get('name') as string;
      const file = formData.get('file') as File;

      // Convert file to base64 for storage and preview
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;

          // Store the base64 string as fileData
          await apiRequest('POST', '/api/documents', {
            name,
            fileData: fileContent, // base64 representation of the file
            fileType: file.type,
            user: selectedUser, // Add the selected user
          });

          queryClient.invalidateQueries({ queryKey: ['/api/documents', selectedUser] });
          toast({
            title: "Success",
            description: "Document uploaded successfully",
          });

          (event.target as HTMLFormElement).reset();
        } catch (error) {
          console.error("Error during file upload:", error);
          toast({
            title: "Error",
            description: "Failed to upload document",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
        setIsUploading(false);
      };

      // Start reading the file as a data URL (base64)
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error in file handling:", error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="floating"
        >
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-pink-100 dark:border-purple-500/20 shadow-lg dark:shadow-purple-500/10 overflow-hidden">
            <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-purple-900/30 dark:via-slate-900/50 dark:to-pink-900/30 dark:backdrop-blur-md z-0"></div>
            <CardHeader className="relative z-10">
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/5 rounded-full blur-3xl -translate-y-12 translate-x-12 z-0" 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
              <CardTitle className="text-2xl font-bold text-center dark:text-purple-200">
                <span className="relative inline-block">
                  Document Access
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400/50 to-pink-400/50"></span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <form onSubmit={(e) => { e.preventDefault(); verifyPassword(); }} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50"
                />
                <Button 
                  type="submit" 
                  className="w-full transition-all duration-300 dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-500 dark:hover:to-pink-500 dark:border-purple-700/50"
                >
                  Access Documents
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/" 
          className="group relative px-4 py-2 text-lg font-semibold text-gray-900 dark:text-purple-200 hover:text-pink-600 dark:hover:text-pink-300 transition-colors"
          onClick={() => {
            // Clear authentication cookies
            document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // Clear localStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authTimestamp');
            
            // Notify user
            toast({
              title: "Logged out",
              description: "You have been logged out successfully"
            });
          }}
        >
          <span className="relative z-10 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </span>
          <span className="absolute bottom-0 left-0 w-full h-[1px] dark:bg-gradient-to-r dark:from-transparent dark:via-purple-400/50 dark:to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
        </Link>
      </div>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Upload Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-pink-100 dark:border-purple-500/20 dark:bg-slate-900/60 dark:shadow-purple-500/10 relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-slate-900/30 dark:to-pink-900/20 dark:backdrop-blur-md z-0"></div>
          <motion.div 
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-400/5 rounded-full blur-3xl -translate-y-32 translate-x-32 z-0" 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <CardHeader className="relative z-10">
            <CardTitle className="dark:text-purple-200 flex items-center gap-2">
              <span className="relative">
                Upload Document
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400/30 to-pink-400/30"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={uploadDocument} className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="text-gray-500 dark:text-purple-300" />
                <span className="text-sm font-medium dark:text-purple-200">Select User:</span>
              </div>
              
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full bg-white/50 dark:bg-slate-800/50 dark:border-purple-500/30 dark:text-purple-200">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900/90 dark:border-purple-500/30 dark:backdrop-blur-md">
                  <SelectItem value="MATTHEW" className="dark:text-purple-200 dark:hover:bg-purple-500/20">MATTHEW</SelectItem>
                  <SelectItem value="MOM" className="dark:text-purple-200 dark:hover:bg-purple-500/20">MOM</SelectItem>
                  <SelectItem value="DAD" className="dark:text-purple-200 dark:hover:bg-purple-500/20">DAD</SelectItem>
                  <SelectItem value="SAMUEL" className="dark:text-purple-200 dark:hover:bg-purple-500/20">SAMUEL</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                name="name"
                placeholder="Document Name"
                required
                className="bg-white/50 dark:bg-slate-800/50 dark:border-purple-500/30 dark:text-purple-200"
              />
              <Input
                name="file"
                type="file"
                required
                className="bg-white/50 dark:bg-slate-800/50 dark:border-purple-500/30 dark:text-purple-200"
              />
              <Button 
                type="submit" 
                disabled={isUploading} 
                className="dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-500 dark:hover:to-pink-500 dark:border-purple-700/50"
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Upload"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-pink-100 dark:border-purple-500/20 dark:bg-slate-900/50 dark:shadow-purple-500/10 relative overflow-hidden group hover:-translate-y-1">
                <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-slate-900/30 dark:to-pink-900/20 dark:backdrop-blur-md z-0 dark:opacity-80 group-hover:dark:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <h3 className="font-semibold text-gray-900 dark:text-purple-200 cursor-pointer hover:text-pink-500 dark:hover:text-pink-300 transition-colors">{doc.name}</h3>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-96 bg-white/95 backdrop-blur-sm border-pink-100 dark:bg-slate-900/80 dark:border-purple-500/20 dark:backdrop-blur-md p-0 overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="text-lg font-semibold dark:text-purple-200">{doc.name}</h4>
                              <div className="flex items-center text-gray-500 dark:text-purple-300 text-sm">
                                {getFileIcon(doc.fileType)}
                                <span className="ml-1">{formatFileType(doc.fileType)}</span>
                              </div>
                            </div>
                            <div className="p-2 rounded-full bg-pink-50 dark:bg-purple-900/50 dark:border dark:border-purple-500/30">
                              {getFileIcon(doc.fileType, 24)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Document Preview Section */}
                        <div className="w-full bg-gray-50 dark:bg-slate-800/50 border-y border-gray-100 dark:border-purple-500/20">
                          <DocumentPreviewContent doc={doc} />
                        </div>
                        
                        <div className="p-4">
                          <p className="text-sm text-gray-600 dark:text-purple-200 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-purple-300" />
                            Added on {new Date(doc.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <div className="mt-3 flex justify-between">
                            <a
                              href={`/api/documents/${doc._id}/download`}
                              className="text-xs flex items-center text-blue-600 hover:text-blue-800 dark:text-purple-300 dark:hover:text-pink-300"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Download
                            </a>
                            <p className="text-xs text-gray-500 dark:text-purple-400/70">ID: {doc._id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    <div className="flex gap-2">
                      {/* Only show preview for PDFs and images */}
                      {(doc.fileType === 'application/pdf' || doc.fileType.startsWith('image/')) && (
                        <Link
                          href={`/preview/${doc._id}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-purple-300 dark:hover:text-pink-300 transition-colors"
                          title="Preview document"
                        >
                          <span className="relative dark:glow-effect">
                            <Eye className="w-5 h-5" />
                          </span>
                        </Link>
                      )}
                      <a
                        href={`/api/documents/${doc._id}/download`}
                        className="text-pink-600 hover:text-pink-700 dark:text-purple-300 dark:hover:text-pink-300 transition-colors"
                        title="Download document"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="relative dark:glow-effect">
                          <Download className="w-5 h-5" />
                        </span>
                      </a>
                      <button
                        onClick={() => handleShareClick(doc)}
                        className="text-green-600 hover:text-green-700 dark:text-purple-300 dark:hover:text-purple-400 transition-colors"
                        title="Share document"
                      >
                        <span className="relative dark:glow-effect">
                          <Share2 className="w-5 h-5" />
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(doc)}
                        className="text-red-600 hover:text-red-700 dark:text-pink-300 dark:hover:text-pink-400 transition-colors"
                        title="Delete document"
                      >
                        <span className="relative dark:glow-effect">
                          <Trash2 className="w-5 h-5" />
                        </span>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-purple-300/80">
                    Type: {formatFileType(doc.fileType)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-purple-300/80">
                    Added: {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  {doc.user && (
                    <p className="text-sm text-gray-500 dark:text-purple-300/80 flex items-center mt-1">
                      <Users className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-purple-400" />
                      User: <span className="font-medium ml-1 text-pink-600 dark:text-pink-400">{doc.user}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md dialog-content dark:bg-slate-900/80 dark:border-purple-500/30 dark:backdrop-blur-lg relative overflow-hidden">
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-slate-900/40 dark:to-pink-900/20 dark:backdrop-blur-md z-0"></div>
          
          <motion.div 
            className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-red-400/10 to-pink-400/5 rounded-full blur-3xl -translate-x-32 -translate-y-32 z-0" 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="dark:text-purple-200">
              <span className="relative inline-block">
                Confirm Deletion
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-red-400/50 to-pink-400/50"></span>
              </span>
            </DialogTitle>
            <DialogDescription className="dark:text-purple-300/80">
              {documentToDelete ? (
                <>
                  You are about to delete <span className="font-medium dark:text-pink-300">{documentToDelete.name}</span>. 
                  This action cannot be undone.
                </>
              ) : (
                "You are about to delete this document. This action cannot be undone."
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 relative z-10">
            <p className="mb-2 text-sm text-gray-600 dark:text-purple-200">
              Please type the document name to confirm:
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={documentToDelete?.name}
              className="bg-white/50 dark:bg-slate-800/50 dark:border-purple-500/30 dark:text-purple-200"
            />
          </div>
          
          <DialogFooter className="sm:justify-between relative z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="dark:bg-slate-800/50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-900/30"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!documentToDelete || confirmName !== documentToDelete.name}
              className="dark:bg-red-900/80 dark:text-pink-100 dark:hover:bg-red-800/90 dark:border-red-700/50 dark:disabled:bg-slate-800/40 dark:disabled:text-purple-400/50"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} modal={true}>
        <DialogContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-purple-500/30 shadow-xl dark:shadow-purple-500/10 rounded-lg overflow-hidden max-h-[90vh] max-w-md mx-auto">
          <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-purple-900/20 dark:via-slate-900/40 dark:to-pink-900/20 z-0"></div>
          
          <motion.div 
            className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-400/5 rounded-full blur-3xl -translate-x-32 -translate-y-32 z-0" 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-purple-200">
              <span className="relative inline-block">
                Share Document
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400/50 to-blue-400/50"></span>
              </span>
            </DialogTitle>
            <DialogDescription className="mt-2 text-gray-600 dark:text-purple-300/80">
              {documentToShare ? (
                <>
                  Create a shareable link for <span className="font-medium text-blue-600 dark:text-pink-300">{documentToShare.name}</span>
                </>
              ) : (
                "Create a shareable link for this document"
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 relative z-10">
            {!shareLink ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-purple-200">
                    Link expiration
                  </label>
                  <Select 
                    value={sharingExpiration.toString()} 
                    onValueChange={(value) => setSharingExpiration(parseInt(value))}
                  >
                    <SelectTrigger className="w-full bg-white/90 dark:bg-slate-800/90 border border-gray-300 dark:border-purple-500/30 text-gray-900 dark:text-purple-200">
                      <SelectValue placeholder="Select expiration days" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-purple-500/30">
                      <SelectItem value="1" className="text-gray-900 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-500/20">1 day</SelectItem>
                      <SelectItem value="3" className="text-gray-900 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-500/20">3 days</SelectItem>
                      <SelectItem value="7" className="text-gray-900 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-500/20">7 days</SelectItem>
                      <SelectItem value="14" className="text-gray-900 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-500/20">14 days</SelectItem>
                      <SelectItem value="30" className="text-gray-900 dark:text-purple-200 hover:bg-gray-100 dark:hover:bg-purple-500/20">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-center mt-6">
                  <Button
                    onClick={handleCreateShareLink}
                    disabled={isSharing}
                    className="w-full py-2 px-4 bg-green-600 text-white hover:bg-green-700 dark:bg-gradient-to-r dark:from-green-600 dark:to-blue-600 dark:hover:from-green-500 dark:hover:to-blue-500 dark:border-green-700/50"
                  >
                    {isSharing ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating link...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <LinkIcon className="w-5 h-5 mr-2" />
                        Create Shareable Link
                      </span>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-purple-200">
                    Shareable Link
                  </label>
                  <div className="flex">
                    <Input
                      value={shareLink}
                      readOnly
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="flex-1 bg-white/90 dark:bg-slate-800/90 border border-gray-300 dark:border-purple-500/30 text-gray-900 dark:text-purple-200"
                    />
                    <Button
                      onClick={handleCopyLink}
                      className="ml-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-purple-400">
                    Anyone with this link can access the document until{' '}
                    <span className="font-semibold">
                      {new Date(Date.now() + sharingExpiration * 24 * 60 * 60 * 1000).toLocaleDateString()} 
                      {' '}({sharingExpiration} days from now)
                    </span>
                  </p>
                </div>
                <div className="flex flex-col space-y-3 mt-4">
                  <Button
                    onClick={handleDisableSharing}
                    variant="destructive"
                    disabled={isSharing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-900/80 dark:text-pink-100 dark:hover:bg-red-800/90 dark:border-red-700/50"
                  >
                    {isSharing ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Disabling...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <X className="w-5 h-5 mr-2" />
                        Disable Sharing
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShareDialogOpen(false)}
                    variant="outline"
                    className="w-full border border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-slate-800/50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-900/30"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}