# Task Management App - Setup & Configuration Guide

## 📋 Overview

This is a full-stack task management application built with:
- **Frontend**: React 19 + Vite
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT with refresh tokens

## 🔧 Environment Configuration

### Backend Setup

1. **Create `.env` file** in `server/` directory:

```bash
# Copy from example
cp server/.env.example server/.env
```

2. **Edit `server/.env`** and add your configuration:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/task-management
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management

# JWT Secret (REQUIRED - generate a strong key)
# Generate with: openssl rand -base64 32
JWT_SECRET=your-generated-secret-key-here-minimum-32-characters-long

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Token Expiry
TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d
```

### Frontend Setup

1. **Create `.env.local`** file in `client/` directory:

```bash
cp client/.env.example client/.env.local
```

2. **Edit `client/.env.local`**:

```env
# API Base URL
VITE_API_URL=http://localhost:5000
```

## 🚀 Installation & Running

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally OR MongoDB Atlas account

### Start Backend

```bash
cd server
npm install
npm run dev
```

Server will run on: `http://localhost:5000`

### Start Frontend

```bash
cd client
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🔐 Security Features Implemented

### ✅ User Isolation
- Users can only access their own tasks
- All endpoints validate user ownership

### ✅ Authentication
- JWT-based authentication with 1-hour token expiry
- Refresh token mechanism for seamless UX
- Automatic token refresh on `401` responses
- Logout clears all tokens

### ✅ Password Security
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character (!@#$%^&*)
- Passwords hashed with bcrypt before storage
- Password pre-save hook in User model

### ✅ Input Validation
- Email validation
- Username format validation (3-30 chars, lowercase letters/numbers/-/_)
- Task title validation (2-120 chars)
- Due date validation (no past dates)
- Request timeouts (10 seconds)

### ✅ API Security
- CORS configured to specific origin
- Environment variables required for secrets
- Error messages don't leak sensitive info
- Pagination to prevent large dataset attacks

## 📊 Database Schema

### User Model
```javascript
{
  name: String,           // Full name
  username: String,       // Unique, 3-30 chars, lowercase
  email: String,          // Real email, unique
  password: String,       // Hashed with bcrypt
  role: String,           // "admin" or "member"
  refreshTokens: [{token, createdAt}],
  createdAt: Date,
  updatedAt: Date
}
```

### Task Model
```javascript
{
  userId: ObjectId,       // Reference to User (CRITICAL for isolation)
  title: String,          // 2-120 chars
  description: String,    // Optional, up to 1000 chars
  completed: Boolean,     // Default false
  dueDate: Date,          // Optional
  priority: String,       // "low", "medium", "high"
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/refresh` - Get new token
- `POST /api/auth/logout` - Sign out

### Tasks
- `GET /api/tasks?q=search&page=1&limit=20&filter=all` - List tasks (paginated, searchable)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/toggle` - Toggle completion
- `DELETE /api/tasks/:id` - Delete task

### Health Check
- `GET /api/health` - Server status

## 🎯 Key Improvements Made

### Backend
1. **User Isolation** - All tasks filtered by `userId`
2. **Strong JWT Secret** - Required from environment
3. **Password Hashing** - Pre-save Mongoose hook
4. **Token Refresh** - 7-day refresh tokens stored in DB
5. **Pagination** - Up to 100 items per page
6. **Validation** - Input validation on all endpoints
7. **Error Handling** - Better error messages and logging
8. **CORS** - Configured to specific origin

### Frontend
1. **Request Timeouts** - 10-second fetch timeout
2. **Token Refresh** - Auto-refresh on 401 errors
3. **Optimistic Updates** - Instant UI feedback
4. **Delete Confirmation** - Prevent accidental deletion
5. **Form Validation** - Real-time password strength checking
6. **Accessibility** - ARIA labels, proper semantics
7. **Email Support** - Prompts for real email on registration
8. **Error Handling** - Better error messages

## 📧 User Registration

Users must now provide:
- **Name** - Full name (2-60 chars)
- **Username** - Unique identifier (3-30 chars, lowercase only)
- **Email** - Real email address (will be used for account recovery)
- **Password** - Strong password (see security requirements above)
- **Confirm Password** - Must match password

## 🔑 Password Requirements

Passwords must have:
- ✅ At least 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*)

**Example strong password**: `MyTask123!`

## 🧪 Testing Registration

### Create Test Account
```
Name: John Doe
Username: johndoe
Email: john@example.com
Password: MyPassword123!
Confirm: MyPassword123!
```

## 🐛 Debugging

### Common Issues

**"MONGO_URI is missing"**
- Make sure `server/.env` file exists with `MONGO_URI` set

**"JWT_SECRET environment variable is required"**
- Add `JWT_SECRET` to `server/.env`
- Generate with: `openssl rand -base64 32`

**"Token expired"**
- Refresh token will automatically be used
- If refresh fails, user must login again

**"Unauthorized to update this task"**
- You're trying to modify someone else's task
- Tasks are isolated by user

**CORS errors**
- Make sure `FRONTEND_URL` in `server/.env` matches your frontend URL
- Default is `http://localhost:5173`

## 📁 Project Structure

```
task-management-app/
├── server/
│   ├── .env.example          # Example environment variables
│   ├── package.json
│   └── src/
│       ├── index.js          # Express setup, CORS, error handling
│       ├── middleware/
│       │   └── auth.js       # JWT verification, token generation
│       ├── models/
│       │   ├── User.js       # User schema with password hashing
│       │   └── Task.js       # Task schema with userId field
│       └── routes/
│           ├── auth.js       # Registration, login, refresh, logout
│           └── tasks.js      # CRUD + user isolation + pagination
├── client/
│   ├── .env.example          # Example environment variables
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx           # Main app with auth & delete confirmation
│       ├── services/
│       │   └── taskApi.js    # Fetch with timeout, token refresh
│       ├── components/
│       │   ├── TaskForm.jsx      # Validation & accessibility
│       │   ├── TaskItem.jsx      # Date formatting & ARIA labels
│       │   ├── TaskList.jsx
│       │   ├── SearchForm.jsx    # Better UX
│       │   └── TaskFilters.jsx   # Accessibility
│       └── hooks/
│           ├── useTasks.js       # Optimistic updates, pagination
│           ├── useDraftState.js
│           ├── useEditingState.js
│           └── useFilteredTasks.js
└── README.md
```

## 🎓 Next Steps

1. Install dependencies: `npm install` in both `server/` and `client/`
2. Create `.env` files with your configuration
3. Start MongoDB (local or Atlas)
4. Run `npm run dev` in both directories
5. Navigate to `http://localhost:5173`
6. Create an account with strong password
7. Start managing tasks!

## 🚨 Production Deployment Checklist

- [ ] Set strong `JWT_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use MongoDB Atlas instead of local MongoDB
- [ ] Configure `FRONTEND_URL` to your production domain
- [ ] Set `VITE_API_URL` to your production API URL
- [ ] Enable HTTPS for all endpoints
- [ ] Add rate limiting (not implemented yet)
- [ ] Set up error logging/monitoring
- [ ] Run security audit on dependencies
- [ ] Test all authentication flows
- [ ] Backup MongoDB database regularly

## 📝 License

ISC
