/**
 * Application configuration
 * Dynamically sets API URL and base URL for different environments
 */

// The base API URL for production (Vercel) and development environments
// Priority: VITE_API_URL environment variable > hardcoded default URL > development fallback
export const API_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL as string || 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app') 
  : '/api';

// IMPORTANT: The API_URL should NOT include '/api' at the end.
// The queryClient.ts will automatically handle adding '/api' to the path as needed.
// This separation makes it easier to maintain and change the backend URL.

// Set the base URL for routing
// For Vercel deployment, we use root path '/' as Vercel handles routing properly
export const BASE_URL = '/';

/**
 * URL Handling Rules:
 * 
 * 1. Production (Vercel deployment):
 *    - API requests: API_URL + '/api' + endpoint
 *    - Example: https://efficient-freida-samuel-gfather-42709cdd.koyeb.app/api/documents
 * 
 * 2. Development (Local):
 *    - API requests: '/api' + endpoint
 *    - Example: /api/documents
 * 
 * If you change the Koyeb backend URL, update the API_URL value above.
 * Do not include '/api' in the API_URL - it will be added automatically.
 */