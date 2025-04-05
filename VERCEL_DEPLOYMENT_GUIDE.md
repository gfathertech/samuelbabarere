# Vercel Deployment Guide for Document Management Platform

This guide will help you deploy your Document Management Platform to Vercel and connect it to your Koyeb backend, including optional setup for a custom domain.

## Prerequisites

Before you start, ensure you have:
- A Vercel account (sign up for free if you don't have one)
- Your Koyeb backend already deployed and running (the URL should end with `.koyeb.app`)
- Your project repository on GitHub, GitLab, or Bitbucket (recommended)
- Basic familiarity with your domain registrar (if setting up a custom domain)

## Preparing for Deployment

Your project is already configured for Vercel deployment with the following:

1. **vercel.json** - Handles SPA routing on Vercel
2. **API Configuration** - Set up to communicate with your Koyeb backend
3. **Base URL** - Configured for the root path on Vercel

### Checking Your Koyeb URL

Before deploying, verify the Koyeb API URL in `client/src/config.ts` and update if needed.

## Deploying to Vercel

### Option 1: Deploy from Git Repository (Recommended)

1. **Connect Repository**
   - Log in to your Vercel account
   - Click "Add New..." → "Project"
   - Select your Git provider and authorize Vercel
   - Find and select your repository

2. **Configure Project**
   - **Project Name**: Choose a name or use the default
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: Set to `client` (important!)
   - **Build Command**: Use the default (`npm run build`)
   - **Output Directory**: Use the default (`dist`)

3. **Deploy**
   - Click "Deploy"
   - Wait for the build and deployment to complete
   - Your app will be available at `https://your-project-name.vercel.app`

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI, login, and navigate to the client directory
2. Run `vercel` and follow the prompts
3. Ensure you set the root directory to the client folder

## Setting Up a Custom Domain

1. **Add Domain in Vercel**
   - Go to your project in the Vercel dashboard
   - Navigate to "Settings" → "Domains"
   - Click "Add" and enter your domain name

2. **Configure DNS**
   Vercel offers two options:

   a. **Using Vercel as Your Nameserver**
      - Update nameservers at your domain registrar to Vercel's nameservers

   b. **Using DNS Records with Your Current Provider**
      - Add the provided A, CNAME, TXT records in your DNS settings
      - For subdomain: Add CNAME record pointing to Vercel
      - For apex domain: Add A records pointing to Vercel's IP addresses

3. **Configure SSL**
   - Vercel automatically provisions SSL certificates
   - Just wait for DNS propagation and certificate issuance (usually quick)

## Troubleshooting

### Common Issues

1. **Routing Problems**
   - Verify `vercel.json` has proper rewrites configuration
   - Check the browser console for any routing errors

2. **API Connection Issues**
   - Verify the Koyeb URL in `config.ts` is correct
   - Check browser console for CORS or connection errors
   - Ensure your Koyeb backend CORS settings allow your Vercel domain

3. **Custom Domain Not Working**
   - Verify DNS records are correctly set up
   - Check for SSL certification issues
   - Ensure domain is properly configured in Vercel settings

4. **Build Failures**
   - Review build logs in the Vercel dashboard
   - Make sure the root directory is set to `client`
   - Check for any dependencies issues

Remember that changes to your Git repository will automatically trigger a new deployment if you're using the Git integration with Vercel.
