/**
 * Application configuration
 * Dynamically sets API URL based on environment
 */

// The base API URL for production (deployed) environment
export const API_URL = import.meta.env.PROD 
  ? 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app/api' 
  : '/api';

// For local/development, we keep '/api' which will use the proxy
// This allows local development to continue working without changes

export const BASE_URL = import.meta.env.BASE_URL || '/';