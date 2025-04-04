# Server - Personal Portfolio with Document Management

The server-side portion of the personal portfolio and document management application.

## Features

- **Document Storage** using MongoDB
- **Secure API** for document uploads and retrieval
- **Document Sharing** with time-limited links
- **Content Preview** generation for various file types

## Tech Stack

- Express.js with TypeScript
- MongoDB for document storage
- Mongoose for database modeling
- Various libraries for document processing

## Project Structure

```
server/
├── db.ts             # Database connection
├── index.ts          # Server entry point
├── routes.ts         # API endpoints
├── schema.ts         # Data models and schemas
├── storage.ts        # Storage interface implementation
├── vite.ts           # Vite integration for development
└── shared/           # Shared schemas and types
    └── schema.ts     # Shared types for client and server
```

## Environment Setup

The server requires a `.env` file with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
```

## Development

Run the server in development mode:
```bash
npm run dev
```

## Koyeb Deployment

This server is designed to be deployed on Koyeb as an API-only backend, while the frontend is hosted on GitHub Pages.

### Deployment Instructions

1. **Build for Koyeb**:
   ```bash
   npm run build:koyeb
   ```

2. **Configure Koyeb**:
   - Set the build command to: `npm run build:koyeb`
   - Set the start command to: `npm run start:koyeb`
   - Add all necessary environment variables

3. **Project Structure for Koyeb**:
   ```
   server/
   ├── db.ts             # Database connection
   ├── index.ts          # Full-stack server (development)
   ├── koyeb.ts          # API-only server (Koyeb production)
   ├── routes.ts         # API endpoints
   ├── schema.ts         # Data models and schemas
   ├── storage.ts        # Storage interface implementation
   └── shared/           # Shared schemas and types
       └── schema.ts     # Shared types
   ```

4. **Why a Separate Koyeb Entry Point?**:
   - The main `index.ts` depends on client-side Vite config for development
   - The `koyeb.ts` file is optimized for API-only deployment without client dependencies
   - This avoids build errors related to missing client files on Koyeb

For more details, see the [Koyeb Deployment Fix documentation](../client/koyeb-fix.md).
## Koyeb Deployment

This server is designed to be deployed on Koyeb as an API-only backend, while the frontend is hosted on GitHub Pages.

### Deployment Instructions

1. **Build for Koyeb**:
   ```bash
   npm run build:koyeb
   ```

2. **Configure Koyeb**:
   - Set the build command to: `npm run build:koyeb`
   - Set the start command to: `npm run start:koyeb`
   - Add all necessary environment variables

3. **Project Structure for Koyeb**:
   ```
   server/
   ├── db.ts             # Database connection
   ├── index.ts          # Full-stack server (development)
   ├── koyeb.ts          # API-only server (Koyeb production)
   ├── routes.ts         # API endpoints
   ├── schema.ts         # Data models and schemas
   ├── storage.ts        # Storage interface implementation
   └── shared/           # Shared schemas and types
       └── schema.ts     # Shared types
   ```

4. **Why a Separate Koyeb Entry Point?**:
   - The main `index.ts` depends on client-side Vite config for development
   - The `koyeb.ts` file is optimized for API-only deployment without client dependencies
   - This avoids build errors related to missing client files on Koyeb

For more details, see the `koyeb-fix.md` documentation in the client directory.
