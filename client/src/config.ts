/**
 * Application configuration
 * Dynamically sets API URL and base URL for different environments
 */

// The base API URL for production (deployed) environment
// For GitHub Pages deployments connecting to Koyeb
export const API_URL = import.meta.env.PROD 
  ? 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app' 
  : '/api';

// IMPORTANT: The API_URL should NOT include '/api' at the end.
// The queryClient.ts will automatically handle adding '/api' to the path as needed.
// This separation makes it easier to maintain and change the backend URL.

// Set the base URL for routing 
// In production with GitHub Pages, this will be '/samuelbabarere/'
// In development, it remains '/'
export const BASE_URL = import.meta.env.PROD 
  ? '/samuelbabarere/' 
  : '/';

/**
 * URL Handling Rules:
 * 
 * 1. Production (GitHub Pages):
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