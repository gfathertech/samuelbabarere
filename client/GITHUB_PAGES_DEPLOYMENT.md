# GitHub Pages Deployment

This project is configured to be deployed to GitHub Pages. It uses a special setup to handle Single Page Application routing with GitHub Pages.

## How it works

GitHub Pages doesn't natively support client-side routing used by React Router and similar libraries. When a user tries to access a route directly (e.g., `/documents`), GitHub Pages would return a 404 error. To solve this issue, this project uses the following approach:

1. A custom 404.html page that redirects to the main index.html with a special query parameter
2. A script in index.html that reads this parameter and rebuilds the correct route
3. Special configuration for proper base path handling with wouter routing

## Base Path Configuration

In production (on GitHub Pages), the application will be served from `/samuelbabarere/` instead of the root `/`. The following configurations handle this:

- **Vite Configuration**: Uses `BASE_PATH` environment variable to set the base path for all assets
- **Router Configuration**: Configures wouter to work with the base path
- **API URL Handling**: Ensures API calls work correctly regardless of the environment

## Deployment Flow

The deployment to GitHub Pages is handled by the GitHub Actions workflow in `.github/workflows/deploy-gh-pages.yml`. The workflow:

1. Checks out the code
2. Sets up Node.js
3. Installs dependencies
4. Builds the project with the correct base path
5. Deploys to the gh-pages branch

## Important Files

- **public/404.html**: The custom 404 page that handles redirects
- **public/CNAME**: For custom domain configuration (portfolio.samuelbabarere.net)
- **public/_redirects**: For Netlify-compatible redirects (if you decide to deploy on Netlify later)
- **src/config.ts**: Contains environment-aware configuration
- **vite.config.ts**: Configures the base path for the build
- **package.json**: Contains the `build:gh-pages` script with the correct base path

## Testing Locally

To test the GitHub Pages setup locally:

```bash
npm run build:gh-pages
npm run preview
```

This will build the app with the GitHub Pages base path and serve it locally.

## Custom Domain

The project is configured to use `portfolio.samuelbabarere.net` as a custom domain. When this domain is properly set up in DNS and GitHub Pages settings, the site will be accessible via that URL instead of the default GitHub Pages URL.
