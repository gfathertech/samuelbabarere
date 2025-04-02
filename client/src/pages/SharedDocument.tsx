import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import DocumentPreview from "@/components/document/DocumentPreview";
import PreviewSkeleton from '@/components/document/PreviewSkeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { Helmet } from 'react-helmet';

interface SharedDocumentPreview {
  _id: string;
  name: string;
  type: string;
  content: string;
  fileType: string;
  previewAvailable: boolean;
  createdAt: string;
  expiresAt?: string; // Optional expiration date
}

export default function SharedDocument() {
  const [, params] = useRoute('/shared/:token');
  const token = params?.token;
  
  const { data, error, isLoading } = useQuery<SharedDocumentPreview>({
    queryKey: ['/api/shared', token],
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Loading Shared Document...</h1>
        <PreviewSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Error Loading Shared Document</h1>
        <div className="p-8 border rounded-lg bg-red-50 text-red-800">
          <p>This shared link is no longer valid or has expired.</p>
          <p className="mt-4">Please contact the person who shared this document with you for a new link.</p>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    // Create an invisible link and click it to trigger download
    const link = document.createElement('a');
    link.href = data.content;
    link.download = data.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Shared Document - {data.name}</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download size={16} />
          Download
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden shadow-lg">
        <DocumentPreview 
          type={data.type} 
          content={data.content}
          name={data.name} 
          docId={data._id}
        />
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>This is a shared document.{data.expiresAt && (
          <> This link will expire on {new Date(data.expiresAt).toLocaleString()}.</>
        )}</p>
      </div>
    </div>
  );
}