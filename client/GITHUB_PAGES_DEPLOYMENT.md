# GitHub Pages Deployment Guide

This document explains how to deploy your updated frontend code to GitHub Pages while keeping your backend running on Koyeb.

## Prerequisites

- GitHub account with a repository set up for this project
- GitHub Pages enabled for your repository
- Koyeb account with the backend already deployed

## Deployment Process

### 1. Configure API URL

Make sure your `client/src/config.ts` file has the correct Koyeb URL:

```typescript
export const API_URL = import.meta.env.PROD 
  ? 'https://your-koyeb-app-url.koyeb.app' 
  : '/api';

export const BASE_URL = import.meta.env.PROD 
  ? '/your-repo-name/' 
  : '/';
```

Replace `your-koyeb-app-url.koyeb.app` with your actual Koyeb domain and `/your-repo-name/` with your GitHub repository name.

### 2. Verify GitHub Workflow Configuration

Check that `.github/workflows/deploy-gh-pages.yml` exists and contains the proper deployment steps:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
    paths:
      - 'client/**'
      - '.github/workflows/**'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Setup Node.js environment
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'client/package-lock.json'

      - name: Install dependencies 🔧
        run: |
          cd client
          npm ci
          
      - name: Build for GitHub Pages 🔨
        run: |
          cd client
          npm run build:gh-pages
        env:
          VITE_API_URL: 'https://your-koyeb-app-url.koyeb.app'
          
      - name: Fix asset paths for GitHub Pages 🔧
        run: |
          find client/dist -type f -name "*.html" -exec sed -i -e 's|href="/assets/|href="/your-repo-name/assets/|g' -e 's|src="/assets/|src="/your-repo-name/assets/|g' {} \;
          
      - name: Deploy to GitHub Pages 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: client/dist
          clean: true
          commit-message: "Deploy website to GitHub Pages [skip ci]"
```

Update the Koyeb URL in the `VITE_API_URL` environment variable and the repository name in the path fixing step.

### 3. Verify Package.json Build Script

Make sure `client/package.json` has a `build:gh-pages` script:

```json
"scripts": {
  "build:gh-pages": "vite build --base=/your-repo-name/"
}
```

Replace `/your-repo-name/` with your GitHub repository name.

### 4. Push Only Required Files

To deploy only the frontend to GitHub Pages while keeping the backend on Koyeb, you can selectively push only the necessary files:

```bash
# Add and commit only the client and .github folders
git add client/ .github/
git commit -m "Update frontend for GitHub Pages deployment"
git push origin main
```

This will trigger the GitHub Actions workflow to build and deploy your frontend to GitHub Pages.

### 5. Verify Deployment

After the workflow completes:

1. Go to your repository on GitHub
2. Click on "Settings" > "Pages"
3. You should see a message that your site is published at `https://your-username.github.io/your-repo-name/`

## Troubleshooting

### 404 Errors on Page Refresh

If you're experiencing 404 errors when refreshing pages, make sure:

1. Your `client/public/404.html` file exists with the proper redirection script
2. The `BASE_URL` in `config.ts` matches your GitHub repository name
3. All links in your application use the `BASE_URL` prefix for navigation

### API Connection Issues

If your frontend can't connect to the backend:

1. Check browser console for CORS errors
2. Verify the API_URL in `config.ts` points to your Koyeb backend 
3. Make sure your Koyeb backend has CORS headers configured to allow requests from your GitHub Pages domain

## Maintenance

When making future updates:

1. Development: Test locally using the Replit "Start application" workflow
2. Deployment: Commit changes and push to trigger the GitHub Actions workflow
3. Always check the workflow logs in GitHub Actions to ensure successful deployment

Remember that the backend code remains on Koyeb and doesn't need to be redeployed unless you make changes to it.