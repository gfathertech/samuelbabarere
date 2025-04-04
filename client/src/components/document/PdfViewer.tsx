
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
          setError('Invalid PDF data format');
          setLoading(false);
          return;
        }
        
        // Create PDF document
        console.log('Creating PDF document from data');
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        
        console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setLoading(false);
        
        // Render the first page
        renderPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError('Failed to load PDF document');
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
    return (
      <div className="flex flex-col items-center justify-center p-6 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-center">{error}</p>
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
