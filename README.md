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

## Deployment

### Backend Deployment on Koyeb

The backend is deployed on Koyeb at:
```
https://efficient-freida-samuel-gfather-42709cdd.koyeb.app
```

#### Updating the Backend Deployment

To deploy a new version of the backend to Koyeb:

1. **Use the optimized koyeb.ts entry point**
   This file is specifically designed for Koyeb deployment without client dependencies.

2. **Configure Koyeb deployment**
   ```
   Build Command: npm run build:koyeb
   Start Command: npm run start:koyeb
   Root Directory: server
   ```

3. **Set required environment variables**
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production
   - `PORT`: 8000 (or let Koyeb assign one)

For detailed instructions, see [server/KOYEB_DEPLOYMENT.md](server/KOYEB_DEPLOYMENT.md).

### Frontend Deployment on Vercel

1. **Prepare for Vercel deployment**
   - The project is already configured with `vercel.json` for proper routing
   - The API URL in `client/src/config.ts` is set up to connect to the Koyeb backend

2. **Deploy using Vercel Dashboard**
   - Connect your GitHub/GitLab/Bitbucket repository to Vercel
   - Set the root directory to `client`
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - No environment variables are required (or optionally set `VITE_API_URL` to your Koyeb URL)

3. **Deploy using Vercel CLI**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Navigate to client directory
   cd client
   
   # Deploy to Vercel
   vercel
   ```

4. **Custom Domain Setup (Optional)**
   - In the Vercel dashboard, go to your project settings
   - Click "Domains" and add your custom domain
   - Follow Vercel's DNS configuration instructions

For detailed instructions, see [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) and [API_URL_SETUP.md](API_URL_SETUP.md).

## License

MIT
