import { useState, useEffect, Suspense, lazy } from "react";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileIcon } from '@/components/document/FileIcon';
import { motion, AnimatePresence } from "framer-motion";
import PreviewSkeleton from "@/components/document/PreviewSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";

const PdfViewer = lazy(() => import('@/components/document/PdfViewer'));
const DocumentPreview = lazy(() => import('@/components/document/DocumentPreview'));

interface DocumentPreview {
  type: string;
  content?: string;
  previewAvailable: boolean;
  name?: string;
  user?: string;
}

export default function Preview() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<DocumentPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Function to clear auth when going back to home
  const clearAuthAndNavigateHome = () => {
    // Clear auth cookie
    document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Clear localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authTimestamp');
    // Navigate to home
    navigate('/');
    // Notify user
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  useEffect(() => {
    const id = location.split('/')[2];
    if (!id) {
      setError("Invalid document ID");
      setLoading(false);
      return;
    }

    setDocId(id);
    const fetchPreview = async () => {
      try {
        setLoading(true);
        console.log('Fetching preview for document:', id);

        const response = await fetch(`/api/documents/${id}/preview`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Document preview response:', {
          type: data.type,
          hasContent: !!data.content,
          contentLength: data.content?.length,
          previewAvailable: data.previewAvailable,
          name: data.name
        });

        if (!data.content) {
          throw new Error("Document content is missing from server response");
        }

        setPreviewData(data);
        setError(null);
      } catch (err) {
        console.error("Preview error:", err);
        setError(err instanceof Error ? err.message : "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [location]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background p-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading preview...
            </Button>
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-pink-100">
            <PreviewSkeleton />
          </Card>
        </div>
      </motion.div>
    );
  }

  if (error || !previewData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
      >
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center p-6">
            <FileIcon fileType={previewData?.type || ''} size={40} />
            <h2 className="text-xl font-semibold mb-2">Document Preview Unavailable</h2>
            <p className="text-gray-500 mb-4 text-center">{error || "The document couldn't be previewed."}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/documents')}
                className="whitespace-nowrap"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
              </Button>
              <Button 
                variant="outline"
                onClick={clearAuthAndNavigateHome}
                className="text-pink-600 hover:text-pink-700 whitespace-nowrap"
              >
                Back to Home
              </Button>
              {docId && (
                <Button 
                  onClick={() => window.open(`/api/documents/${docId}/download`, '_blank')}
                  className="bg-pink-600 hover:bg-pink-700 whitespace-nowrap"
                >
                  <Download className="mr-2 h-4 w-4" /> Download File
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background p-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div className="mb-6 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/documents')}
              className="whitespace-nowrap"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Documents
            </Button>
            <Button 
              variant="outline"
              onClick={clearAuthAndNavigateHome}
              className="text-pink-600 hover:text-pink-700 whitespace-nowrap"
            >
              Back to Home
            </Button>
          </div>
          {docId && (
            <Button 
              variant="outline"
              onClick={() => window.open(`/api/documents/${docId}/download`, '_blank')}
              className="flex-shrink-0 flex items-center text-pink-600 border-pink-200 hover:text-pink-700 hover:bg-pink-50 whitespace-nowrap"
            >
              <Download className="mr-2 h-4 w-4" /> Download File
            </Button>
          )}
        </motion.div>

        <Card className="bg-white/80 backdrop-blur-sm border-pink-100 overflow-hidden">
          <CardContent className="p-0">
            <motion.div className="bg-gray-50 p-4 border-b flex items-center gap-3">
              <FileIcon fileType={previewData.type} size={24} />
              <div>
                <h2 className="text-xl font-semibold">{previewData.name || "Document Preview"}</h2>
                <p className="text-sm text-gray-500">{previewData.type}</p>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={docId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ErrorBoundary>
                  <Suspense fallback={<PreviewSkeleton />}>
                    {previewData.type === 'application/pdf' ? (
                      previewData.content && (
                        <div className="p-4">
                          <PdfViewer content={previewData.content} docId={docId || undefined} />
                        </div>
                      )
                    ) : (
                      <DocumentPreview
                        type={previewData.type}
                        content={previewData.content || null}
                        name={previewData.name}
                        docId={docId || undefined}
                        error={error}
                      />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}