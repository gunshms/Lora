# Deployment Guide for Lora Studio

## Recommended: Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. **Push to GitHub**
   Initialize a git repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Add your remote
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repository.
   - **Framework Preset**: Next.js (Automatic)
   - **Build Command**: `next build` (Default)
   - **Install Command**: `npm install` (Default)
   - Click **Deploy**.

## Performance Notes
- This project uses **WebGL**. Vercel handles the static assets and server rendering perfectly.
- Ensure your Vercel project settings have **Node.js 18.x** or newer (Next.js 16 requirement).

## Local Production Test
To test the production build locally before deploying:
```bash
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000).
