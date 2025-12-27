# CipherSQLStudio - Setup Guide

## 🚀 Quick Start

This guide will help you set up CipherSQLStudio on your local machine. The project consists of a React frontend and Node.js backend with PostgreSQL and MongoDB databases.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **MongoDB Atlas Account** (free tier) - [Sign up here](https://www.mongodb.com/atlas)
- **LLM API Key** - Either OpenAI or Google Gemini

## 🛠️ Installation Steps

### 1. Clone and Setup Project

```bash
# Clone the repository (if using git)
git clone <your-repo-url>
cd ciphersqlstudio

# Or if you created the files manually, navigate to the project directory
cd ciphersqlstudio
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

### 3. Configure Environment Variables

Edit `backend/.env` with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# PostgreSQL Database (for SQL query execution)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ciphersqlstudio_sandbox
POSTGRES_USER=your_postgres_username
POSTGRES_PASSWORD=your_postgres_password

# MongoDB Atlas (for assignments and user progress)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority

# LLM API Configuration (choose one)
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# OR Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# CORS Settings
FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup

#### PostgreSQL Setup:
```bash
# Connect to PostgreSQL (replace with your credentials)
psql -U postgres

# Create database
CREATE DATABASE ciphersqlstudio_sandbox;

# Grant permissions (replace 'your_username' with your PostgreSQL user)
GRANT ALL PRIVILEGES ON DATABASE ciphersqlstudio_sandbox TO your_username;

# Exit PostgreSQL
\q
```

#### MongoDB Atlas Setup:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### 5. Seed Sample Data

```bash
# Still in backend directory
# Seed the database with sample assignments
node seeds/sampleAssignments.js
```

### 6. Start Backend Server

```bash
# Start the backend server
npm run dev

# You should see:
# 🚀 CipherSQLStudio Backend running on port 5000
# ✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
# ✅ PostgreSQL connection successful
```

### 7. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=CipherSQLStudio
REACT_APP_VERSION=1.0.0
```

### 8. Start Frontend Application

```bash
# Start the React development server
npm start

# Your browser should open to http://localhost:3000
```

## 🧪 Testing the Setup

1. **Backend Health Check**: Visit `http://localhost:5000/health`
2. **Frontend**: Visit `http://localhost:3000`
3. **API Test**: Visit `http://localhost:5000/api/assignments`

You should see:
- Assignment list page with sample assignments
- Ability to click on assignments
- SQL editor with Monaco Editor
- Sample data tables

## 🔧 Troubleshooting

### Common Issues:

#### 1. PostgreSQL Connection Error
```
Error: Failed to connect to PostgreSQL
```
**Solution**: 
- Check if PostgreSQL is running
- Verify credentials in `.env`
- Ensure database exists

#### 2. MongoDB Connection Error
```
Error: MongoDB connection failed
```
**Solution**:
- Check MongoDB Atlas connection string
- Verify IP whitelist
- Check database user permissions

#### 3. Port Already in Use
```
Error: Port 5000 is already in use
```
**Solution**:
- Change PORT in `backend/.env` to 5001
- Update REACT_APP_API_URL in `frontend/.env`

#### 4. LLM API Error
```
Error: OpenAI API error
```
**Solution**:
- Verify API key is correct
- Check API quota/billing
- Try using Gemini API instead

### 5. CORS Error
```
Error: CORS policy blocked
```
**Solution**:
- Ensure FRONTEND_URL in backend `.env` matches frontend URL
- Check if both servers are running

## 📁 Project Structure

```
ciphersqlstudio/
├── backend/                 # Express.js API server
│   ├── config/             # Database configurations
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── seeds/              # Sample data
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # SCSS files
│   │   └── utils/          # Utility functions
└── docs/                   # Documentation
```

## 🎯 Next Steps

1. **Add More Assignments**: Edit `backend/seeds/sampleAssignments.js`
2. **Customize Styling**: Modify SCSS files in `frontend/src/styles/`
3. **Add Features**: Implement user authentication, progress tracking
4. **Deploy**: Consider using Heroku, Vercel, or similar platforms

## 🆘 Getting Help

If you encounter issues:

1. Check the console logs in both terminal windows
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, MongoDB) are running
4. Check the troubleshooting section above

## 🎉 Success!

If everything is working, you should be able to:
- ✅ View assignment list
- ✅ Click on an assignment
- ✅ See sample data tables
- ✅ Write SQL queries in the editor
- ✅ Execute queries and see results
- ✅ Get AI-powered hints

Happy coding! 🚀