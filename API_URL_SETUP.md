# Setting Up Your API URL for Vercel Deployment

This guide explains how to configure the API URL for your Vercel frontend deployment to connect with your Koyeb backend.

## Understanding the API URL Configuration

In this application, the API URL is configured in `client/src/config.ts`:

```typescript
export const API_URL = import.meta.env.PROD 
  ? 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app' 
  : '/api';
```

This configuration:
- In production (Vercel): Uses the full Koyeb backend URL
- In development: Uses the relative path `/api` which is proxied by the local Vite server

## How to Update Your API URL

1. Locate your Koyeb backend URL, which looks like:
   ```
   https://your-app-name.koyeb.app
   ```

2. Open `client/src/config.ts` and update the `API_URL` value:
   ```typescript
   export const API_URL = import.meta.env.PROD 
     ? 'https://your-app-name.koyeb.app' 
     : '/api';
   ```

3. Important: Do not include `/api` at the end of the Koyeb URL, as the application's API request handlers will add this automatically.

4. After making this change, redeploy your application to Vercel.

## Testing the Connection

After deployment, verify the API connection:

1. Open your Vercel-deployed app
2. Navigate to the Documents page
3. Check if documents load properly
4. Open browser developer tools (F12) and look at the Network tab to ensure API requests are successfully connecting to your Koyeb backend

## Troubleshooting

If you experience API connection issues:

### CORS Errors

If you see CORS errors in the console:

1. Verify the Koyeb backend has CORS configured to allow your Vercel domain
2. Check `server/koyeb.ts` for the CORS configuration:
   ```typescript
   app.use(cors({
     origin: [
       'http://localhost:3000',
       'http://localhost:5173',
       'https://your-vercel-app.vercel.app', // Add your Vercel domain here
       'https://your-custom-domain.com'      // Add your custom domain if applicable
     ],
     credentials: true
   }));
   ```
3. Update the CORS settings on your Koyeb backend to include your Vercel domain
4. Redeploy your Koyeb backend

### API Endpoint Not Found

If API requests return 404 errors:

1. Check the browser console for the full URLs being requested
2. Verify that the API_URL in config.ts is correct and doesn't include `/api` at the end
3. Make sure your Koyeb service is running
4. Check that the routes in `server/routes.ts` match what your frontend is requesting

### Connection Timeouts

If requests time out:

1. Verify your Koyeb service is running
2. Check that there are no firewalls blocking the connection
3. Try accessing the Koyeb URL directly in your browser to test if the backend is responding

## Environment Variables Alternative

For more flexibility, you can use Vercel environment variables:

1. In your Vercel project settings, add an environment variable:
   - Name: `VITE_API_URL`
   - Value: Your Koyeb backend URL

2. Update `client/src/config.ts`:
   ```typescript
   export const API_URL = import.meta.env.PROD 
     ? (import.meta.env.VITE_API_URL || 'https://your-app-name.koyeb.app')
     : '/api';
   ```

3. This allows you to change the API URL through environment variables without modifying the code.

Remember to redeploy after making configuration changes to your Vercel project.
