# ✅ Vercel Deployment Checklist

## 🔍 Pre-Deployment Verification

### Step 1: Confirm Code Configuration ✅

**Your code is already correct:**

```javascript
// ✅ client/src/services/taskApi.js (Line 1)
const API_BASE = import.meta.env.VITE_API_URL || "";
```

This means:
- ✅ Code uses `import.meta.env.VITE_API_URL` correctly
- ✅ Falls back to empty string if not set
- ✅ Vite will inject the value during build

### Step 2: Verify Vite Configuration ✅

**Already configured in `vite.config.js`:**

```javascript
// ✅ Already has build output configuration
build: {
  outDir: "dist",
  sourcemap: false,
}
```

And `vercel.json` is set up:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

---

## 🚀 Vercel Deployment Steps

### Step 1: Go to Vercel Dashboard

1. Open https://vercel.com
2. Sign in with your GitHub account
3. Find your `task-management-app` project
4. Click on it to open the project

---

### Step 2: Add Environment Variable ⭐ **CRITICAL**

This is the most important step!

1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend API URL (see table below)
   - **Environments**: Check `Production` and `Preview`

**Example values for backend URL:**

| Backend Hosting | API URL |
|-----------------|---------|
| Vercel | `https://your-backend-name.vercel.app` |
| Render | `https://your-backend-name.onrender.com` |
| Railway | `https://your-backend-name.up.railway.app` |
| Local (dev only) | `http://localhost:5000` |
| Custom domain | `https://api.yourdomain.com` |

4. Click **Save**

---

### Step 3: Trigger Redeploy ✅

After setting the environment variable, redeploy:

**Option A: Automatic (Recommended)**
1. Push a new commit to `main` branch:
   ```bash
   git add .
   git commit -m "chore: Prepare for Vercel deployment"
   git push
   ```
2. Vercel automatically redeploys on push

**Option B: Manual**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** (three dots menu)
4. Confirm

---

## ✅ Post-Deployment Verification

After deployment completes, verify it works:

### Test 1: Check Build Logs ✅

1. Go to **Deployments** → Latest deployment
2. Click **Logs** tab
3. Look for:
   ```
   ✓ npm run build succeeded
   ✓ Deployed to production
   ```

### Test 2: Check Environment Variables ✅

1. Go to **Settings** → **Environment Variables**
2. Confirm `VITE_API_URL` is visible

### Test 3: Test the Frontend ✅

1. Click the **Visit** button or go to your Vercel URL
2. Try to:
   - Load the app (should see UI)
   - Create an account (should call your backend)
   - Create a task (should work without errors)

### Test 4: Check Browser Console ✅

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for errors related to API calls
4. Go to **Network** tab and check API requests show correct URL

---

## 🐛 Troubleshooting

### ❌ "VITE_API_URL is undefined" Error

**Cause**: Environment variable not set

**Fix**:
1. Go to Vercel Settings → Environment Variables
2. Add `VITE_API_URL` variable
3. **Must include** `Production` and `Preview` environments
4. **Redeploy** after adding

### ❌ API Calls Return 404

**Cause**: Wrong backend URL

**Fix**:
1. Check the correct backend URL
2. Update `VITE_API_URL` in Vercel Settings
3. Redeploy

### ❌ CORS Error in Console

**Cause**: Backend doesn't allow your Vercel URL

**Fix**: 
Backend (`server/.env`) must have:
```env
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

Then update backend `server/src/index.js`:
```javascript
corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}
```

### ❌ Build Fails with "Module not found"

**Cause**: Dependencies not installed

**Fix**:
```bash
cd client
npm install
git add package-lock.json
git commit -m "fix: Ensure dependencies installed"
git push
```

### ❌ Blank Page or "Cannot GET /"

**Cause**: SPA routing not configured

**Fix**: Already configured in `vercel.json`:
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

If still happening:
1. Verify `vercel.json` is in root of `client/` folder
2. Push to GitHub and redeploy

---

## 📋 Quick Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Code uses `import.meta.env.VITE_API_URL` | ✅ Done |
| 2 | Vite config has build settings | ✅ Done |
| 3 | `vercel.json` configured | ✅ Done |
| 4 | All files pushed to GitHub | ✅ Done |
| 5 | Set `VITE_API_URL` in Vercel Settings | ⏳ **YOU DO THIS** |
| 6 | Redeploy on Vercel | ⏳ **YOU DO THIS** |
| 7 | Test the frontend | ⏳ **YOU DO THIS** |

---

## 🎯 Next Actions

1. **Open Vercel Dashboard**
   - Go to your project
   - Click Settings

2. **Add Environment Variable**
   - Name: `VITE_API_URL`
   - Value: Your backend URL
   - Save

3. **Redeploy**
   - Push to GitHub or click Redeploy button

4. **Test**
   - Wait for build to complete
   - Visit your Vercel URL
   - Try creating an account/task

---

## ✨ Success Indicators

✅ **You'll know it worked when:**
- Page loads without blank screen
- No console errors about API
- Can create account and see tasks
- Tasks save and persist
- No 404 or CORS errors

---

## 📞 Still Having Issues?

Check these in order:

1. **Is `VITE_API_URL` set in Vercel?**
   - Go to Settings → Environment Variables
   - Should see `VITE_API_URL` variable

2. **Is it the correct backend URL?**
   - Visit the backend URL directly
   - Should show API response or page

3. **Did you redeploy after setting it?**
   - Old deployment won't have the variable
   - Must redeploy after changing env vars

4. **Is your backend running?**
   - Try visiting the API URL directly
   - Should respond (not timeout)

5. **Check build logs for errors**
   - Deployments → Latest → Logs
   - Look for build errors

---

**You're all set! Follow the steps above to deploy successfully!** 🚀
