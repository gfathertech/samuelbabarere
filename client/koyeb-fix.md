# Koyeb Backend Deployment Fix - April 2025 Update

## Issue Description

When attempting to redeploy the backend on Koyeb, the following error occurred during the build process:

```
esbuild index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
✘ [ERROR] Could not resolve "../client/vite.config"
    vite.ts:9:23:
      9 │ import viteConfig from "../client/vite.config";
        ╵                        ~~~~~~~~~~~~~~~~~~~~~~~
1 error
```

This error occurred because the server's `vite.ts` file was trying to import the client's Vite configuration file, but in the Koyeb deployment environment, the client directory doesn't exist.

## Solution Implemented

To fix this issue, we created a separate entry point specifically for Koyeb deployment that doesn't depend on the client Vite configuration:

1. **Created a Koyeb-specific entry file**:
   - Created `server/koyeb.ts` that contains all the server functionality but doesn't import `vite.ts`
   - This file only includes the necessary API routes without Vite setup or static file serving

2. **Added dedicated build and start scripts in package.json**:
   ```json
   "scripts": {
     "build:koyeb": "esbuild koyeb.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
     "start:koyeb": "NODE_ENV=production node dist/koyeb.js"
   }
   ```

3. **Deployment Process**:
   - Use `npm run build:koyeb` to build for Koyeb deployment
   - In Koyeb's deployment settings, set the start command to: `npm run start:koyeb`

## Benefits

1. **Separation of Concerns**: Clear separation between development environment (with full-stack setup) and production deployment (API-only backend)
2. **Reduced Dependencies**: The Koyeb deployment no longer depends on client-side files
3. **Simplified Deployment**: No more build errors related to missing client files
4. **Better Architecture**: Follows best practices of keeping frontend and backend clearly separated in production

## Implementation Details

The `koyeb.ts` file includes:
- Express setup with CORS configuration
- MongoDB connection
- JSON body parsing middleware
- Route registration
- Error handling middleware

It excludes:
- Vite development server setup
- Static file serving middleware
- Any client-related imports

## Deployment Instructions

When deploying to Koyeb:
1. Push the server directory to your repository
2. Set the build command to: `npm run build:koyeb`
3. Set the start command to: `npm run start:koyeb`
4. Ensure all environment variables are properly configured in Koyeb
