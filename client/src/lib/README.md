# Client - Personal Portfolio with Document Management

The client-side portion of the personal portfolio and document management application.

## Features

- **Portfolio Website** with customizable sections
- **Document Management** with preview support for various file types
- **Secure Document Sharing** with time-limited links
- **Responsive Design** that works on all devices
- **Dark/Light Theme** support

## Tech Stack

- React with TypeScript
- Shadcn UI components
- Tailwind CSS for styling
- PDF.js and WebViewer for document previews
- React Query for data fetching

## Project Structure

```
client/
├── src/
│   ├── components/     # UI components
│   │   ├── document/   # Document preview components
│   │   ├── sections/   # Portfolio section components
│   │   └── ui/         # Shadcn UI components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   └── App.tsx         # Main application component
└── index.html          # HTML entry point
```

## Development

Run the client in development mode:
```bash
npm run dev
```