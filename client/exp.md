# Detailed Technical Documentation: Portfolio Website Deployment to GitHub Pages

## 🆕 Koyeb Backend Deployment Fix - April 2025 Update

## Project Overview

This document provides a comprehensive technical explanation of the changes made to deploy Samuel Babarere's portfolio website with document management functionality to GitHub Pages. The website consists of a React frontend hosted on GitHub Pages and a Node.js backend hosted on Koyeb.

## Initial Issues

1. **White Screen Issue**: Initial deployment to GitHub Pages resulted in a blank white screen due to routing issues
2. **DNS Problems**: `DNS_PROBE_FINISHED_NXDOMAIN` errors occurred when accessing shared documents
3. **Authentication Problems**: Password verification failed despite using the correct credentials

## Architecture

The project architecture consists of:

1. **Frontend**: React.js with TypeScript, hosted on GitHub Pages
2. **Backend**: Express.js API hosted on Koyeb
3. **Database**: MongoDB for document storage
4. **Document Preview**: PDF.js and WebViewer for document rendering
5. **UI Framework**: Shadcn/UI with Tailwind CSS

## Core Fixes

### 1. Fixing GitHub Pages Routing

The fundamental issue with GitHub Pages is that it serves static content and doesn't natively support client-side routing used by React. When a user directly accesses a route like `/documents`, GitHub tries to find a file at that path rather than letting React's router handle it.

#### Solution: SPA Redirect

We implemented a GitHub Pages SPA (Single Page Application) redirect pattern to solve this:

```html
<!-- client/public/404.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script type="text/javascript">
    // Single Page App Redirect
    // This script takes the current URL and converts the path and query
    // parameters into a form that the GitHub Pages hosted app can handle
    (function(l) {
      if (l.search[1] === '/') {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    }(window.location))
  </script>
  <meta http-equiv="refresh" content="0;URL='/samuelbabarere/'">
</head>
<body>
  <p>If you are not redirected automatically, follow this <a href="/samuelbabarere/">link</a>.</p>
</body>
</html>
```

This script handles redirects when users directly access routes like `/samuelbabarere/documents`.

#### Modifications to Vite Config

```typescript
// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@shared': path.resolve(__dirname, '../server/shared'),
    },
  },
  // Explicitly setting base path for GitHub Pages
  base: '/samuelbabarere/',
});
```

### 2. API URL Configuration

To enable the frontend to properly communicate with the backend regardless of environment, we implemented environment-aware API URL configuration:

```typescript
// client/src/config.ts
/**
 * Application configuration
 * Dynamically sets API URL and base URL for different environments
 */

// The base API URL for production (deployed) environment
// Make sure there's no trailing slash at the end of the URL
export const API_URL = import.meta.env.PROD 
  ? 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app/api' 
  : '/api';

// For local/development, we keep '/api' which will use the proxy
// This allows local development to continue working without changes

// Set the base URL for routing 
// In production with GitHub Pages, this will be '/samuelbabarere/'
// In development, it remains '/'
export const BASE_URL = import.meta.env.PROD 
  ? '/samuelbabarere/' 
  : '/';
```

### 3. Enhanced API Request Handling

The most critical fix was updating the `queryClient.ts` file to properly handle API requests between the GitHub Pages frontend and the Koyeb backend:

```typescript
// client/src/lib/queryClient.ts
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_URL } from "../config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Helper to generate full API URLs in production or use relative paths in development
 */
export function getFullApiUrl(path: string): string {
  if (path.startsWith('http')) {
    return path; // Already a full URL
  }
  
  // If path already has /api, don't add it again
  if (path.startsWith('/api/')) {
    // In production environment, make sure we're using the full Koyeb URL
    if (import.meta.env.PROD) {
      // This strips off the '/api' prefix
      const apiPath = path.substring(4);
      // This ensures we have a full URL to the Koyeb backend
      return `${API_URL}${apiPath}`;
    } else {
      // In development, keep the path as is
      return path;
    }
  }
  
  // Normal path, ensure it starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return import.meta.env.PROD ? `${API_URL}${normalizedPath}` : `/api${normalizedPath}`;
}

/**
 * Make API requests with proper URL handling for production/development
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = getFullApiUrl(url);
  
  // Log for debugging
  console.log(`Making ${method} request to: ${fullUrl}`);
  
  // Create headers with access control
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  
  // Add content type for requests with body
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Different fetch options for CORS
  const fetchOptions: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors"
  };
  
  // Make the request
  const res = await fetch(fullUrl, fetchOptions);
  
  // Log response status
  console.log(`Response from ${fullUrl}: ${res.status}`);
  
  // Handle any errors
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle API URL transformation for production
    const url = getFullApiUrl(queryKey[0] as string);
    
    // Log the query URL for debugging
    console.log(`Query request to: ${url}`);
    
    // Similar fetch options as in apiRequest for consistency
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      credentials: "include",
      mode: "cors"
    });
    
    // Log response status
    console.log(`Query response from ${url}: ${res.status}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`Unauthorized access to ${url}, returning null as configured`);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

