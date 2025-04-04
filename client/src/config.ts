/**
 * Application configuration
 * Dynamically sets API URL and base URL for different environments
 */

// The base API URL for production (deployed) environment
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