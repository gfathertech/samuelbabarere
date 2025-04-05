# Koyeb Deployment Guide

This document provides step-by-step instructions for deploying the backend API server to Koyeb.

## Prerequisites

- A Koyeb account (sign up at [koyeb.com](https://koyeb.com) if you don't have one)
- Your application code pushed to a GitHub repository
- MongoDB Atlas database set up with connection string

## Deployment Steps

### 1. Prepare your repository

Ensure your GitHub repository includes:
- The server directory with all necessary files
- The `koyeb.ts` entry point file (for API-only deployment)
- Updated package.json with the correct build and start scripts

### 2. Create a new Koyeb service

1. Log in to your Koyeb account
2. Click "Create App" from the dashboard
3. Choose "GitHub" as your deployment method
4. Select your repository and branch
5. Configure the build:
   - Build Command: `npm run build:koyeb`
   - Start Command: `npm run start:koyeb`
   - Root Directory: `server` (important!)

### 3. Set Environment Variables

Add the following environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `PORT`: 8000 (or let Koyeb assign a port)
- `NODE_ENV`: production
- Any other secrets or configuration variables your app needs

### 4. Deploy

Click "Deploy" to start the deployment process. Koyeb will:
1. Clone your repository
2. Build the application using your build command
3. Deploy and start the service

### 5. Verify Deployment

Once deployed:
1. Koyeb will provide a unique URL for your API
2. Test the API by visiting `https://your-koyeb-url.koyeb.app/api/health`
3. If you see a success response, your API is deployed successfully

### 6. Update Client Configuration

Update your frontend application to use the new Koyeb API URL:
1. Update the `API_URL` in `client/src/config.ts`
2. Rebuild and deploy the frontend to GitHub Pages

## Troubleshooting

If deployment fails:
1. Check the build logs in Koyeb dashboard
2. Verify all environment variables are set correctly
3. Ensure your MongoDB instance is accessible from Koyeb
4. Check the server logs for runtime errors

## Maintenance

To update your deployment:
1. Push changes to your GitHub repository
2. Koyeb will automatically rebuild and redeploy

For manual redeployment:
1. Go to your app in Koyeb dashboard
2. Click "Redeploy" on the service you want to update
