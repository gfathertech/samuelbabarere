
import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  content: string;
  docId?: string;
}

function PdfViewer({ content }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    
    const page = await pdfDoc.getPage(pageNum);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const containerWidth = canvas.parentElement?.clientWidth || 800;
    const originalViewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / originalViewport.width;
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  };

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: atob(content.split(',')[1]) });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        renderPage(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    if (content) {
      loadPdf();
    }
  }, [content]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc]);

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
