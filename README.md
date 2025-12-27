# CipherSQLStudio

A browser-based SQL learning platform where students can practice SQL queries against pre-configured assignments with real-time execution and intelligent hints.

## Features

- 📚 Assignment listing with difficulty levels
- 💻 Browser-based SQL editor (Monaco Editor)
- 🔍 Sample data viewer for each assignment
- 🤖 AI-powered hints (not solutions)
- 📱 Mobile-first responsive design
- ⚡ Real-time query execution

## Tech Stack

### Frontend
- React.js
- SCSS (mobile-first responsive design)
- Monaco Editor for SQL editing

### Backend
- Node.js & Express.js
- PostgreSQL (sandbox database for query execution)
- MongoDB Atlas (assignments and user progress)
- LLM API integration for hints

## Project Structure

```
ciphersqlstudio/
├── frontend/          # React application
├── backend/           # Express.js API server
├── docs/             # Documentation and diagrams
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free)
- PostgreSQL database (free options: Neon, Supabase, ElephantSQL)
- Gemini API key (free tier available)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd ciphersqlstudio

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Environment Variables

#### Backend Setup:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your credentials:

**MongoDB Atlas (Free):**
1. Go to https://www.mongodb.com/atlas
2. Create free account and cluster
3. Get connection string
4. Replace `MONGODB_URI` in `.env`

**PostgreSQL (Free - Neon):**
1. Go to https://neon.tech
2. Create free account and database
3. Get connection string
4. Replace PostgreSQL variables in `.env`

**Gemini API (Free):**
1. Go to https://ai.google.dev/
2. Get free API key
3. Replace `GEMINI_API_KEY` in `.env`

#### Frontend Setup:
```bash
cd frontend
cp .env.example .env
# Frontend .env is optional - defaults will work
```

### 3. Seed Database
```bash
cd backend
node seeds/sampleAssignments.js
```

### 4. Run Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## For Evaluators

This project requires external services to run fully:

1. **MongoDB Atlas** - Free tier available
2. **PostgreSQL** - Free options: Neon, Supabase, ElephantSQL  
3. **Gemini API** - Free tier with 20 requests/minute

All services have generous free tiers. Setup takes ~10 minutes.

**Alternative:** The application has fallback systems and will run with limited functionality even without all services configured.

## Data Flow Diagram

User clicks "Execute Query" → Backend API → PostgreSQL Execution → Results Display
(See docs/data-flow-diagram.jpg for detailed hand-drawn diagram)

## Development Notes

This project focuses on:
- Clean, readable code structure
- Mobile-first responsive design
- Proper error handling
- Security best practices for SQL execution
- Effective LLM prompt engineering for hints

Built with ❤️ for SQL learning