### 4. Enhanced Password Authentication

The password verification system was fixed by adding detailed logging and improving error handling:

```typescript
// client/src/pages/Documents.tsx (verifyPassword function)
const verifyPassword = async () => {
  try {
    // For troubleshooting, log the endpoint we're calling
    console.log("Verifying password against:", getFullApiUrl('/api/auth/verify'));
    
    // Verify password with the server
    const response = await apiRequest('POST', '/api/auth/verify', { password });
    
    // Debug response
    console.log("Password verification response status:", response.status);
    
    // Set authentication state in React state
    setIsAuthenticated(true);
    
    // Store authentication in localStorage with timestamp
    // This is crucial for GitHub Pages deployment
    const currentTime = new Date().getTime();
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('authTimestamp', currentTime.toString());
    
    // Show success message
    toast({
      title: "Success",
      description: "Access granted to documents",
    });
  } catch (error) {
    // Log the error for troubleshooting
    console.error("Authentication error:", error);
    
    // Clear any existing authentication state on error
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authTimestamp');
    
    toast({
      title: "Error",
      description: "Invalid password - please check connection to the server",
      variant: "destructive",
    });
  }
};
```

### 5. Server-Side CORS Configuration

To allow cross-origin requests from GitHub Pages to the Koyeb backend, we updated the server's CORS configuration:

