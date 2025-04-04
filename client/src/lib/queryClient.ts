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
