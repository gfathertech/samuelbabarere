# Connecting GitHub Pages Frontend to Koyeb Backend

This guide explains how to update your frontend application (deployed on GitHub Pages) to connect with your backend API (deployed on Koyeb).

## 1. Get Your Koyeb API URL

After deploying your backend to Koyeb:

1. Log in to your Koyeb dashboard
2. Select your application
3. Copy the URL provided by Koyeb (e.g., `https://your-app-name.koyeb.app`)

## 2. Update Frontend Configuration

Open `client/src/config.ts` and update the `API_URL` constant:

```typescript
export const API_URL = import.meta.env.PROD 
  ? 'https://your-app-name.koyeb.app/api' // Replace with your Koyeb URL
  : '/api';
```

Make sure:
- You add `/api` at the end of the Koyeb URL
- There is no trailing slash after `/api`
- You keep the conditional logic so development mode still works locally

## 3. Build and Deploy Frontend

Build your frontend application and deploy it to GitHub Pages:

```bash
# Navigate to client directory
cd client

# Build the application
npm run build

# Deploy to GitHub Pages (if using the GitHub Action)
git add client/dist
git commit -m "Update build with new Koyeb API URL"
git push
```

## 4. Verify the Connection

1. Open your GitHub Pages website
2. Open browser developer tools (F12)
3. Check the Network tab for API requests
4. Verify that requests are going to your Koyeb URL
5. Check for any CORS or connection errors

## Common Issues and Solutions

### CORS Errors

If you see CORS errors in the console:

```
Access to fetch at 'https://your-app-name.koyeb.app/api/documents' from origin 'https://yourusername.github.io' has been blocked by CORS policy
```

Solution:
1. Check that your Koyeb backend has the correct CORS configuration
2. Make sure your GitHub Pages domain is listed in the allowed origins in server/koyeb.ts
3. Ensure you're using the credentials: 'include' option in fetch requests

### Connection Invalid Error

If you see "connection invalid" errors:

1. Double-check that your Koyeb server is running
2. Verify the URL in config.ts is correct
3. Test the Koyeb API directly using curl:

```bash
curl https://your-app-name.koyeb.app/api/health
# Should return: {"status":"healthy","timestamp":"..."}
```

4. Ensure you've properly built and deployed the frontend with the new URL

### Authentication Issues

If you're getting authentication errors:

1. Remember that cookies don't work across domains (GitHub Pages to Koyeb)
2. The application is designed to use localStorage for authentication
3. Make sure you're passing credentials in your API requests
4. Check that the Koyeb server has sameSite: 'none' for cookies

## Testing Your API Connection

Use the browser console to test your API connection:

```javascript
// Test health endpoint
fetch('https://your-app-name.koyeb.app/api/health')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('Connection error:', err));
```

## Architecture Overview

The application uses:

1. GitHub Pages for hosting the frontend (React)
2. Koyeb for hosting the backend API (Express)
3. MongoDB Atlas for the database

The koyeb.ts file is designed to be a standalone API-only entry point that doesn't require client files, making it perfect for deployment on Koyeb.