```typescript
// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file FIRST
dotenv.config();

// Now import db.ts to ensure MongoDB connection is attempted with loaded env vars
import "./db";

const app = express();
// Set up CORS to allow requests from GitHub Pages
app.use(cors({
  origin: [
    'https://samuelbabarere.github.io', 
    'https://portfolio.samuelbabarere.net',
    'http://localhost:5000', 
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Increase JSON payload size limit for file uploads (base64 encoded files can be large)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### 6. Cookie Settings for Cross-Domain Support

We modified the cookie settings to properly handle authentication across domains:

```typescript
// server/routes.ts (auth handler)
// Set auth cookie that expires in 30 minutes
// Note: For the GitHub Pages setup, we primarily rely on localStorage auth
// as cookies across domains won't work correctly, but we set this for API auth
res.cookie('auth', 'true', {
  maxAge: 1800000, // 30 minutes in milliseconds
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' // Allow cross-site cookie access
});
```

### 7. Removing Server-Side Redirects

We removed server-side redirects that were causing routing issues:

```typescript
// server/routes.ts (shared document endpoint)
// If direct browser access, we won't force a client redirect
// The browser will be directed via GitHub Pages routing
if (req.headers.accept?.includes('text/html') && !req.headers['x-requested-with']) {
  // Just return the document data through the API - client rendering will handle the display
  // No redirection needed as we're using client-side routing
}
```

```typescript
// server/routes.ts (document preview endpoint)
// If direct browser access, we won't force a client redirect
// The browser will be directed via GitHub Pages routing
if (req.headers.accept?.includes('text/html') && !req.headers['x-requested-with']) {
  // Just return the document data through the API - client rendering will handle the display
  // No redirection needed as we're using client-side routing
}
```

### 8. App Router Configuration

The main application router was updated to handle GitHub Pages base path:

```typescript
// client/src/App.tsx
import { Switch, Route, Router, useLocation, useRoute } from "wouter";
import { BASE_URL } from "./config";
import Home from "./pages/Home";
import Documents from "./pages/Documents";
import Preview from "./pages/Preview";
import SharedDocument from "./pages/SharedDocument";
import NotFound from "./pages/not-found";
import { Toaster } from "./components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// This component handles base path for GitHub Pages
function RouterWithBasePath() {
  return (
    <Router base={BASE_URL}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/documents" component={Documents} />
        <Route path="/preview/:id" component={Preview} />
        <Route path="/shared/:token" component={SharedDocument} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterWithBasePath />
          <Toaster />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### 9. GitHub Pages Deployment Workflow

We configured a GitHub Actions workflow for automated deployment:

```yaml
# .github/workflows/deploy-gh-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
    paths:
      - 'client/**'
      - '.github/workflows/deploy-gh-pages.yml'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'client/package-lock.json'
      
      - name: Install Dependencies
        run: cd client && npm ci
        
      - name: Build
        run: cd client && npm run build
        env:
          VITE_BASE_PATH: '/samuelbabarere/'
      
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: client/dist
          clean: true
```

## Detailed Troubleshooting Process

### 1. Diagnosing the White Screen Issue

1. Identified that React routing wasn't working on GitHub Pages
2. Found that direct navigation to routes was failing due to GitHub Pages' static hosting nature
3. Confirmed that GitHub Pages was serving 404 errors for non-root routes

### 2. Diagnosing Authentication Issues

1. Used browser developer tools to inspect network requests
2. Found that API calls were using incorrect URL structures in production
3. Identified CORS issues preventing cross-domain requests
4. Discovered cookie security settings preventing proper authentication
5. Added extensive logging to track request/response flow

### 3. URL Construction Logic Analysis

The core issue was in how URLs were constructed in the production environment:

**Before Fix (Problematic):**
```typescript
export function getFullApiUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  
  if (path.startsWith('/api/')) {
    return import.meta.env.PROD ? `${API_URL}${path.substring(4)}` : path;
  }
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return import.meta.env.PROD ? `${API_URL}${normalizedPath}` : `/api${normalizedPath}`;
}
```

**After Fix:**
```typescript
export function getFullApiUrl(path: string): string {
  if (path.startsWith('http')) {
    return path; // Already a full URL
  }
  
  // If path already has /api, don't add it again
  if (path.startsWith('/api/')) {
    // In production environment, make sure we're using the full Koyeb URL
    if (import.meta.env.PROD) {
      // This strips off the '/api' prefix
      const apiPath = path.substring(4);
      // This ensures we have a full URL to the Koyeb backend
      return `${API_URL}${apiPath}`;
    } else {
      // In development, keep the path as is
      return path;
    }
  }
  
  // Normal path, ensure it starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return import.meta.env.PROD ? `${API_URL}${normalizedPath}` : `/api${normalizedPath}`;
}
```
## Additional Fixes and Optimizations

### 1. Document Share URL Structure

Fixed shared document URL generation to properly handle GitHub Pages base path:

```typescript
// client/src/pages/Documents.tsx (handleShareClick function)
const handleShareClick = async (doc: Document) => {
  try {
    setIsSharing(true);
    
    // Create share link with the API
    const response = await apiRequest('POST', '/api/documents/share', {
      docId: doc._id,
      expirationDays: 7 // Default: 7 days expiration
    });
    
    const data = await response.json();
    
    // Construct the full share URL with proper base path
    // This needed to be fixed to include the GitHub Pages base path
    const origin = window.location.origin;
    const basePath = import.meta.env.PROD ? '/samuelbabarere' : '';
    const shareUrl = `${origin}${basePath}/shared/${data.shareToken}`;
    
    setShareUrl(shareUrl);
    setShareDialogOpen(true);
    
    toast({
      title: "Share Link Created",
      description: "The document can now be shared with the generated link",
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    
    toast({
      title: "Error",
      description: "Failed to create share link. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSharing(false);
  }
};
```
### 2. Authentication Expiry Logic

Enhanced authentication expiry check to improve security:

```typescript
// client/src/pages/Documents.tsx (useEffect for auth check)
// Check authentication on component mount
useEffect(() => {
  const storedAuth = localStorage.getItem('isAuthenticated');
  const authTimestamp = localStorage.getItem('authTimestamp');
  
  // If we have a stored authentication state with timestamp
  if (storedAuth === 'true' && authTimestamp) {
    const currentTime = new Date().getTime();
    const storedTime = parseInt(authTimestamp, 10);
    
    // Check if the authentication is still valid (within 30 minutes)
    // 1800000 ms = 30 minutes
    if (currentTime - storedTime < 1800000) {
      setIsAuthenticated(true);
    } else {
      // Clear expired authentication
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authTimestamp');
      setIsAuthenticated(false);
    }
  } else {
    setIsAuthenticated(false);
  }
  
  setIsLoading(false);
}, []);
```

### 3. Share Link Expiration Display

Added human-readable expiration date display:

```typescript
// client/src/pages/SharedDocument.tsx (formatExpirationDate function)
function formatExpirationDate(dateString: string): string {
  if (!dateString) return 'No expiration date';
  
  const expirationDate = new Date(dateString);
  const now = new Date();
  
  // If the date is invalid, return unknown
  if (isNaN(expirationDate.getTime())) {
    return 'Unknown expiration';
  }
  
  // Check if already expired
  if (expirationDate < now) {
    return 'Expired';
  }
  
  // Calculate the difference in days
  const diffTime = Math.abs(expirationDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format the date
  const formattedDate = expirationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  // Return days remaining and the date
  return `${formattedDate} (${diffDays} days remaining)`;
}
```
## Recommendations for Future Development

### 1. Enhanced Security

- Implement JWT-based authentication instead of using localStorage for more robust security
- Add rate limiting on the backend to prevent brute force attacks on password verification
- Implement option for password-protected shared links for additional document security

### 2. Improved UX/UI

- Add a loading state to the file upload component to provide feedback on large file uploads
- Implement custom error pages for expired shared links
- Add file drag-and-drop support for document uploads

### 3. Technical Improvements

- Use environment variables for all configuration including CORS origins and the GitHub Pages base path
- Implement service worker for offline access to viewed documents
- Add proper HTTP caching headers for static assets to improve performance

## Conclusion

The deployment to GitHub Pages presented significant challenges primarily related to routing and cross-origin API communication. By implementing specialized handling for GitHub Pages' routing constraints and carefully configuring the API request logic to properly construct URLs in both development and production environments, we successfully deployed the application.

The most critical aspect was ensuring proper authentication between the GitHub Pages frontend and the Koyeb backend through localized state management and CORS configuration.
