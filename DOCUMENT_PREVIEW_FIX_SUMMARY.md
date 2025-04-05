# Document Preview Error Fix Summary

## Problem
Users were experiencing the "Document preview not available - server error" message when attempting to preview documents, due to incorrect API URL construction when interacting with the Koyeb backend from GitHub Pages frontend.

## Root Causes
1. Inconsistent handling of API URL paths in different components
2. Incorrect path construction in the `getFullApiUrl` function
3. Missing `/api` prefix in some API requests
4. Inconsistent use of the CORS settings in fetch requests

## Fix Implementation

### 1. Enhanced URL Construction in queryClient.ts

Improved the `getFullApiUrl` function to properly construct URLs for all scenarios:

```typescript
export function getFullApiUrl(path: string): string {
  // For debugging
  console.log('getFullApiUrl input:', path);
  
  // Already a full URL
  if (path.startsWith('http')) {
    return path;
  }
  
  // Use API_URL from config for production environment
  if (import.meta.env.PROD) {
    // If path already includes /api, remove it to avoid duplication
    // since API_URL already contains /api suffix
    if (path.startsWith('/api/')) {
      const apiPath = path.substring(4); // Remove /api prefix
      const result = `${API_URL}${apiPath}`;
      console.log('Production API URL (with /api in path):', result);
      return result;
    }
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const result = `${API_URL}${normalizedPath}`;
    console.log('Production API URL:', result);
    return result;
  } 
  
  // Development environment
  else {
    // If path already includes /api, keep it as is
    if (path.startsWith('/api/')) {
      console.log('Development API URL (with /api):', path);
      return path;
    }
    
    // Add /api prefix for paths that don't have it
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const result = `/api${normalizedPath}`;
    console.log('Development API URL:', result);
    return result;
  }
}
```

### 2. Created Fixed DocumentPreview Component

Created an updated version of the DocumentPreview component (`DocumentPreviewFixed.tsx`) with proper URL construction for all download links:

```typescript
// Before
<a href={`${API_URL}/documents/${docId}/download`} download={name} className="px-3 py-1.5">

// After
<a href={getFullApiUrl(`/api/documents/${docId}/download`)} download={name} className="px-3 py-1.5">
```

### 3. Updated API Requests in Preview.tsx

Enhanced API requests to include the `/api` prefix and added proper CORS settings:

```typescript
// Before
const apiUrl = getFullApiUrl(`/documents/${id}/preview`);
const response = await fetch(apiUrl);

// After
const apiUrl = getFullApiUrl(`/api/documents/${id}/preview`);
const response = await fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  },
  credentials: 'include',
  mode: 'cors'
});
```

### 4. Fixed Download Buttons in Preview.tsx

Updated all download URLs to use the getFullApiUrl function with the /api prefix:

```typescript
// Before
onClick={() => window.open(getFullApiUrl(`/documents/${docId}/download`), '_blank')}

// After
onClick={() => window.open(getFullApiUrl(`/api/documents/${docId}/download`), '_blank')}
```

### 5. Updated API Calls in SharedDocument.tsx

Fixed API requests and download links in the SharedDocument component:

```typescript
// Before
const response = await apiRequest('GET', `/shared/${token}`);
<a href={getFullApiUrl(`/shared/${token}/download`)} target="_blank" rel="noopener noreferrer">

// After
const response = await apiRequest('GET', `/api/shared/${token}`);
<a href={getFullApiUrl(`/api/shared/${token}/download`)} target="_blank" rel="noopener noreferrer">
```

## How These Fixes Work

1. The enhanced `getFullApiUrl` function adds proper logging and handles all URL construction scenarios consistently.

2. In production (GitHub Pages) environment, all API requests now correctly point to the Koyeb backend with proper path handling.

3. The `/api` prefix is consistently added to all API paths, ensuring correct routing on both development and production environments.

4. CORS settings are properly applied to fetch requests, ensuring cross-domain requests work correctly between GitHub Pages frontend and Koyeb backend.

5. The fixed DocumentPreview component ensures all download links use the correct URL format.

These changes ensure API requests are properly routed to the Koyeb backend when the frontend is deployed on GitHub Pages, solving the "Document preview not available" error.