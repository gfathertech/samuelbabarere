import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, PresentationIcon, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lazy, Suspense } from 'react';

// Lazy load the WebViewer component for better performance
const WebViewer = lazy(() => import('./WebViewer'));

interface DocumentPreviewProps {
  type: string;
  content: string | null;
  name?: string;
  docId?: string;
  error?: string | null;
}

export default function DocumentPreview({ type, content, name, docId, error: propError }: DocumentPreviewProps) {
  const [error] = useState<string | null>(propError || null);

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center p-4">
        <p>No preview available</p>
      </div>
    );
  }

  // Configure preview types
  const isPDF = type === 'application/pdf';
  const isImage = type.startsWith('image/') && (type.includes('jpeg') || type.includes('png'));
  const isOfficeDocument = type.includes('officedocument') || 
                          type === 'application/msword' || 
                          type === 'application/vnd.ms-excel' || 
                          type === 'application/vnd.ms-powerpoint';

  // Image preview
  if (isImage) {
    // For thumbnail or list view, show a compact preview
    if (name && docId && !window.location.pathname.includes('/preview/')) {
      return (
        <div className="p-2 flex flex-col items-center justify-center">
          <div className="bg-white rounded overflow-hidden shadow-md max-h-[200px] w-full">
            <div className="flex flex-col items-center justify-center h-[200px] bg-gray-100 p-4">
              <div className="w-[120px] h-[120px] overflow-hidden rounded-lg shadow-md mb-2 flex items-center justify-center bg-white">
                <img 
                  src={content} 
                  alt={name || 'Image preview'} 
                  className="max-w-full max-h-[120px] object-contain" 
                />
              </div>
              <p className="text-sm text-gray-600 text-center line-clamp-1">{name || 'Image'}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs flex items-center text-pink-600 hover:text-pink-800 bg-white whitespace-nowrap"
                >
                  <a href={`/preview/${docId}`} className="px-3 py-1.5">
                    <FileImage className="w-3.5 h-3.5 mr-1" /> View
                  </a>
                </Button>
                {docId && (
                  <Button 
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs flex items-center text-blue-600 hover:text-blue-800 bg-white whitespace-nowrap"
                  >
                    <a href={`/api/documents/${docId}/download`} download={name} className="px-3 py-1.5">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // For full page view
    return (
      <div className="p-2 flex items-center justify-center">
        <div className="max-w-full overflow-hidden rounded-lg shadow-lg border border-gray-200 p-2 bg-white">
          <img 
            src={content} 
            alt={name || 'Image preview'} 
            className="max-w-full max-h-[70vh] object-contain rounded" 
          />
        </div>
      </div>
    );
  }

  // PDF preview
  if (isPDF && content) {
    // For thumbnail or list view, show a compact preview
    if (name && docId && !window.location.pathname.includes('/preview/')) {
      return (
        <div className="p-2 flex flex-col items-center justify-center">
          <div className="bg-white rounded overflow-hidden shadow-md max-h-[200px] w-full">
            <div className="flex flex-col items-center justify-center h-[200px] bg-gray-100 p-4">
              <FileText className="w-12 h-12 text-pink-600 mb-2" />
              <p className="text-sm text-gray-600 text-center line-clamp-1">{name || 'PDF Document'}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs flex items-center text-pink-600 hover:text-pink-800 bg-white whitespace-nowrap"
                >
                  <a href={`/preview/${docId}`} className="px-3 py-1.5">
                    <FileText className="w-3.5 h-3.5 mr-1" /> View
                  </a>
                </Button>
                {docId && (
                  <Button 
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs flex items-center text-blue-600 hover:text-blue-800 bg-white whitespace-nowrap"
                  >
                    <a href={`/api/documents/${docId}/download`} download={name} className="px-3 py-1.5">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // This will be handled by the PdfViewer component in the parent component
    // Just in case we need a minimal preview
    return (
      <div className="p-2 flex justify-center items-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading PDF preview...</p>
        </div>
      </div>
    );
  }

  // Office document preview (Word, Excel, PowerPoint)
  if (isOfficeDocument && content) {
    // Determine the type of office document for the icon
    let Icon = FileText;
    let documentType = "Office Document";
    
    if (type.includes('wordprocessingml') || type === 'application/msword') {
      Icon = FileText;
      documentType = "Word Document";
    } else if (type.includes('spreadsheetml') || type === 'application/vnd.ms-excel') {
      Icon = FileSpreadsheet;
      documentType = "Excel Spreadsheet";
    } else if (type.includes('presentationml') || type === 'application/vnd.ms-powerpoint') {
      Icon = PresentationIcon;
      documentType = "PowerPoint Presentation";
    }

    // For thumbnail or list view, show this compact preview
    if (name && docId && !window.location.pathname.includes('/preview/')) {
      return (
        <div className="p-2 flex flex-col items-center justify-center">
          <div className="bg-white rounded overflow-hidden shadow-md max-h-[200px] w-full">
            <div className="flex flex-col items-center justify-center h-[200px] bg-gray-100 p-4">
              <Icon className="w-12 h-12 text-pink-600 mb-2" />
              <p className="text-sm text-gray-600 text-center line-clamp-1">{name || documentType}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs flex items-center text-pink-600 hover:text-pink-800 bg-white whitespace-nowrap"
                >
                  <a href={`/preview/${docId}`} className="px-3 py-1.5">
                    <Icon className="w-3.5 h-3.5 mr-1" /> View
                  </a>
                </Button>
                {docId && (
                  <Button 
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs flex items-center text-blue-600 hover:text-blue-800 bg-white whitespace-nowrap"
                  >
                    <a href={`/api/documents/${docId}/download`} download={name} className="px-3 py-1.5">
                      <Download className="w-3.5 h-3.5 mr-1" /> Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // For full page view with the WebViewer component
    if (window.location.pathname.includes('/preview/')) {
      return (
        <div className="p-2 flex flex-col items-center justify-center w-full">
          <Suspense fallback={
            <div className="flex items-center justify-center p-6">
              <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-2">Loading document viewer...</p>
            </div>
          }>
            <WebViewer content={content} fileType={type} docId={docId} />
          </Suspense>
        </div>
      );
    }
    
    // For list view, just show the icon and download button
    return (
      <div className="p-2 flex flex-col items-center justify-center">
        <div className="bg-white rounded overflow-hidden shadow-md max-h-[200px] w-full">
          <div className="flex flex-col items-center justify-center h-[200px] bg-gray-100 p-4">
            <Icon className="w-12 h-12 text-pink-600 mb-2" />
            <p className="text-sm text-gray-600 text-center">{documentType}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              <Button 
                variant="outline"
                size="sm"
                asChild
                className="text-xs flex items-center text-pink-600 hover:text-pink-800 bg-white whitespace-nowrap"
              >
                <a href={`/preview/${docId}`} className="px-3 py-1.5">
                  <Icon className="w-3.5 h-3.5 mr-1" /> View
                </a>
              </Button>
              {docId && (
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs flex items-center text-blue-600 hover:text-blue-800 bg-white whitespace-nowrap"
                >
                  <a href={`/api/documents/${docId}/download`} download={name} className="px-3 py-1.5">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For all other document types
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <FileText className="w-12 h-12 text-gray-400 mb-2" />
      <p className="text-sm text-gray-600 mb-2 text-center">{name || 'Document'}</p>
      <p className="text-xs text-gray-500 mb-3 text-center">This document type cannot be previewed</p>
      {docId && (
        <Button 
          variant="outline"
          size="sm"
          asChild
          className="mt-2 whitespace-nowrap"
        >
          <a href={`/api/documents/${docId}/download`} download={name} className="px-3 py-1.5">
            <Download className="w-4 h-4 mr-1" />
            Download
          </a>
        </Button>
      )}
    </div>
  );
}