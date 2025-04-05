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

/**
 * IMPORTANT: When deploying to Koyeb, you'll get a new URL. 
 * Replace the URL above with your new Koyeb URL + '/api'
 * 
 * Example:
 * export const API_URL = import.meta.env.PROD 
 *   ? 'https://your-new-app-name.koyeb.app/api' 
 *   : '/api';
 */