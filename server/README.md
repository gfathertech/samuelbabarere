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