import React, { useRef, useEffect, useState } from 'react';
import type WebViewerType from '@pdftron/webviewer';

interface WebViewerProps {
  content: string;
  docId?: string;
  fileType: string;
}

const WebViewer: React.FC<WebViewerProps> = ({ content, fileType, docId }) => {
  const viewer = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Log component initialization
  useEffect(() => {
    console.log('WebViewer: Component initialized', {
      fileType, 
      docId,
      contentLength: content ? content.length : 0
    });
    
    // Validate content format
    if (!content) {
      console.error('WebViewer: No content provided');
      setError('No document content available');
      setLoading(false);
      return;
    }
    
    // Validate file type
    if (!fileType) {
      console.error('WebViewer: No file type provided');
      setError('Unknown document format');
      setLoading(false);
      return;
    }
    
    const validFileTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint'
    ];
    
    if (!validFileTypes.includes(fileType)) {
      console.warn('WebViewer: Attempting to preview potentially unsupported file type', fileType);
    }
  }, [content, fileType, docId]);
  
  useEffect(() => {
    // Keep track of whether the component is mounted
    let isMounted = true;
    let cleanupTasks: Array<() => void> = [];
    
    const loadWebViewer = async () => {
      let fileUrl = '';
      
      try {
        if (!viewer.current || !content) {
          console.error('WebViewer initialization failed: viewer ref or content missing', {
            hasViewerRef: !!viewer.current,
            contentLength: content ? content.length : 0
          });
          setError('Unable to initialize document viewer');
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log('WebViewer: Loading document viewer');

        // Import WebViewer dynamically to reduce initial load time
        const WebViewerModule = await import('@pdftron/webviewer');
        const PDFTron = WebViewerModule.default;
        console.log('WebViewer: Module loaded successfully');

        // Get the base64 content from the data URL
        let base64Content = content;
        if (content.includes('base64,')) {
          base64Content = content.split('base64,')[1];
          console.log('WebViewer: Extracted base64 content from data URL');
        } else {
          console.log('WebViewer: Content does not contain base64 marker, using as is');
        }

        // Convert the base64 string to Uint8Array
        try {
          const binaryString = atob(base64Content);
          console.log(`WebViewer: Decoded base64 string, length: ${binaryString.length}`);
          
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create a blob from the bytes for WebViewer
          const blob = new Blob([bytes]);
          fileUrl = URL.createObjectURL(blob);
          console.log('WebViewer: Created blob URL for document', { fileUrl });
          
          // Track for cleanup
          cleanupTasks.push(() => URL.revokeObjectURL(fileUrl));
        } catch (decodeError) {
          console.error('WebViewer: Failed to decode base64 content', decodeError);
          setError('Invalid document format');
          setLoading(false);
          return;
        }

        try {
          // Initialize WebViewer - using the direct initialDoc approach
          console.log('WebViewer: Initializing viewer with extension', getExtensionFromMime(fileType));
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
            // Fix type errors - remove properties that cause issues
            // enableFilePicker: false,
            // preloadWorker: true,
          }, viewer.current);
          
          console.log('WebViewer: Instance created successfully');

          // Listen for the document loaded event
          const documentLoadedHandler = () => {
            if (isMounted) {
              setLoading(false);
              console.log('WebViewer: Document loaded successfully');
            }
          };
          
          // Track for cleanup
          cleanupTasks.push(() => {
            try {
              if (instance && instance.UI && viewer.current) {
                console.log('WebViewer: Running disposal cleanup');
                instance.UI.dispose();
              }
            } catch (disposeError) {
              console.error('WebViewer: Error during disposal', disposeError);
            }
          });

          // Add event listeners
          if (instance.Core && instance.Core.documentViewer) {
            console.log('WebViewer: Adding document loaded event listener');
            instance.Core.documentViewer.addEventListener('documentLoaded', documentLoadedHandler);
          } else {
            console.warn('WebViewer: documentViewer not available for event registration');
          }

          // Handle WebViewer errors
          instance.UI.addEventListener('loaderror', (err: any) => {
            if (isMounted) {
              console.error('WebViewer: Load error event', err);
              setError('Failed to load document');
              setLoading(false);
            }
          });
          
          // Log successful initialization
          console.log('WebViewer: Initialization complete, waiting for document to load');
        } catch (viewerError) {
          console.error('WebViewer: Error during viewer initialization', viewerError);
          setError('Error initializing document viewer');
          setLoading(false);
        }

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