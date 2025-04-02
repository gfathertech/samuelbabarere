
import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  url: string;
}

export default function DocumentViewer({ url }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="max-w-full"
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div className="mt-4 flex gap-4 items-center">
        <button 
          onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
          disabled={pageNumber <= 1}
          className="px-3 py-1 bg-pink-500 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p>
          Page {pageNumber} of {numPages}
        </p>
        <button
          onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
          disabled={pageNumber >= numPages}
          className="px-3 py-1 bg-pink-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
