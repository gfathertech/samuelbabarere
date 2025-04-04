# Deploying to GitHub Pages

This document provides instructions for deploying the frontend of this application to GitHub Pages using GitHub Actions.

## Prerequisites

- A GitHub account
- Access to the repository settings

## Automated Deployment with GitHub Actions

This project uses GitHub Actions for automated deployment to GitHub Pages. The workflow is already configured in `.github/workflows/deploy-gh-pages.yml`.

### How It Works

1. When code is pushed to the main branch, the workflow automatically builds and deploys the application
2. The workflow also runs when manually triggered via the GitHub Actions interface

### Key Configuration Details

- **Base Path**: The application is configured to use the repository name as the base path
- **API URL**: In production, API calls are directed to the Koyeb backend
- **Build Script**: A special `build:gh-pages` script in package.json handles path configuration

## Configuration Files

### 1. GitHub Actions Workflow (`.github/workflows/deploy-gh-pages.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]  # Set your main branch name
  workflow_dispatch:    # Allows manual triggering

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v2

      - name: Setup Node.js environment
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies 🔧
        run: |
          cd client
          npm ci
          
      - name: Build 🔨
        run: |
          cd client
          GITHUB_REPO_NAME=${{ github.event.repository.name }} npm run build:gh-pages
        env:
          VITE_API_URL: 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app'
          
      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: client/dist
          clean: true
```

### 2. Vite Configuration (`client/vite.config.ts`)

The `base` parameter is set to use the repository name as the base path:

```js
const basePath = process.env.BASE_PATH || '/';

export default defineConfig({
  // ...
  base: basePath, // Sets the base path for GitHub Pages
  // ...
});
```

### 3. API URL Configuration (`client/src/config.ts`)

```js
export const API_URL = import.meta.env.PROD 
  ? 'https://efficient-freida-samuel-gfather-42709cdd.koyeb.app/api' 
  : '/api';

export const BASE_URL = import.meta.env.BASE_URL || '/';
```

## Setting Up GitHub Pages

1. Go to your repository on GitHub
2. Navigate to Settings > Pages
3. Under "Source", select the `gh-pages` branch
4. Click "Save"

## Verification

After deployment, your site should be available at:
`https://yourusername.github.io/your-repo-name/`

## Troubleshooting

- **404 Errors**: Check routing and ensure paths include the correct base path
- **Missing Assets**: Verify that all asset paths include the base path
- **API Errors**: Ensure the backend URL is correctly configured in `config.ts`
- **Build Failures**: Check the GitHub Actions logs for error details

## Note About Backend

This deployment only covers the frontend. The backend remains deployed on Koyeb at:
`https://efficient-freida-samuel-gfather-42709cdd.koyeb.app`