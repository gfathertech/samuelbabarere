import React, { useRef, useEffect, useState } from 'react';
import type WebViewerType from '@pdftron/webviewer';

interface WebViewerProps {
  content: string;
  docId?: string;
  fileType: string;
}

const WebViewer: React.FC<WebViewerProps> = ({ content, fileType }) => {
  const viewer = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep track of whether the component is mounted
    let isMounted = true;
    let cleanupTasks: Array<() => void> = [];
    
    const loadWebViewer = async () => {
      let fileUrl = '';
      
      try {
        if (!viewer.current || !content) {
          setError('Unable to initialize document viewer');
          setLoading(false);
          return;
        }

        setLoading(true);

        // Import WebViewer dynamically to reduce initial load time
        const WebViewerModule = await import('@pdftron/webviewer');
        const PDFTron = WebViewerModule.default;

        // Get the base64 content from the data URL
        let base64Content = content;
        if (content.includes('base64,')) {
          base64Content = content.split('base64,')[1];
        }

        // Convert the base64 string to Uint8Array
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create a blob from the bytes for WebViewer
        const blob = new Blob([bytes]);
        fileUrl = URL.createObjectURL(blob);
        
        // Track for cleanup
        cleanupTasks.push(() => URL.revokeObjectURL(fileUrl));

        // Initialize WebViewer - using the direct initialDoc approach
        const instance: any = await PDFTron({
          path: '/webviewer/lib', // Path to the WebViewer assets
          initialDoc: fileUrl,
          filename: `document.${getExtensionFromMime(fileType)}`,
          extension: getExtensionFromMime(fileType),
          fullAPI: true,
          disabledElements: [
            'toolsHeader',
            'searchButton',
            'menuButton',
            'contextMenuPopup',
          ],
        }, viewer.current);

        // Listen for the document loaded event
        const documentLoadedHandler = () => {
          if (isMounted) {
            setLoading(false);
            console.log('Document loaded successfully');
          }
        };
        
        // Track for cleanup
        cleanupTasks.push(() => {
          if (instance && viewer.current) {
            instance.UI.dispose();
          }
        });

        // Add event listeners
        if (instance.Core && instance.Core.documentViewer) {
          instance.Core.documentViewer.addEventListener('documentLoaded', documentLoadedHandler);
        }

        // Handle WebViewer errors
        instance.UI.addEventListener('loaderror', (err: any) => {
          if (isMounted) {
            console.error('WebViewer error:', err);
            setError('Failed to load document');
            setLoading(false);
          }
        });

        // Fallback to automatically hide loading after a timeout
        const fallbackTimer = setTimeout(() => {
          if (isMounted && loading) {
            setLoading(false);
            console.log('Document loading timed out, showing viewer anyway');
          }
        }, 5000);
        
        // Track for cleanup
        cleanupTasks.push(() => clearTimeout(fallbackTimer));
        
      } catch (err) {
        if (isMounted) {
          console.error('WebViewer initialization error:', err);
          setError('Failed to initialize document viewer');
          setLoading(false);
        }
      }
    };

    loadWebViewer();

    // Cleanup function
    return () => {
      isMounted = false;
      cleanupTasks.forEach(task => task());
    };
  }, [content, fileType]);

  // Helper function to get file extension from MIME type
  const getExtensionFromMime = (mimeType: string): string => {
    switch (mimeType) {
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'docx';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'xlsx';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'pptx';
      case 'application/msword':
        return 'doc';
      case 'application/vnd.ms-excel':
        return 'xls';
      case 'application/vnd.ms-powerpoint':
        return 'ppt';
      default:
        // Extract extension from mime type if possible (e.g., 'application/pdf' -> 'pdf')
        const parts = mimeType.split('/');
        if (parts.length === 2) {
          return parts[1].split(';')[0]; // Remove parameters if any
        }
        return '';
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-6 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="webviewer-container w-full max-w-full overflow-hidden">
      <div 
        ref={viewer} 
        className="w-full rounded-lg border border-gray-200 shadow-inner" 
        style={{ 
          height: 'min(calc(100vh - 240px), 800px)',
          minHeight: '400px'
        }}
      ></div>
    </div>
  );
};

export default WebViewer;