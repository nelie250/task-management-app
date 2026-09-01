# 🚀 Quick Start Guide

## What Was Fixed

Your project had **30 critical and high-priority issues** that have all been **✅ FIXED**:

- 🔒 **Security**: User isolation, strong passwords, JWT secrets required
- 🔄 **Features**: Token refresh, pagination, timeouts, delete confirmation
- ♿ **Quality**: Accessibility, error handling, validation, optimistic updates

See [FIXES_APPLIED.md](FIXES_APPLIED.md) for complete details.

---

## 🎯 What You Need to Provide

### 1. **Environment Variables**

#### Backend (`server/.env`)
You need to create this file:

```bash
# Copy the template
cp server/.env.example server/.env
```

Then edit `server/.env` and provide:

```env
# REQUIRED - Your MongoDB connection string
MONGO_URI=mongodb://localhost:27017/task-management
# OR use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management

# REQUIRED - Generate a strong secret key
# Run this command: openssl rand -base64 32
JWT_SECRET=<paste-generated-key-here>

# Optional - defaults to these
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

#### Frontend (`client/.env.local`)
You need to create this file:

```bash
# Copy the template
cp client/.env.example client/.env.local
```

Then edit and provide:

```env
# Backend API URL (change if deploying to production)
VITE_API_URL=http://localhost:5000
```

---

## 📋 Step-by-Step Setup

### Step 1: Generate Strong JWT Secret

```bash
# On Windows (PowerShell)
$bytes = [System.Text.Encoding]::UTF8.GetBytes((Get-Random -Minimum 100000 -Maximum 999999999999999999).ToString() + (Get-Random -Minimum 100000 -Maximum 999999999999999999).ToString())
[Convert]::ToBase64String($bytes)

# On macOS/Linux
openssl rand -base64 32
```

**Copy the output** - you'll need this for `server/.env`

### Step 2: Create Backend Configuration

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with:
```env
MONGO_URI=mongodb://localhost:27017/task-management
JWT_SECRET=<your-generated-secret-from-step-1>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Create Frontend Configuration

```bash
cd client
cp .env.example .env.local
```

Edit `client/.env.local` with:
```env
VITE_API_URL=http://localhost:5000
```

### Step 4: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd client
npm install
```

### Step 5: Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas Cloud**
- Use your Atlas connection string in `server/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management
```

### Step 6: Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Output: API server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Output: Click http://localhost:5173 to open the app
```

### Step 7: Test the App

1. Open http://localhost:5173
2. Click **Register** tab
3. Create account with:
   - **Name**: Your Name
   - **Username**: yourname (3-30 chars, lowercase only)
   - **Email**: your.email@example.com (must be valid format)
   - **Password**: MyPassword123! (must have uppercase, lowercase, number, special char)
   - **Confirm Password**: MyPassword123!
4. Click Register
5. Start creating tasks!

---

## 🔑 Secrets & Configuration

### What You MUST Provide:

| Item | Where | Example | Required |
|------|-------|---------|----------|
| **MongoDB URI** | `server/.env` | `mongodb://localhost:27017/task-management` | ✅ YES |
| **JWT Secret** | `server/.env` | Generated with `openssl rand -base64 32` | ✅ YES |
| **API URL** | `client/.env.local` | `http://localhost:5000` | ✅ YES |

### What's Handled:

- ✅ Password hashing (bcrypt)
- ✅ Token generation (automatic)
- ✅ Token storage (localStorage)
- ✅ Token refresh (automatic)
- ✅ CORS (configured)
- ✅ Port defaults (5000, 5173)

---

## 🚨 If You Get Errors

### "MONGO_URI is missing"
**Fix**: Add MONGO_URI to `server/.env`

### "JWT_SECRET environment variable is required"
**Fix**: Generate and add JWT_SECRET to `server/.env`:
```bash
openssl rand -base64 32
```

### "Cannot connect to MongoDB"
**Fix**: Make sure MongoDB is running:
```bash
mongod
# For macOS: brew services start mongodb-community
```

### "CORS error"
**Fix**: Ensure frontend URL matches `FRONTEND_URL` in `server/.env`

### "Email validation failed"
**Fix**: Registration now requires real email. Use format: `name@example.com`

### "Password is too weak"
**Fix**: Password must have:
- At least 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

Example: `MySecurePass123!`

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup & configuration guide
- **[FIXES_APPLIED.md](FIXES_APPLIED.md)** - All 30 issues fixed, with details
- **[CODE_ANALYSIS.md](CODE_ANALYSIS.md)** - Original audit report

---

## ✅ Verification Checklist

Before running, make sure you have:

- [ ] `server/.env` file created with MONGO_URI and JWT_SECRET
- [ ] `client/.env.local` file created with VITE_API_URL
- [ ] MongoDB running (local or Atlas URL configured)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] Dependencies installed (`npm install` in both directories)

---

## 🎓 Key Features

### Security ✅
- User isolation (can't see other users' tasks)
- Strong password validation
- JWT with refresh tokens
- Request timeouts
- CORS protection

### UX ✅
- Optimistic updates (instant feedback)
- Delete confirmation
- Search & filters
- Pagination
- Loading states

### Quality ✅
- Error handling
- Accessibility (ARIA labels)
- Form validation
- Date validation
- Empty states

---

## 🚀 Deploy to Production

When ready to deploy:

1. Update `.env` files with production URLs
2. Use MongoDB Atlas instead of local
3. Set `NODE_ENV=production`
4. Use strong, unique JWT_SECRET
5. Enable HTTPS
6. Update `FRONTEND_URL` and `VITE_API_URL` to your domain

Example production `server/.env`:
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskdb
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
```

Example production `client/.env.local`:
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 💡 Quick Commands

```bash
# Start both servers
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# View backend logs
# Backend terminal should show: API server running on http://localhost:5000

# View frontend URL
# Frontend terminal should show: Local: http://localhost:5173

# Stop servers
# Ctrl+C in each terminal

# Generate new JWT secret
openssl rand -base64 32

# View Node version
node --version

# View npm version
npm --version

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

---

## 📞 Support

If you encounter issues:

1. Check [FIXES_APPLIED.md](FIXES_APPLIED.md) for what was changed
2. Read [SETUP.md](SETUP.md) for detailed setup
3. Verify all `.env` variables are set
4. Make sure MongoDB is running
5. Check browser console for frontend errors
6. Check terminal output for backend errors

---

**You're all set! Start the app and begin managing tasks.** 🎉
