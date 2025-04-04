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
    return import.meta.env.PROD ? `${API_URL}${path.substring(4)}` : path;
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
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

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
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
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
