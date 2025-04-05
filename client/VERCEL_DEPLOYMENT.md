# Deploying to Vercel with Koyeb Backend

This guide explains how to deploy the frontend application to Vercel while connecting to the Koyeb backend.

## Prerequisites

1. A Vercel account (free tier is sufficient)
2. Your backend running on Koyeb
3. Access to your GitHub, GitLab, or Bitbucket repository, or the project files for direct upload

## Deployment Steps

### 1. Prepare Your Frontend

Your frontend is already prepared for Vercel deployment with the following configurations:

- `vercel.json` file is set up with SPA routing
- `config.ts` is configured to use the Koyeb backend URL
- API requests are properly formatted in `queryClient.ts`

### 2. Deploy to Vercel

#### Option A: Deploy from Git Repository

1. Login to your Vercel account
2. Click "Add New..." and select "Project"
3. Import your Git repository
4. Configure the project:
   - Project Name: Choose a name or use the suggested one
   - Framework Preset: Select Vite
   - Root Directory: `client` (important - select the client folder, not the project root)
   - Build Command: `npm run build` (should be auto-detected)
   - Output Directory: `dist` (should be auto-detected)
5. Environment Variables:
   - You don't need to add any environment variables as the Koyeb URL is hardcoded in the config file
6. Click "Deploy"

#### Option B: Deploy from Local Files

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the client folder: `cd client`
3. Run `vercel login` and follow the prompts
4. Run `vercel` and follow the configuration prompts:
   - Set up new project: Yes
   - Project name: Choose a name
   - Framework preset: Vite
   - Build command: npm run build (default)
   - Output directory: dist (default)
   - Development command: (optional)
5. The deployment will start automatically

### 3. Configure Custom Domain (Optional)

1. In the Vercel dashboard, go to your project
2. Click on "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions provided by Vercel
5. Wait for DNS propagation and SSL certificate issuance (usually quick)

## Connecting to Koyeb Backend

The connection to the Koyeb backend is managed through:

1. The `API_URL` in `client/src/config.ts` which points to your Koyeb backend
2. The `getFullApiUrl` function in `client/src/lib/queryClient.ts` which constructs proper API URLs

If you need to change the Koyeb backend URL:

1. Update the `API_URL` value in `config.ts`
2. Redeploy your application (Vercel will automatically rebuild)

## Updating Your Deployment

When you make changes:

1. Push to your Git repository (if using Git deployment)
2. Vercel will automatically rebuild and deploy your changes

Or if deploying from local:

1. Make your changes
2. Run `vercel` again from the client folder

## Troubleshooting

If you encounter CORS issues:

1. Make sure your Koyeb backend has CORS configured properly in `server/koyeb.ts`
2. Verify that the Koyeb URL in `config.ts` is correct
3. Check network requests in the browser console for any errors

If you see API connection errors:

1. Verify that the Koyeb service is running
2. Check that the API URL is correct in the config file
3. Look for any error messages in the browser console