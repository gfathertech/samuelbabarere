# Personal Portfolio with Document Management

A full-stack web application that serves as a personal portfolio while also providing advanced document management and sharing capabilities. The application allows for secure document uploads, previews, and collaboration through shareable links.

## Features

- **Portfolio Website** with customizable sections
- **Document Management** with preview support for various file types
- **Secure Document Sharing** with time-limited links
- **Responsive Design** that works on all devices
- **Dark/Light Theme** support

## Tech Stack

### Frontend
- React with TypeScript
- Shadcn UI components
- Tailwind CSS for styling
- PDF.js and WebViewer for document previews
- React Query for data fetching

### Backend
- Express.js with TypeScript
- MongoDB for document storage
- Mongoose for database modeling

## Project Structure

```
portfolio-document-manager/
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   └── contexts/       # React contexts
│   └── ... (configuration files)
└── server/                 # Backend code
    ├── db.ts               # Database connection
    ├── routes.ts           # API endpoints
    ├── schema.ts           # Data models and schemas
    ├── storage.ts          # Storage interface
    └── shared/             # Shared code for imports
```

## Environment Setup

Create `.env` files in both the root and server directories with:
```
MONGODB_URI=your_mongodb_connection_string
ADMIN_PASSWORD=initial_admin_password
```

## Development

Run the application in development mode:
```bash
# From the root directory
npm run dev
```

## License

MIT
