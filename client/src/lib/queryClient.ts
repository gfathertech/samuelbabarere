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
  console.log('Environment:', import.meta.env.PROD ? 'Production' : 'Development');
  console.log('API_URL from config:', API_URL);
  
  // Already a full URL - return as is
  if (path.startsWith('http')) {
    console.log('Full URL provided, returning as is:', path);
    return path;
  }
  
  // Handle production environment (Vercel deployment)
  if (import.meta.env.PROD) {
    // Strip any trailing slashes from the API_URL
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    
    // If path already includes /api, we need to handle it carefully
    if (path.startsWith('/api/')) {
      // The API_URL from config might already include /api
      if (baseUrl.endsWith('/api')) {
        // Remove /api from the path to avoid duplication
        const apiPath = path.substring(4); // Remove /api prefix (keeping the slash)
        const result = `${baseUrl}${apiPath}`;
        console.log('Production URL (API_URL already has /api):', result);
        return result;
      } else {
        // API_URL doesn't have /api, so we can use the path as is
        const result = `${baseUrl}${path}`;
        console.log('Production URL (adding path with /api):', result);
        return result;
      }
    } else {
      // No /api in path, check if we need to add it
      if (baseUrl.endsWith('/api')) {
        // API_URL already has /api, just add the endpoint
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const result = `${baseUrl}${normalizedPath}`;
        console.log('Production URL (appending to API_URL with /api):', result);
        return result;
      } else {
        // Need to add /api to the URL
        const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
        const result = `${baseUrl}/api/${normalizedPath}`;
        console.log('Production URL (adding /api/ to path):', result);
        return result;
      }
    }
  } 
  
  // Development environment - use relative paths
  else {
    // If path already includes /api, keep it as is
    if (path.startsWith('/api/')) {
      console.log('Development URL (with /api):', path);
      return path;
    }
    
    // Add /api prefix for paths that don't have it
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const result = `/api${normalizedPath}`;
    console.log('Development URL:', result);
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
