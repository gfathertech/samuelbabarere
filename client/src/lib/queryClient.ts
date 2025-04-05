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
  // For debugging
  console.log('getFullApiUrl input:', path);
  
  // Already a full URL - return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Handle production environment (GitHub Pages deployment)
  if (import.meta.env.PROD) {
    // Use API_URL from config which should point to Koyeb backend
    const koyebBaseUrl = API_URL.endsWith('/api') 
      ? API_URL 
      : `${API_URL}${API_URL.endsWith('/') ? '' : '/'}api`;
      
    // If path already includes /api, extract the actual endpoint path
    if (path.startsWith('/api/')) {
      const apiPath = path.substring(5); // Remove /api/ prefix (including the trailing slash)
      const result = `${koyebBaseUrl}/${apiPath}`;
      console.log('Production API URL (with /api/ in path):', result);
      return result;
    }
    
    // No /api prefix - normalize path and add to Koyeb URL
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const result = `${koyebBaseUrl}/${normalizedPath}`;
    console.log('Production API URL:', result);
    return result;
  } 
  
  // Development environment - use relative paths
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
