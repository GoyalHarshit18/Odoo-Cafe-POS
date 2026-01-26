# Deployment Guide - Odoo Cafe POS

This guide will help you move your project from local development to production using **Supabase** (Database) and cloud hosting (e.g., Render, Vercel, or Netlify).

## 1. Database Setup (Supabase)
1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to **Project Settings** > **Database**.
3.  Copy the **URI** (Connection String) from the "Connection string" section (use the **Transaction** or **Session** mode).
4.  It will look like: `postgres://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

## 2. Backend Deployment (e.g., Render or Heroku)
1.  Connect your GitHub repository.
2.  Set the **Build Command**: `cd server && npm install`
3.  Set the **Start Command**: `cd server && npm start`
4.  Add the following **Environment Variables**:
    *   `DATABASE_URL`: (Paste your Supabase URI here)
    *   `NODE_ENV`: `production`
    *   `JWT_SECRET`: (Generate a random long string)
    *   `PORT`: `5000`

## 3. Frontend Deployment (e.g., Vercel or Netlify)
1.  Connect your GitHub repository.
2.  Set the **Build Command**: `npm run build`
3.  Set the **Output Directory**: `dist`
4.  Add the following **Environment Variable**:
    *   `VITE_API_URL`: (The URL of your deployed Backend, e.g., `https://your-api.onrender.com`)

## 4. Final Verification
1.  Once deployed, visit your frontend URL.
2.  Signup a new Restaurant Admin.
3.  Check if products and tables are created successfully.

> [!IMPORTANT]
> Since the database is fresh, you will need to run the `seed_products.js` script or manually add your products again in the new production environment.
