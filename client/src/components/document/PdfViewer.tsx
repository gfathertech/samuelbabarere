
import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use CDN for worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
console.log('PDF.js Worker configured with version:', pdfjsLib.version);

interface PdfViewerProps {
  content: string;
  docId?: string;
}

function PdfViewer({ content }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) {
      console.warn('Cannot render PDF page - document or canvas not ready');
      return;
    }
    
    try {
      // Get the page
      console.log(`Rendering PDF page ${pageNum} of ${totalPages}`);
      const page = await pdfDoc.getPage(pageNum);
      
      // Setup canvas
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Failed to get canvas context');
        return;
      }

      // Calculate appropriate scale for the viewport based on container width
      const containerWidth = canvas.parentElement?.clientWidth || 800;
      const originalViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / originalViewport.width;
      const viewport = page.getViewport({ scale });

      // Set canvas dimensions to match the viewport
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the page
      console.log(`Rendering PDF page with dimensions: ${viewport.width}x${viewport.height}`);
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      console.log(`Page ${pageNum} rendered successfully`);
    } catch (renderError) {
      console.error('Error rendering PDF page:', renderError);
      setError(`Failed to render page ${pageNum}`);
    }
  };

  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading PDF document');
        
        // Check if content is valid
        if (!content) {
          setError('No PDF content provided');
          setLoading(false);
          return;
        }
        
        // Extract base64 data
        let pdfData;
        try {
          // Handle both direct base64 strings and data URLs
          if (content.includes(',')) {
            console.log('Content appears to be a data URL, extracting base64 part');
            pdfData = atob(content.split(',')[1]);
          } else {
            console.log('Content appears to be direct base64, decoding');
            pdfData = atob(content);
          }
          console.log(`Decoded PDF data length: ${pdfData.length} bytes`);
        } catch (decodeError) {
          console.error('Failed to decode base64 content:', decodeError);
          
          // Provide more specific error based on content length
          if (!content || content.length < 100) {
            setError('PDF data is empty or too short - possibly a server connection issue');
          } else if (content.startsWith('<!DOCTYPE html>') || content.includes('<html>')) {
            setError('Received HTML instead of PDF data - server returned an error page');
            console.warn('HTML content received instead of PDF:', content.substring(0, 200) + '...');
          } else {
            setError(`Invalid PDF data format: ${(decodeError as Error).message || 'Base64 decoding failed'}`);
          }
          
          // Log content details for debugging
          console.info('Content details:', {
            length: content.length,
            startsWithDataUri: content.startsWith('data:'),
            firstChars: content.substring(0, 50) + '...',
          });
          
          setLoading(false);
          return;
        }
        
        // Create PDF document
        console.log('Creating PDF document from data');
        
        try {
          // Use a timeout to prevent hanging
          const loadingTask = pdfjsLib.getDocument({ data: pdfData });
          
          // Add loading task error handler for password protected PDFs
          const originalOnPassword = loadingTask.onPassword;
          loadingTask.onPassword = function(updateCallback: any, reason: any) {
            console.error('PDF is password protected:', reason);
            setError('This PDF is password protected and cannot be viewed in the browser');
            setLoading(false);
            // Call original handler if it exists
            if (originalOnPassword) {
              originalOnPassword.call(loadingTask, updateCallback, reason);
            }
          };
          
          // Set timeout for PDF loading
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('PDF loading timed out after 10 seconds')), 10000);
          });
          
          // Race between PDF loading and timeout
          const pdf = await Promise.race([loadingTask.promise, timeoutPromise]) as any;
          
          console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setLoading(false);
          
          // Render the first page
          renderPage(1);
        } catch (pdfError: any) {
          console.error('Error loading PDF:', pdfError);
          
          // Provide more specific error messages
          if (pdfError.name === 'PasswordException') {
            setError('This PDF is password protected and cannot be viewed in the browser');
          } else if (pdfError.message?.includes('timed out')) {
            setError('PDF loading timed out - the document may be too large or corrupted');
          } else if (pdfError.message?.includes('Invalid PDF')) {
            setError('Invalid PDF format - the document may be corrupted');
          } else if (pdfError.name === 'MissingPDFException') {
            setError('PDF file not found or empty');
          } else {
            setError(`Failed to load PDF document: ${pdfError.message || 'Unknown error'}`);
          }
          
          setLoading(false);
        }
      } catch (error: any) {
        console.error('General error handling PDF:', error);
        setError(`Failed to load PDF: ${error.message || 'Unknown error'}`);
        setLoading(false);
      }
    };

    if (content) {
      loadPdf();
    } else {
      setError('No PDF content provided');
      setLoading(false);
    }
  }, [content]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc]);

  // Display error state if there is an error
  if (error) {
    // Categorize the error for better user feedback
    const isServerError = error.includes('server') || 
                          error.includes('Failed to load') || 
                          error.includes('No PDF content') ||
                          error.includes('HTML instead of PDF') ||
                          error.includes('empty or too short');
                          
    const isParsingError = error.includes('Invalid PDF') || 
                           error.includes('decode') || 
                           error.includes('corrupted');
                           
    const isPasswordError = error.includes('password protected');
    
    const isTimeoutError = error.includes('timed out');
    
    const isNetworkError = error.includes('connection') ||
                           error.includes('network');
    
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-700 mb-1">PDF Preview Failed</h3>
        <p className="text-red-600 font-medium text-center mb-3">{error}</p>
        
        <div className="mt-2 text-sm bg-red-50 p-4 rounded-md max-w-md border border-red-100">
          <p className="font-semibold text-red-800 mb-2">Troubleshooting suggestions:</p>
          
          {isServerError && (
            <ul className="list-disc pl-5 text-red-700 space-y-1">
              <li>There may be a temporary connection issue with our document server</li>
              <li>Try refreshing the page or coming back later</li>
              <li>Check if the document still exists in your library</li>
              {import.meta.env.PROD && (
                <li>If this persists, check that the Koyeb backend URL in config.ts is correct</li>
              )}
            </ul>
          )}
          
          {isParsingError && (
            <ul className="list-disc pl-5 text-red-700 space-y-1">
              <li>The PDF file appears to be corrupted or in an unsupported format</li>
              <li>Try downloading the file instead of previewing it</li>
              <li>If this document was recently uploaded, try uploading it again</li>
            </ul>
          )}
          
          {isPasswordError && (
            <ul className="list-disc pl-5 text-red-700 space-y-1">
              <li>This PDF is password-protected and cannot be previewed in the browser</li>
              <li>Download the file and open it with a PDF reader to enter the password</li>
              <li>Consider removing the password protection before uploading</li>
            </ul>
          )}
          
          {isTimeoutError && (
            <ul className="list-disc pl-5 text-red-700 space-y-1">
              <li>The PDF may be too large or complex for the browser to render</li>
              <li>Try downloading the file to view it locally</li>
              <li>If using a mobile device, try on a desktop computer instead</li>
            </ul>
          )}
          
          {isNetworkError && (
            <ul className="list-disc pl-5 text-red-700 space-y-1">
              <li>Check your internet connection</li>
              <li>Try disabling any VPN or firewall that might be blocking connections</li>
              <li>Refresh the page and try again</li>
            </ul>
          )}
          
          {!isServerError && !isParsingError && !isPasswordError && !isTimeoutError && !isNetworkError && (
            <ul className="list-disc pl-5 text-red-700 space-y-1">
              <li>Try downloading the document instead of previewing it</li>
              <li>Refresh the page and attempt to view it again</li>
              <li>Clear your browser cache and cookies, then try again</li>
              <li>If the issue persists, please contact support</li>
            </ul>
          )}
        </div>
      </div>
    );
  }
  
  // Display loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-gray-600">Loading PDF document...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center w-full max-w-full">
      <div className="overflow-auto w-full max-h-[70vh] border border-gray-200 rounded-lg shadow-inner p-2">
        <canvas 
          ref={canvasRef} 
          className="mx-auto shadow-lg rounded-lg"
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 p-2">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-pink-600 text-white rounded disabled:opacity-50 min-w-[90px] whitespace-nowrap"
        >
          Previous
        </button>
        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-pink-600 text-white rounded disabled:opacity-50 min-w-[90px] whitespace-nowrap"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PdfViewer;
