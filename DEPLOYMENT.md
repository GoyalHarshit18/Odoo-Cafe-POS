# Deployment Guide for Cafe Cloud

This project consists of two parts:
1.  **Frontend**: A React application (Vite)
2.  **Backend**: A Node.js/Express server (Sequelize + PostgreSQL)

## Prerequisites

-   Node.js (v18+)
-   PostgreSQL Database (Local or Cloud like Supabase/Neon)

## 1. Environment Variables

### Backend (`/server/.env`)
Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your_jwt_secret_key
# Optional
NODE_ENV=production
```

### Frontend (`/.env`)
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000  # Or your production backend URL
```

## 2. Building for Production

### Frontend
Run the build command to generate static files in the `dist` folder:

```bash
npm run build
```

This will create a `dist` folder containing the optimized application.

### Backend
The backend runs directly with Node.js. No build step is required for the javascript code, but ensure dependencies are installed.

```bash
cd server
npm install --production
```

## 3. Running the Application

### Option A: Separate Services (Recommended for Vercel/Render)
-   **Frontend**: Deploy the `dist` folder (or connect repo) to Vercel, Netlify, or similar platforms.
    -   *Build Command*: `npm run build`
    -   *Output Directory*: `dist`
-   **Backend**: Deploy the `server` folder to Render, Railway, or Heroku.
    -   *Start Command*: `node server.js`

### Option B: Self-Hosted (Single Server)
You can serve the frontend static files *from* the backend by adding this to `server.js` (before API routes):

```javascript
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from the 'dist' folder (you need to copy dist to server/dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Serve React App for any other route (SPA Fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});
```

## 4. Database Setup
The application uses Sequelize to sync the database automatically on start.
Ensure your `DATABASE_URL` is correct.
