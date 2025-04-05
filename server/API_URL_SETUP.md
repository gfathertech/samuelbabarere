# API URL Configuration Guide

When deploying the backend to Koyeb and the frontend to GitHub Pages, you need to properly connect them. This guide explains how to update the frontend with your Koyeb API URL.

## 1. Get Your Koyeb URL

After successful deployment on Koyeb, you'll receive a URL like:
```
https://example-app-username.koyeb.app
```

## 2. Update the Frontend Configuration

Open `client/src/config.ts` and update the `API_URL` constant:

```typescript
export const API_URL = import.meta.env.PROD 
  ? 'https://your-app-name.koyeb.app/api' // Replace with your Koyeb URL
  : '/api';
```

## 3. Test the Connection

After updating the URL:

1. Rebuild and redeploy your frontend to GitHub Pages
2. Open the browser console to check for any CORS or connection errors
3. Verify that API requests are going to the correct Koyeb URL

## Common Issues and Troubleshooting

### CORS Errors

If you see CORS errors in the console:

1. Ensure your Koyeb backend has the correct GitHub Pages URL in its CORS configuration
2. Check that the API URL doesn't have a trailing slash
3. Verify that your GitHub Pages URL is in the allowed origins list in `koyeb.ts`

### Connection Errors

If you're getting "connection invalid" errors:

1. Verify that your Koyeb server is running 
2. Make sure the URL in `config.ts` is correct and includes `/api`
3. Check for any network issues or if Koyeb is experiencing downtime

### API Structure

Remember that all API requests should:
- Be directed to `/api/...` endpoints
- Use appropriate HTTP methods (GET, POST, etc.)
- Include proper credentials and headers

## Production vs Development

The configuration is designed to automatically use:
- The full Koyeb URL when in production (GitHub Pages)
- The local development server when running locally

No manual switching is needed between environments.