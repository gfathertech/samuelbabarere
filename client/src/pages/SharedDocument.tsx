import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import DocumentPreview from "@/components/document/DocumentPreview";
import PreviewSkeleton from '@/components/document/PreviewSkeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Download, Clock, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getFullApiUrl, apiRequest } from '@/lib/queryClient';
import { BASE_URL } from '../config';

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
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  
  // Log initial component state
  useEffect(() => {
    console.log('SharedDocument: Component initialized with token', token);
    if (!token) {
      console.error('SharedDocument: No token available in URL');
    }
  }, [token]);

  // Use React Query to fetch the shared document
  const { data, error, isLoading, isError } = useQuery<SharedDocumentPreview>({
    queryKey: ['/api/shared', token],
    queryFn: async () => {
      const response = await apiRequest('GET', `/shared/${token}`);
      return response.json();
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
  
  // Log errors and success
  useEffect(() => {
    if (error) {
      console.error('SharedDocument: Error fetching shared document', error);
    }
    
    if (data) {
      console.log('SharedDocument: Successfully fetched document', { 
        name: data.name,
        type: data.type,
        hasContent: !!data.content,
        contentLength: data.content?.length || 0,
        expiresAt: data.expiresAt 
      });
    }
  }, [data, error]);

  // Check for expiration date and warn if close to expiring
  const isNearExpiration = () => {
    if (!data?.expiresAt) return false;
    
    const expiresAt = new Date(data.expiresAt);
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    return expiresAt.getTime() - now.getTime() < oneDayMs;
  };
  
  // Format expiration time in a user-friendly way
  const formatExpirationTime = () => {
    if (!data?.expiresAt) return null;
    
    const expiresAt = new Date(data.expiresAt);
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    // Check if already expired
    if (diffMs <= 0) {
      return "This link has expired";
    }
    
    // Less than an hour
    if (diffMs < 60 * 60 * 1000) {
      const minutes = Math.round(diffMs / (60 * 1000));
      return `Expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    // Less than a day
    if (diffMs < 24 * 60 * 60 * 1000) {
      const hours = Math.round(diffMs / (60 * 60 * 1000));
      return `Expires in ${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    // More than a day
    const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
    return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Helmet>
          <title>Loading Shared Document...</title>
        </Helmet>
        <h1 className="text-2xl font-bold mb-6">Loading Shared Document...</h1>
        <div className="border rounded-lg overflow-hidden shadow-md bg-white p-4">
          <div className="flex items-center justify-center mb-4">
            <div className="h-6 w-6 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <p>Fetching document details...</p>
          </div>
          <PreviewSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    console.error('SharedDocument: Cannot render document due to error or missing data');
    return (
      <div className="container mx-auto py-8 text-center">
        <Helmet>
          <title>Shared Document - Link Expired</title>
        </Helmet>
        <h1 className="text-2xl font-bold mb-6">Error Loading Shared Document</h1>
        <div className="p-8 border rounded-lg bg-red-50 text-red-800 max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="font-medium">This shared link is no longer valid or has expired.</p>
          <p className="mt-4">Please contact the person who shared this document with you for a new link.</p>
          <Button
            className="mt-6" 
            variant="outline"
            onClick={() => navigate(`${BASE_URL}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    try {
      console.log('SharedDocument: Initiating download for', data.name);
      setDownloadError(null);
      
      // Create an invisible link and click it to trigger download
      const link = document.createElement('a');
      
      // Check if content exists and has appropriate format
      if (!data.content) {
        throw new Error('Document content is missing');
      }
      
      link.href = data.content;
      link.download = data.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('SharedDocument: Download initiated successfully');
    } catch (err) {
      console.error('SharedDocument: Download error', err);
      setDownloadError('Failed to download the document. Please try again later.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Shared Document - {data.name}</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-sm text-gray-500">Shared document</p>
        </div>
        <Button 
          onClick={handleDownload} 
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white"
        >
          <Download size={16} />
          Download Document
        </Button>
      </div>
      
      {downloadError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          <p className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {downloadError}
          </p>
        </div>
      )}
      
      {data.expiresAt && isNearExpiration() && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
          <p className="flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              <strong>{formatExpirationTime()}</strong>. Ask the person who shared this document with 
              you for a new link if you need to access it after expiration.
            </span>
          </p>
        </div>
      )}
      
      <ErrorBoundary>
        <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
          <DocumentPreview 
            type={data.type} 
            content={data.content}
            name={data.name} 
            docId={data._id}
          />
        </div>
      </ErrorBoundary>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium mb-2">Document Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Type:</span> {data.fileType || data.type}
          </div>
          <div>
            <span className="text-gray-500">Created:</span> {new Date(data.createdAt).toLocaleString()}
          </div>
          {data.expiresAt && (
            <div className="md:col-span-2">
              <span className="text-gray-500">Expires:</span> {new Date(data.expiresAt).toLocaleString()}
              {isNearExpiration() && (
                <span className="ml-2 text-amber-600 font-medium">{formatExpirationTime()}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(`${BASE_URL}`)}
          className="text-gray-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        
        <a
          href={getFullApiUrl(`/shared/${token}/download`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
            <Download className="mr-2 h-4 w-4" /> Download File
          </Button>
        </a>
      </div>
    </div>
  );
}