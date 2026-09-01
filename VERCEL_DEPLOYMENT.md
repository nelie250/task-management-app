# Vercel Deployment Guide

## Prerequisites

- Frontend pushed to GitHub
- Backend API deployed (or have the URL ready)
- Vercel account (free tier works)

---

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..." → "Project"**
3. Select **"Import Git Repository"**
4. Connect your GitHub account and select `task-management-app`
5. Choose the `client` folder as root directory

---

## Step 2: Configure Environment Variables

**⚠️ CRITICAL: This is the most common failure point**

1. In Vercel dashboard, go to **Settings → Environment Variables**
2. Add this variable:

```
VITE_API_URL=https://your-backend-api-url.com
```

**Where to get the backend URL:**
- If backend is on **Vercel**: `https://your-server-project.vercel.app`
- If backend is on **Render**: `https://your-server-app.onrender.com`
- If backend is on **Railway**: `https://your-server.up.railway.app`

3. Make sure to select **Production** and **Preview** environments
4. Click **Save**

---

## Step 3: Configure Build Settings

The `vercel.json` file is already configured with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

Vercel should automatically detect these. If not:

1. Go to **Settings → Build & Development Settings**
2. Set:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm ci` (or `npm install`)

---

## Step 4: Deploy

1. Click **"Deploy"** button
2. Vercel will build and deploy automatically
3. Wait for the build to complete
4. Check the **Production** URL

---

## Troubleshooting

### ❌ Build fails with "Cannot find module"

**Solution**: Ensure all dependencies are in `package.json`:
```bash
cd client
npm install  # Make sure all packages are installed locally first
```

Then commit and push:
```bash
git add package-lock.json
git commit -m "chore: Update dependencies"
git push
```

### ❌ "VITE_API_URL is undefined" or API calls fail

**Solution**: Environment variable not set

1. In Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_API_URL` with your backend URL
3. **Redeploy** (this is important!)

### ❌ "Cannot GET /" or page shows blank

**Solution**: Add to `vercel.json` (already included):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### ❌ API calls fail (404 or CORS error)

**Solution**: Backend URL is wrong or backend not deployed

1. Check `VITE_API_URL` in Vercel environment variables
2. Verify backend is actually running at that URL
3. Check backend has proper CORS configuration:

```javascript
corsOptions = {
  origin: "https://your-vercel-frontend-url.vercel.app"
}
```

### ❌ "Module not found: @vitejs/plugin-react"

**Solution**: Dependencies not installed

```bash
cd client
npm install
git add package-lock.json
git commit -m "fix: Ensure all dependencies installed"
git push
```

---

## Redeploy After Changes

After updating environment variables or code:

```bash
# Push to main branch
git push origin main

# Vercel automatically redeploys on push
# Or manually click "Redeploy" in Vercel dashboard
```

---

## Production Checklist

- ✅ Backend deployed and URL confirmed
- ✅ `VITE_API_URL` environment variable set in Vercel
- ✅ Backend CORS allows Vercel frontend URL
- ✅ `.env.local` created locally for development (not committed)
- ✅ `vercel.json` configured with build settings
- ✅ `package-lock.json` committed to git
- ✅ All dependencies in `package.json`

---

## Example Deployment Scenarios

### Scenario 1: Both on Vercel

**Frontend**: `task-frontend.vercel.app`
**Backend**: `task-backend.vercel.app`

Vercel Environment Variable:
```
VITE_API_URL=https://task-backend.vercel.app
```

### Scenario 2: Frontend on Vercel, Backend on Render

**Frontend**: `task-frontend.vercel.app`
**Backend**: `task-backend.onrender.com`

Vercel Environment Variable:
```
VITE_API_URL=https://task-backend.onrender.com
```

### Scenario 3: Frontend on Vercel, Backend on Railway

**Frontend**: `task-frontend.vercel.app`
**Backend**: `task-backend.up.railway.app`

Vercel Environment Variable:
```
VITE_API_URL=https://task-backend.up.railway.app
```

---

## Performance Tips

1. **Disable source maps in production** (already set in `vite.config.js`)
2. **Use Vercel's edge cache** for static assets
3. **Monitor deployment** in Vercel Analytics dashboard

---

## Support

If deployment still fails:

1. Check Vercel build logs: **Deployments → [latest] → Logs**
2. Look for specific error messages
3. Common issues:
   - Missing environment variables
   - Backend not running/not accessible
   - CORS misconfiguration
   - Node version mismatch

