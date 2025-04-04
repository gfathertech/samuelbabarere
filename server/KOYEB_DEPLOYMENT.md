# Koyeb Deployment Instructions

## Preparation

1. Make sure all your changes are committed to your repository.
2. Push your changes to GitHub.

## Build Command

When setting up the deployment on Koyeb, use this build command:

```
npm run build:koyeb
```

## Start Command

For the start command on Koyeb, use:

```
npm run start:koyeb
```

## Environment Variables

Make sure to set these environment variables in Koyeb:

- `MONGODB_URI`: Your MongoDB connection string
- Any other environment variables your application needs

## Verification

After deployment, verify that your API is working by making a test request to one of your endpoints, for example:

```
curl https://your-koyeb-domain.koyeb.app/api/documents
```

## Troubleshooting

If you encounter any issues:

1. Check the Koyeb logs for any error messages
2. Verify that all environment variables are set correctly
3. Ensure that the MongoDB connection is working
4. Check CORS settings if you're having cross-origin request issues

## Connecting Frontend to Backend

Remember to update your frontend configuration (`client/src/config.ts`) to point to your Koyeb API URL:

```typescript
export const API_URL = import.meta.env.PROD 
  ? 'https://your-koyeb-domain.koyeb.app' 
  : '';
```
