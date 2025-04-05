# GitHub Pages Deployment Fixes

This document summarizes the fixes implemented to make the frontend correctly connect to the backend when deployed on GitHub Pages.

## Core Issues Addressed

1. **API URL Path Resolution**: Fixed URL construction to correctly handle the backend API endpoints.
2. **Cross-Origin Resource Sharing (CORS)**: Enhanced CORS handling for cross-domain requests.
3. **Error Handling**: Improved error handling to provide better feedback on connection issues.
4. **Document Preview Issues**: Fixed document preview and download functionality.

## Technical Implementation Details

### 1. API URL Path Resolution

The primary issue was correctly constructing API URLs when the frontend is hosted on GitHub Pages while the backend is on Koyeb. We improved the `getFullApiUrl` function in `client/src/lib/queryClient.ts` to:

- Handle multiple URL formats consistently
- Properly construct backend URLs in production
- Maintain relative URLs in development
- Avoid duplicate `/api` prefixes
- Add extensive logging for debugging

```javascript
export function getFullApiUrl(path: string): string {
  // Strip any trailing slashes from the API_URL
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  // Production environment (GitHub Pages)
  if (import.meta.env.PROD) {
    // Various path normalization logic to ensure correct URL construction
    // ...
  } else {
    // Development environment - use relative paths
    // ...
  }
}
```

### 2. Config File Structure

We clarified the configuration in `client/src/config.ts`:

- Added clear documentation on how API URLs are constructed
- Removed ambiguous comments
- Added explicit examples of URL formats
- Added a note about not including `/api` in the base URL

```javascript
export const API_URL = import.meta.env.PROD 
  ? 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app' 
  : '/api';

// IMPORTANT: The API_URL should NOT include '/api' at the end.
// The queryClient.ts will automatically handle adding '/api' to the path as needed.
```

### 3. Enhanced Error Handling in PDF Viewer

We significantly improved error handling in the PDF viewer component:

- Added more detailed error messages
- Categorized errors into different types (server, parsing, password, timeout, network)
- Added specific troubleshooting recommendations for each error type
- Enhanced decoding error detection
- Added timeout handling to prevent infinite loading states

### 4. Document Preview URL Fixes

Fixed how document preview and download URLs are constructed:

- Updated endpoints to use the pattern `/documents/:id/preview` instead of `/api/documents/:id/preview`
- Let the URL construction utility handle adding the `/api` prefix
- Added additional debugging information in network requests

## How to Verify

1. When the application is deployed to GitHub Pages, open the browser console
2. Check network requests to confirm they're correctly formed with the Koyeb backend URL
3. Verify document preview and download functionality works in production
4. Test error scenarios to ensure helpful error messages appear

## Future Maintenance

When updating the Koyeb backend URL:

1. Only change the base URL in `client/src/config.ts`
2. Do not include `/api` in the URL you set
3. The URL handling utility will automatically add the necessary path components
