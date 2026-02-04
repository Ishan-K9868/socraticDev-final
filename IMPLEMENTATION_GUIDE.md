# SocraticDev - Complete Implementation Guide for MERN Stack

> A comprehensive guide for building SocraticDev from scratch using MongoDB, Express, React, and Node.js

**Author**: Implementation Guide for 3rd Year Student  
**Target Stack**: MERN (MongoDB, Express.js, React, Node.js)  
**Difficulty**: Intermediate to Advanced  
**Estimated Time**: 4-6 weeks for core features

---

## Table of Contents

1. [Overview & Simplified Architecture](#1-overview--simplified-architecture)
2. [Technology Stack Mapping](#2-technology-stack-mapping)
3. [Project Structure](#3-project-structure)
4. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
5. [Phase 2: Backend Core](#phase-2-backend-core)
6. [Phase 3: Frontend Foundation](#phase-3-frontend-foundation)
7. [Phase 4: AI Chat Integration](#phase-4-ai-chat-integration)
8. [Phase 5: The Dojo (Challenges)](#phase-5-the-dojo-challenges)
9. [Phase 6: Spaced Repetition System](#phase-6-spaced-repetition-system)
10. [Phase 7: Code Visualizer](#phase-7-code-visualizer)
11. [Phase 8: Analytics & Gamification](#phase-8-analytics--gamification)
12. [Phase 9: Project Upload & Analysis](#phase-9-project-upload--analysis)
13. [Deployment Guide](#deployment-guide)
14. [NPM Modules Reference](#npm-modules-reference)

---

## 1. Overview & Simplified Architecture

### What You're Building

SocraticDev is an AI-powered code learning platform with:
- **Socratic AI Tutor**: Asks guiding questions before providing answers
- **The Dojo**: 10 different coding challenge types
- **Spaced Repetition**: Flashcard system with SM-2 algorithm
- **Code Visualizer**: Step-by-step code execution animation
- **Gamification**: XP, leagues, achievements, daily quests
- **Code Analysis**: Upload projects and analyze dependencies

### Original vs. Your Simplified Version

| Original Feature | Original Tech | Your MERN Alternative |
|-----------------|---------------|----------------------|
| Graph Database | Neo4j | MongoDB with references |
| Vector Search | Chroma + Embeddings | MongoDB text search + simple similarity |
| Task Queue | Celery + RabbitMQ | Bull.js with Redis (or skip for MVP) |
| Caching | Redis | In-memory cache or MongoDB |
| Code Parsing | Tree-sitter (Python) | Simple regex parsing (JS) |
| Backend | FastAPI (Python) | Express.js (Node.js) |

### Simplified Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Landing  │ │   Chat   │ │   Dojo   │ │   SRS    │       │
│  │   Page   │ │Interface │ │Challenges│ │Flashcards│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │Visualizer│ │Analytics │ │Gamify    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────┴───────────────────────────────────┐
│                  Backend (Express.js)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Auth    │ │  Chat    │ │ Challenge│ │  Upload  │       │
│  │ Routes   │ │ Routes   │ │  Routes  │ │  Routes  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                   Data Layer                                 │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │     MongoDB      │  │   Gemini API     │                 │
│  │ (Users, Cards,   │  │ (AI Chat, Code   │                 │
│  │  Projects, etc.) │  │  Analysis)       │                 │
│  └──────────────────┘  └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack Mapping

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "redux-persist": "^6.0.0",
    "@google/generative-ai": "^0.21.0",
    "@monaco-editor/react": "^4.6.0",
    "reactflow": "^11.11.4",
    "@reactflow/background": "^11.3.14",
    "@reactflow/controls": "^11.2.14",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "framer-motion": "^12.0.0",
    "gsap": "^3.14.2",
    "@gsap/react": "^2.1.1",
    "axios": "^1.6.0",
    "prismjs": "^1.30.0",
    "react-syntax-highlighter": "^15.5.0"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

### Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "redis": "^4.6.0",
    "ioredis": "^5.3.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "express-validator": "^7.0.1",
    "@google/generative-ai": "^0.21.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  }
}
```

### Module Purpose Reference

| Module | Purpose | Where Used |
|--------|---------|------------|
| `@reduxjs/toolkit` | State management (industry standard) | Global app state |
| `react-redux` | React bindings for Redux | Connect components to store |
| `redux-persist` | Persist Redux state | Save user preferences |
| `@google/generative-ai` | Gemini AI API | Chat, challenges |
| `@monaco-editor/react` | VS Code editor component | Code input |
| `reactflow` | Node-based graph visualization | Dependency graph |
| `@dnd-kit/*` | Drag and drop | Parsons problems |
| `framer-motion` | Animations | UI transitions |
| `gsap` + `@gsap/react` | Advanced animations | Landing page |
| `prismjs` | Syntax highlighting | Code blocks |
| `mongoose` | MongoDB ODM | Database models |
| `redis` / `ioredis` | Redis client | Caching, sessions, rate limiting |
| `multer` | File upload handling | Project upload |
| `jsonwebtoken` | JWT authentication | Auth system |

---

## 3. Project Structure

### Recommended Folder Structure

```
socraticdev/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ui/              # Button, Card, Modal, etc.
│   │   ├── features/            # Feature-specific modules
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── ChatInput.tsx
│   │   │   │   └── useChat.ts
│   │   │   ├── dojo/
│   │   │   │   ├── DojoHub.tsx
│   │   │   │   ├── ParsonsChallenge.tsx
│   │   │   │   ├── CodeSurgery.tsx
│   │   │   │   ├── MentalCompiler.tsx
│   │   │   │   └── ... (10 challenge types)
│   │   │   ├── srs/
│   │   │   │   ├── SRSDashboard.tsx
│   │   │   │   ├── ReviewSession.tsx
│   │   │   │   ├── FlashcardDeck.tsx
│   │   │   │   └── useSRS.ts
│   │   │   ├── visualizer/
│   │   │   │   ├── CodeVisualizer.tsx
│   │   │   │   └── ExecutionTrace.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── AnalyticsDashboard.tsx
│   │   │   │   └── SkillRadar.tsx
│   │   │   └── gamification/
│   │   │       ├── Achievements.tsx
│   │   │       ├── Leagues.tsx
│   │   │       └── DailyQuests.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LearningHub.tsx
│   │   │   ├── AppPage.tsx       # Learning Mode
│   │   │   └── BuildModePage.tsx # Building Mode
│   │   ├── services/
│   │   │   ├── api.ts            # Axios instance
│   │   │   └── gemini.ts         # Gemini API wrapper
│   │   ├── store/
│   │   │   └── useStore.ts       # Zustand store
│   │   ├── hooks/
│   │   │   └── useLocalStorage.ts
│   │   ├── utils/
│   │   │   └── helpers.ts
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # MongoDB connection
│   │   │   └── constants.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Flashcard.js
│   │   │   ├── Project.js
│   │   │   ├── Challenge.js
│   │   │   └── Achievement.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── chat.js
│   │   │   ├── challenges.js
│   │   │   ├── flashcards.js
│   │   │   ├── projects.js
│   │   │   └── gamification.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   └── codeParser.js
│   │   └── app.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Phase 1: Foundation Setup

### Step 1.1: Create Frontend with Vite

```bash
# Create React + TypeScript project
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Install core dependencies
npm install react-router-dom zustand axios framer-motion

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Configure Tailwind** (`tailwind.config.js`):
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#E07A5F',     // Terracotta
        secondary: '#3D5A80',   // Deep Ocean
        accent: '#81936A',      // Sage Green
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### Step 1.2: Create Backend with Express

```bash
mkdir backend && cd backend
npm init -y

# Install dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install multer express-validator helmet morgan
npm install @google/generative-ai

# Dev dependencies
npm install -D nodemon
```

**Create `backend/src/app.js`**:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/gamification', require('./routes/gamification'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 1.3: MongoDB Connection

**Create `backend/src/config/db.js`**:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Step 1.4: Environment Variables

**Backend `.env`**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socraticdev
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Frontend `.env.local`**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Phase 2: Backend Core

### Step 2.1: User Model

**Create `backend/src/models/User.js`**:
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  // Gamification
  totalXP: {
    type: Number,
    default: 0,
  },
  currentLeague: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze',
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  // Skills (0-100)
  skills: {
    algorithms: { type: Number, default: 0 },
    dataStructures: { type: Number, default: 0 },
    debugging: { type: Number, default: 0 },
    designPatterns: { type: Number, default: 0 },
    testing: { type: Number, default: 0 },
    architecture: { type: Number, default: 0 },
  },
  // Preferences
  preferences: {
    theme: { type: String, default: 'dark' },
    preferredLanguage: { type: String, default: 'javascript' },
    dailyGoal: { type: Number, default: 30 }, // minutes
  },
  // Achievements (array of achievement IDs)
  unlockedAchievements: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate league based on XP
userSchema.methods.updateLeague = function() {
  if (this.totalXP >= 10000) this.currentLeague = 'diamond';
  else if (this.totalXP >= 5000) this.currentLeague = 'platinum';
  else if (this.totalXP >= 2000) this.currentLeague = 'gold';
  else if (this.totalXP >= 500) this.currentLeague = 'silver';
  else this.currentLeague = 'bronze';
};

module.exports = mongoose.model('User', userSchema);
```

### Step 2.2: Flashcard Model

**Create `backend/src/models/Flashcard.js`**:
```javascript
const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  front: {
    type: String,
    required: true,
  },
  back: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['basic', 'cloze', 'code'],
    default: 'basic',
  },
  language: {
    type: String,
    default: 'javascript',
  },
  tags: [{
    type: String,
  }],
  sourceType: {
    type: String,
    enum: ['manual', 'chat', 'dojo'],
    default: 'manual',
  },
  // SM-2 Algorithm fields
  interval: {
    type: Number,
    default: 0,
  },
  repetitions: {
    type: Number,
    default: 0,
  },
  easeFactor: {
    type: Number,
    default: 2.5,
  },
  nextReview: {
    type: Date,
    default: Date.now,
  },
  lastReview: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
flashcardSchema.index({ userId: 1, nextReview: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
```

### Step 2.3: Auth Routes

**Create `backend/src/routes/auth.js`**:
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('displayName').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, displayName } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({ email, password, displayName });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        totalXP: user.totalXP,
        currentLeague: user.currentLeague,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        totalXP: user.totalXP,
        currentLeague: user.currentLeague,
        skills: user.skills,
        currentStreak: user.currentStreak,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

### Step 2.4: Auth Middleware

**Create `backend/src/middleware/auth.js`**:
```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

---

## Phase 3: Frontend Foundation

### Step 3.1: Redux Toolkit Store Setup

Redux Toolkit is the industry-standard for state management. We'll create slices for different parts of the app state.

**Create folder structure**:
```
frontend/src/store/
├── index.ts          # Store configuration
├── slices/
│   ├── uiSlice.ts    # Theme, loading states
│   ├── authSlice.ts  # User, token
│   ├── chatSlice.ts  # Conversations, messages
│   └── gamificationSlice.ts  # XP, achievements
└── hooks.ts          # Typed hooks
```

**Create `frontend/src/store/slices/uiSlice.ts`**:
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';
export type Mode = 'learning' | 'building';

interface UIState {
  theme: Theme;
  isLoading: boolean;
  isSidebarOpen: boolean;
  mode: Mode;
}

const initialState: UIState = {
  theme: 'dark',
  isLoading: false,
  isSidebarOpen: true,
  mode: 'learning',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setMode: (state, action: PayloadAction<Mode>) => {
      state.mode = action.payload;
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'learning' ? 'building' : 'learning';
    },
  },
});

export const { setTheme, toggleTheme, setLoading, setSidebarOpen, setMode, toggleMode } = uiSlice.actions;
export default uiSlice.reducer;
```

**Create `frontend/src/store/slices/authSlice.ts`**:
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  displayName: string;
  totalXP: number;
  currentLeague: string;
  currentStreak: number;
  skills: Record<string, number>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    addXP: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.totalXP += action.payload;
        // Update league based on XP
        if (state.user.totalXP >= 10000) state.user.currentLeague = 'diamond';
        else if (state.user.totalXP >= 5000) state.user.currentLeague = 'platinum';
        else if (state.user.totalXP >= 2000) state.user.currentLeague = 'gold';
        else if (state.user.totalXP >= 500) state.user.currentLeague = 'silver';
      }
    },
  },
});

export const { setCredentials, logout, updateUser, addXP } = authSlice.actions;
export default authSlice.reducer;
```

**Create `frontend/src/store/slices/chatSlice.ts`**:
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Mode } from './uiSlice';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode: Mode;
}

export interface Conversation {
  id: string;
  messages: Message[];
  createdAt: string;
  title?: string;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<Message, 'id' | 'timestamp'>>) => {
      const newMessage: Message = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };

      if (state.currentConversationId) {
        const conv = state.conversations.find(c => c.id === state.currentConversationId);
        if (conv) {
          conv.messages.push(newMessage);
        }
      } else {
        // Create new conversation
        const newConversation: Conversation = {
          id: crypto.randomUUID(),
          messages: [newMessage],
          createdAt: new Date().toISOString(),
        };
        state.conversations.push(newConversation);
        state.currentConversationId = newConversation.id;
      }
    },
    startNewConversation: (state) => {
      state.currentConversationId = null;
    },
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.currentConversationId === action.payload) {
        state.currentConversationId = null;
      }
    },
  },
});

export const { addMessage, startNewConversation, setCurrentConversation, deleteConversation } = chatSlice.actions;
export default chatSlice.reducer;
```

**Create `frontend/src/store/index.ts`** (Store Configuration with Persist):
```typescript
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  chat: chatReducer,
});

const persistConfig = {
  key: 'socraticdev',
  version: 1,
  storage,
  whitelist: ['ui', 'auth'], // Only persist these slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Create `frontend/src/store/hooks.ts`** (Typed Hooks):
```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**Update `frontend/src/main.tsx`** (Provider Setup):
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
```

### Step 3.2: Redis Setup (Backend)

Redis is used for caching, session management, and rate limiting.

**Create `backend/src/config/redis.js`**:
```javascript
const Redis = require('ioredis');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Cache helper functions
const cache = {
  // Get cached value
  async get(key) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  // Set cached value with optional TTL (seconds)
  async set(key, value, ttlSeconds = 3600) {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  },

  // Delete cached value
  async del(key) {
    await redis.del(key);
  },

  // Check if key exists
  async exists(key) {
    return await redis.exists(key);
  },

  // Increment counter (for rate limiting)
  async incr(key) {
    return await redis.incr(key);
  },

  // Set expiry on key
  async expire(key, seconds) {
    await redis.expire(key, seconds);
  },
};

module.exports = { redis, cache };
```

**Create `backend/src/middleware/rateLimiter.js`** (Redis-based Rate Limiting):
```javascript
const { cache } = require('../config/redis');

const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,    // 1 minute window
    max = 100,               // Max requests per window
    keyPrefix = 'rl:',       // Redis key prefix
    message = 'Too many requests, please try again later.',
  } = options;

  return async (req, res, next) => {
    try {
      // Create unique key based on IP or user ID
      const identifier = req.userId || req.ip;
      const key = `${keyPrefix}${identifier}`;

      const current = await cache.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await cache.expire(key, Math.ceil(windowMs / 1000));
      }

      // Check if over limit
      if (current > max) {
        return res.status(429).json({ message });
      }

      // Add rate limit info to headers
      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': Math.max(0, max - current),
      });

      next();
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

module.exports = rateLimiter;
```

**Create `backend/src/services/cacheService.js`** (Caching Service):
```javascript
const { cache } = require('../config/redis');

const cacheService = {
  // Cache user data
  async cacheUser(userId, userData, ttl = 3600) {
    await cache.set(`user:${userId}`, userData, ttl);
  },

  async getCachedUser(userId) {
    return await cache.get(`user:${userId}`);
  },

  // Cache flashcards
  async cacheFlashcards(userId, cards, ttl = 1800) {
    await cache.set(`flashcards:${userId}`, cards, ttl);
  },

  async getCachedFlashcards(userId) {
    return await cache.get(`flashcards:${userId}`);
  },

  // Invalidate user cache
  async invalidateUserCache(userId) {
    await cache.del(`user:${userId}`);
    await cache.del(`flashcards:${userId}`);
  },

  // Cache AI responses (for common queries)
  async cacheAIResponse(queryHash, response, ttl = 86400) {
    await cache.set(`ai:${queryHash}`, response, ttl);
  },

  async getCachedAIResponse(queryHash) {
    return await cache.get(`ai:${queryHash}`);
  },
};

module.exports = cacheService;
```

**Update `backend/.env`**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socraticdev
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Step 3.3: API Service Setup

**Create `frontend/src/services/api.ts`**:
```typescript
import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 3.4: Basic Routing

**Create `frontend/src/App.tsx`**:
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from './store/hooks';

// Pages
import LandingPage from './pages/LandingPage';
import LearningHub from './pages/LearningHub';
import AppPage from './pages/AppPage';
import BuildModePage from './pages/BuildModePage';
import DojoPage from './features/dojo/DojoPage';
import SRSDashboard from './features/srs/SRSDashboard';
import ReviewSession from './features/srs/ReviewSession';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';

function App() {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/learn" element={<LearningHub />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/build" element={<BuildModePage />} />
          <Route path="/dojo/*" element={<DojoPage />} />
          <Route path="/srs" element={<SRSDashboard />} />
          <Route path="/srs/review" element={<ReviewSession />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

---

## Phase 4: AI Chat Integration

### Step 4.1: Gemini Service (Frontend)

**Create `frontend/src/services/gemini.ts`**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const isGeminiConfigured = (): boolean => {
  return !!API_KEY && API_KEY !== 'your_gemini_api_key_here';
};

// System prompts for different modes
const LEARNING_MODE_PROMPT = `You are a Socratic tutor helping developers learn programming.
Before providing direct answers, ask 1-3 guiding questions that help the user discover the solution themselves.
Use questions that:
- Activate prior knowledge ("What do you already know about...?")
- Encourage prediction ("What do you think will happen if...?")
- Build conceptual understanding ("How does this relate to...?")
After the user engages, provide clear explanations with examples.`;

const BUILDING_MODE_PROMPT = `You are an expert programming assistant.
Provide direct, production-ready code solutions with brief explanations.
Focus on: type safety, error handling, edge cases, best practices, and performance.
Include comments for complex logic. Be concise but complete.`;

export async function sendMessageToGemini(
  messages: ChatMessage[],
  mode: 'learning' | 'building',
  projectContext?: string
): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Build system instruction
  let systemInstruction = mode === 'learning' 
    ? LEARNING_MODE_PROMPT 
    : BUILDING_MODE_PROMPT;
    
  if (projectContext) {
    systemInstruction += `\n\nProject Context:\n${projectContext}`;
  }

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history,
    generationConfig: {
      temperature: mode === 'learning' ? 0.8 : 0.7,
      maxOutputTokens: 8192,
    },
    systemInstruction,
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  
  return result.response.text();
}
```

### Step 4.2: useChat Hook

**Create `frontend/src/features/chat/useChat.ts`**:
```typescript
import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addMessage } from '../../store/slices/chatSlice';
import { sendMessageToGemini, isGeminiConfigured, ChatMessage } from '../../services/gemini';

export function useChat() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.ui.mode);
  const conversations = useAppSelector((state) => state.chat.conversations);
  const currentConversationId = useAppSelector((state) => state.chat.currentConversationId);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  const getApiMessages = useCallback((): ChatMessage[] => {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    setError(null);

    // Check if API is configured
    if (!isGeminiConfigured()) {
      setError('Gemini API key not configured');
      dispatch(addMessage({ role: 'user', content: content.trim(), mode }));
      dispatch(addMessage({
        role: 'assistant',
        content: '⚠️ **API Key Required**\n\nPlease add your Gemini API key to `.env.local`',
        mode,
      }));
      return;
    }

    // Add user message
    dispatch(addMessage({ role: 'user', content: content.trim(), mode }));
    setIsLoading(true);

    try {
      const apiMessages: ChatMessage[] = [
        ...getApiMessages(),
        { role: 'user', content: content.trim() },
      ];

      const response = await sendMessageToGemini(apiMessages, mode);
      dispatch(addMessage({ role: 'assistant', content: response, mode }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      dispatch(addMessage({
        role: 'assistant',
        content: `❌ Error: ${errorMessage}`,
        mode,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [mode, isLoading, dispatch, getApiMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    isConfigured: isGeminiConfigured(),
  };
}
```

### Step 4.3: Chat Components

**Create `frontend/src/features/chat/ChatPanel.tsx`**:
```typescript
import { useState, useRef, useEffect } from 'react';
import { useChat } from './useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleMode } from '../../store/slices/uiSlice';

export default function ChatPanel() {
  const { messages, isLoading, sendMessage, isConfigured } = useChat();
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.ui.mode);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Mode Toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => dispatch(toggleMode())}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'learning'
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {mode === 'learning' ? '📚 Learning Mode' : '🔨 Building Mode'}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          {mode === 'learning'
            ? 'AI asks guiding questions before answers'
            : 'AI provides direct solutions'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <h3 className="text-lg font-medium">Start a conversation</h3>
            <p>Ask me anything about coding!</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
```

---

## Phase 5: The Dojo (Challenges)

### Step 5.1: Challenge Types Overview

The Dojo has **10 challenge types**:

| # | Challenge | Description | Key Skills |
|---|-----------|-------------|------------|
| 1 | Parsons Problems | Drag code blocks into correct order | Logical flow |
| 2 | Code Surgery | Find and fix bugs | Debugging |
| 3 | ELI5 | Explain code simply | Communication |
| 4 | Fill the Blanks | Complete partial code | Syntax |
| 5 | Mental Compiler | Predict code output | Mental models |
| 6 | Rubber Duck | Debug by explaining | Problem solving |
| 7 | Code Translation | Convert between languages | Language skills |
| 8 | TDD | Write code to pass tests | Testing |
| 9 | Pattern Detective | Identify design patterns | Architecture |
| 10 | Big O Battle | Identify time complexity | Algorithms |

### Step 5.2: Challenge AI Hook

**Create `frontend/src/features/dojo/useChallengeAI.ts`**:
```typescript
import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export type ChallengeType = 
  | 'parsons' | 'surgery' | 'eli5' | 'faded' | 'mental'
  | 'rubber-duck' | 'translation' | 'tdd' | 'pattern' | 'bigo';

interface GeneratedChallenge {
  title: string;
  description: string;
  code?: string;
  solution?: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export function useChallengeAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChallenge = useCallback(async (
    type: ChallengeType,
    language: string = 'javascript',
    topic?: string
  ): Promise<GeneratedChallenge | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompts: Record<ChallengeType, string> = {
        parsons: `Generate a Parsons Problem challenge in ${language}.
          Create 6-10 lines of code that should be reordered.
          Return JSON: { title, description, lines: string[], correctOrder: number[], distractors: string[] }`,
        
        surgery: `Generate a Code Surgery challenge in ${language}.
          Create buggy code with 1-3 bugs to find and fix.
          Return JSON: { title, description, buggyCode, fixedCode, hints: string[] }`,
        
        eli5: `Generate an ELI5 challenge in ${language}.
          Create code that needs to be explained simply.
          Return JSON: { title, code, keyPoints: string[], forbiddenWords: string[] }`,
        
        mental: `Generate a Mental Compiler challenge in ${language}.
          Create code and predict its output.
          Return JSON: { title, code, correctOutput, options: string[], explanation }`,
        
        bigo: `Generate a Big O Battle challenge in ${language}.
          Create an algorithm and ask about its complexity.
          Return JSON: { title, code, correctComplexity, options: string[], explanation }`,
        
        faded: `Generate a Fill the Blanks challenge in ${language}.
          Create code with blanks to fill.
          Return JSON: { title, codeWithBlanks, answers: string[], hints: string[] }`,
        
        'rubber-duck': `Generate a Rubber Duck debugging scenario in ${language}.
          Create buggy code and guiding questions.
          Return JSON: { title, buggyCode, guidingQuestions: string[], solution }`,
        
        translation: `Generate a Code Translation challenge.
          Create code to translate from ${language} to another language.
          Return JSON: { title, sourceCode, sourceLang, targetLang, solution }`,
        
        tdd: `Generate a TDD challenge in ${language}.
          Create test cases and ask user to implement.
          Return JSON: { title, testCases: string[], functionSignature, solution }`,
        
        pattern: `Generate a Pattern Detective challenge in ${language}.
          Create code implementing a design pattern.
          Return JSON: { title, code, correctPattern, options: string[], explanation }`,
      };

      const result = await model.generateContent(prompts[type]);
      const text = result.response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse challenge response');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const evaluateAnswer = useCallback(async (
    type: ChallengeType,
    challenge: GeneratedChallenge,
    userAnswer: string
  ): Promise<{ correct: boolean; feedback: string; score: number }> => {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`
      Evaluate this ${type} challenge answer.
      Challenge: ${JSON.stringify(challenge)}
      User's Answer: ${userAnswer}
      
      Return JSON: { correct: boolean, feedback: string, score: 0-100 }
    `);

    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { correct: false, feedback: 'Could not evaluate', score: 0 };
  }, []);

  return { generateChallenge, evaluateAnswer, isGenerating, error };
}
```

### Step 5.3: Parsons Problem Component

**Create `frontend/src/features/dojo/ParsonsChallenge.tsx`**:
```typescript
import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useChallengeAI } from './useChallengeAI';

// Sortable Code Block Component
function SortableCodeBlock({ id, code }: { id: string; code: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-gray-800 rounded-lg cursor-grab active:cursor-grabbing
                 border border-gray-700 hover:border-blue-500 transition-colors"
    >
      <code className="text-green-400 font-mono text-sm">{code}</code>
    </div>
  );
}

export default function ParsonsChallenge() {
  const { generateChallenge, evaluateAnswer, isGenerating } = useChallengeAI();
  const [challenge, setChallenge] = useState<any>(null);
  const [codeBlocks, setCodeBlocks] = useState<{ id: string; code: string }[]>([]);
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    const newChallenge = await generateChallenge('parsons', 'javascript');
    if (newChallenge) {
      setChallenge(newChallenge);
      // Shuffle lines
      const shuffled = [...newChallenge.lines]
        .sort(() => Math.random() - 0.5)
        .map((code, i) => ({ id: `block-${i}`, code }));
      setCodeBlocks(shuffled);
      setResult(null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCodeBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const checkAnswer = async () => {
    const userOrder = codeBlocks.map(b => b.code).join('\n');
    const evaluation = await evaluateAnswer('parsons', challenge, userOrder);
    setResult(evaluation);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">🧩 Parsons Problem</h2>
      
      {isGenerating ? (
        <div className="text-center py-8">Generating challenge...</div>
      ) : challenge ? (
        <>
          <p className="text-gray-400 mb-6">{challenge.description}</p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={codeBlocks} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {codeBlocks.map((block) => (
                  <SortableCodeBlock key={block.id} {...block} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-6 flex gap-4">
            <button
              onClick={checkAnswer}
              className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700"
            >
              Check Answer
            </button>
            <button
              onClick={loadChallenge}
              className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              New Challenge
            </button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.correct ? 'bg-green-900/50' : 'bg-red-900/50'
            }`}>
              <p className="font-medium">
                {result.correct ? '✅ Correct!' : '❌ Not quite right'}
              </p>
              <p className="text-sm mt-2">{result.feedback}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
```

### Step 5.4: Dojo Hub (Challenge Selection)

**Create `frontend/src/features/dojo/DojoHub.tsx`**:
```typescript
import { Link } from 'react-router-dom';

const challenges = [
  { id: 'parsons', name: 'Parsons Problems', icon: '🧩', description: 'Reorder code blocks' },
  { id: 'surgery', name: 'Code Surgery', icon: '🔪', description: 'Find and fix bugs' },
  { id: 'eli5', name: 'ELI5 Mode', icon: '👶', description: 'Explain code simply' },
  { id: 'faded', name: 'Fill the Blanks', icon: '📝', description: 'Complete partial code' },
  { id: 'mental', name: 'Mental Compiler', icon: '🧠', description: 'Predict code output' },
  { id: 'rubber-duck', name: 'Rubber Duck', icon: '🦆', description: 'Debug by explaining' },
  { id: 'translation', name: 'Code Translation', icon: '🌐', description: 'Convert between languages' },
  { id: 'tdd', name: 'TDD Challenge', icon: '✅', description: 'Write code for tests' },
  { id: 'pattern', name: 'Pattern Detective', icon: '🔍', description: 'Identify patterns' },
  { id: 'bigo', name: 'Big O Battle', icon: '⚡', description: 'Analyze complexity' },
];

export default function DojoHub() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">🥋 The Dojo</h1>
      <p className="text-gray-400 mb-8">Master coding through deliberate practice</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <Link
            key={challenge.id}
            to={`/dojo/${challenge.id}`}
            className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors
                       border border-gray-700 hover:border-blue-500"
          >
            <div className="text-4xl mb-3">{challenge.icon}</div>
            <h3 className="text-lg font-semibold">{challenge.name}</h3>
            <p className="text-sm text-gray-400">{challenge.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 6: Spaced Repetition System

### Step 6.1: SM-2 Algorithm

The SM-2 algorithm is the core of the SRS. Here's how it works:

```
For each review:
1. User rates difficulty (0-5 scale)
2. If rating >= 3 (correct):
   - First review: interval = 1 day
   - Second review: interval = 6 days
   - After: interval = previous_interval × ease_factor
   - Increment repetitions
3. If rating < 3 (wrong):
   - Reset interval to 1 day
   - Reset repetitions to 0
4. Adjust ease factor (never below 1.3):
   ease_factor += 0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02)
```

### Step 6.2: SRS Hook

**Create `frontend/src/features/srs/useSRS.ts`**:
```typescript
import { useState, useEffect, useCallback } from 'react';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'basic' | 'cloze' | 'code';
  language?: string;
  tags: string[];
  sourceType: 'manual' | 'chat' | 'dojo';
  createdAt: number;
  // SM-2 fields
  interval: number;
  repetitions: number;
  easeFactor: number;
  nextReview: number;
  lastReview?: number;
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

const STORAGE_KEY = 'socraticdev-srs-cards';

// SM-2 Algorithm
function calculateNextReview(card: Flashcard, quality: Quality): Partial<Flashcard> {
  let { interval, repetitions, easeFactor } = card;

  if (quality < 3) {
    // Failed: reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed: increase interval
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  // Update ease factor (min 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const now = Date.now();
  const nextReview = now + interval * 24 * 60 * 60 * 1000;

  return { interval, repetitions, easeFactor, nextReview, lastReview: now };
}

export function useSRS() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setCards(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, isLoaded]);

  // Get cards due for review
  const getDueCards = useCallback(() => {
    const now = Date.now();
    return cards.filter(card => card.nextReview <= now)
                .sort((a, b) => a.nextReview - b.nextReview);
  }, [cards]);

  // Add a new card
  const addCard = useCallback((
    front: string,
    back: string,
    options: Partial<Flashcard> = {}
  ) => {
    const now = Date.now();
    const newCard: Flashcard = {
      id: `card_${now}_${Math.random().toString(36).substr(2, 9)}`,
      front,
      back,
      type: options.type || 'basic',
      language: options.language,
      tags: options.tags || [],
      sourceType: options.sourceType || 'manual',
      createdAt: now,
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: now,
    };
    setCards(prev => [...prev, newCard]);
  }, []);

  // Review a card
  const reviewCard = useCallback((cardId: string, quality: Quality) => {
    setCards(prev => prev.map(card => {
      if (card.id === cardId) {
        return { ...card, ...calculateNextReview(card, quality) };
      }
      return card;
    }));
  }, []);

  // Delete a card
  const deleteCard = useCallback((cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  }, []);

  // Get deck progress
  const getDeckProgress = useCallback(() => {
    let newCards = 0, learning = 0, review = 0, mastered = 0;
    
    cards.forEach(card => {
      if (card.repetitions === 0) newCards++;
      else if (card.interval < 21) learning++;
      else if (card.easeFactor >= 2.5) mastered++;
      else review++;
    });

    return { new: newCards, learning, review, mastered };
  }, [cards]);

  return {
    cards,
    isLoaded,
    getDueCards,
    addCard,
    reviewCard,
    deleteCard,
    getDeckProgress,
  };
}
```

### Step 6.3: Review Session Component

**Create `frontend/src/features/srs/ReviewSession.tsx`**:
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSRS, Quality, Flashcard } from './useSRS';
import { useStore } from '../../store/useStore';

export default function ReviewSession() {
  const { getDueCards, reviewCard } = useSRS();
  const { addXP } = useStore();
  const navigate = useNavigate();
  
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

  useEffect(() => {
    setDueCards(getDueCards());
  }, [getDueCards]);

  const currentCard = dueCards[currentIndex];

  const handleRate = (quality: Quality) => {
    if (!currentCard) return;
    
    reviewCard(currentCard.id, quality);
    
    // Update stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0),
    }));
    
    // Award XP
    addXP(quality >= 3 ? 5 : 1);
    
    // Move to next card
    setShowAnswer(false);
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Session complete
      alert(`Session complete! Reviewed: ${sessionStats.reviewed + 1}`);
      navigate('/srs');
    }
  };

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">🎉 All caught up!</h2>
        <p className="text-gray-400">No cards due for review.</p>
        <button
          onClick={() => navigate('/srs')}
          className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>{currentIndex + 1} / {dueCards.length}</span>
          <span>✓ {sessionStats.correct}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="bg-gray-800 rounded-xl p-8 min-h-[300px] flex flex-col
                   justify-center items-center text-center cursor-pointer"
        onClick={() => setShowAnswer(true)}
      >
        {!showAnswer ? (
          <>
            <p className="text-xl whitespace-pre-wrap">{currentCard.front}</p>
            <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2">Answer:</p>
            <p className="text-xl whitespace-pre-wrap">{currentCard.back}</p>
          </>
        )}
      </div>

      {/* Rating Buttons */}
      {showAnswer && (
        <div className="mt-6 grid grid-cols-4 gap-2">
          <button
            onClick={() => handleRate(0)}
            className="py-3 bg-red-600 rounded-lg hover:bg-red-700"
          >
            Again
          </button>
          <button
            onClick={() => handleRate(2)}
            className="py-3 bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate(3)}
            className="py-3 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Good
          </button>
          <button
            onClick={() => handleRate(5)}
            className="py-3 bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 7: Code Visualizer

### Step 7.1: Simple Code Execution Tracer

For the visualizer, we'll create a simplified version that traces JavaScript execution.

**Create `frontend/src/features/visualizer/CodeVisualizer.tsx`**:
```typescript
import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface ExecutionStep {
  line: number;
  variables: Record<string, any>;
  output: string[];
  description: string;
}

export default function CodeVisualizer() {
  const [code, setCode] = useState(`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(5));`);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Simple tracer using Function constructor (for demo purposes)
  const traceExecution = useCallback(async () => {
    setIsRunning(true);
    setSteps([]);
    setCurrentStep(0);

    try {
      const output: string[] = [];
      const tracedSteps: ExecutionStep[] = [];
      let stepNumber = 0;

      // Override console.log to capture output
      const originalLog = console.log;
      console.log = (...args) => {
        output.push(args.map(a => JSON.stringify(a)).join(' '));
        tracedSteps.push({
          line: stepNumber,
          variables: {},
          output: [...output],
          description: `Output: ${args.join(' ')}`,
        });
      };

      // Execute the code
      const fn = new Function(code);
      fn();

      console.log = originalLog;

      if (tracedSteps.length === 0) {
        tracedSteps.push({
          line: 0,
          variables: {},
          output,
          description: 'Execution complete',
        });
      }

      setSteps(tracedSteps);
    } catch (error) {
      setSteps([{
        line: 0,
        variables: {},
        output: [`Error: ${error}`],
        description: 'Execution failed',
      }]);
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  return (
    <div className="h-screen flex">
      {/* Code Editor */}
      <div className="w-1/2 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold">Code</h2>
          <button
            onClick={traceExecution}
            disabled={isRunning}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
        </div>
        <Editor
          height="calc(100vh - 60px)"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
          }}
        />
      </div>

      {/* Visualization Panel */}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-semibold">Execution Trace</h2>
        </div>

        {/* Step Controls */}
        {steps.length > 0 && (
          <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
            >
              ← Prev
            </button>
            <span>Step {currentStep + 1} / {steps.length}</span>
            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* Current Step Details */}
        <div className="flex-1 p-4 overflow-auto">
          {steps[currentStep] && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p>{steps[currentStep].description}</p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Console Output</h3>
                <pre className="font-mono text-sm text-green-400">
                  {steps[currentStep].output.join('\n') || '(no output)'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 8: Analytics & Gamification

### Step 8.1: Analytics Dashboard

**Create `frontend/src/features/analytics/AnalyticsDashboard.tsx`**:
```typescript
import { useStore } from '../../store/useStore';
import { useSRS } from '../srs/useSRS';

export default function AnalyticsDashboard() {
  const { user } = useStore();
  const { cards, getDeckProgress } = useSRS();
  const progress = getDeckProgress();

  // Calculate skill radar data
  const skills = user?.skills || {
    algorithms: 0,
    dataStructures: 0,
    debugging: 0,
    designPatterns: 0,
    testing: 0,
    architecture: 0,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">📊 Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total XP" value={user?.totalXP || 0} icon="⭐" />
        <StatCard title="Current League" value={user?.currentLeague || 'Bronze'} icon="🏆" />
        <StatCard title="Streak" value={`${user?.currentStreak || 0} days`} icon="🔥" />
        <StatCard title="Cards Mastered" value={progress.mastered} icon="📚" />
      </div>

      {/* SRS Progress */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Flashcard Progress</h2>
        <div className="grid grid-cols-4 gap-4">
          <ProgressBar label="New" value={progress.new} total={cards.length} color="blue" />
          <ProgressBar label="Learning" value={progress.learning} total={cards.length} color="orange" />
          <ProgressBar label="Review" value={progress.review} total={cards.length} color="yellow" />
          <ProgressBar label="Mastered" value={progress.mastered} total={cards.length} color="green" />
        </div>
      </div>

      {/* Skill Radar (simplified as bars) */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Skill Levels</h2>
        <div className="space-y-3">
          {Object.entries(skills).map(([skill, level]) => (
            <div key={skill} className="flex items-center gap-4">
              <span className="w-32 capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
              <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${level}%` }}
                />
              </div>
              <span className="w-12 text-right">{level}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${colorClasses[color]}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
```

### Step 8.2: Gamification Components

**Create `frontend/src/features/gamification/Achievements.tsx`**:
```typescript
const ACHIEVEMENTS = [
  { id: 'first_chat', name: 'First Steps', description: 'Send your first message', icon: '💬', xp: 10 },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day learning streak', icon: '🔥', xp: 50 },
  { id: 'cards_100', name: 'Memory Master', description: 'Create 100 flashcards', icon: '🧠', xp: 100 },
  { id: 'dojo_all', name: 'Dojo Complete', description: 'Try all 10 challenge types', icon: '🥋', xp: 75 },
  { id: 'xp_1000', name: 'Rising Star', description: 'Earn 1000 XP', icon: '⭐', xp: 50 },
  { id: 'project_upload', name: 'Code Explorer', description: 'Upload your first project', icon: '📁', xp: 25 },
];

interface AchievementsProps {
  unlockedIds: string[];
}

export default function Achievements({ unlockedIds }: AchievementsProps) {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">🏆 Achievements</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500'
                  : 'bg-gray-800 border-gray-700 opacity-60'
              }`}
            >
              <div className="text-4xl mb-2">{isUnlocked ? achievement.icon : '🔒'}</div>
              <h3 className="font-semibold">{achievement.name}</h3>
              <p className="text-sm text-gray-400">{achievement.description}</p>
              <div className="mt-2 text-sm text-yellow-500">+{achievement.xp} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Create `frontend/src/features/gamification/DailyQuests.tsx`**:
```typescript
import { useState, useEffect } from 'react';

interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  xp: number;
}

export default function DailyQuests() {
  const [quests, setQuests] = useState<Quest[]>([
    { id: 'chat_3', title: 'Curious Mind', description: 'Ask 3 questions', target: 3, current: 0, xp: 15 },
    { id: 'review_10', title: 'Memory Lane', description: 'Review 10 flashcards', target: 10, current: 0, xp: 20 },
    { id: 'dojo_1', title: 'Practice Makes Perfect', description: 'Complete 1 dojo challenge', target: 1, current: 0, xp: 25 },
  ]);

  return (
    <div className="p-6 bg-gray-800 rounded-xl">
      <h2 className="text-xl font-bold mb-4">📋 Daily Quests</h2>
      <div className="space-y-4">
        {quests.map((quest) => {
          const progress = Math.min((quest.current / quest.target) * 100, 100);
          const isComplete = quest.current >= quest.target;

          return (
            <div
              key={quest.id}
              className={`p-4 rounded-lg border ${
                isComplete ? 'border-green-500 bg-green-900/20' : 'border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{quest.title}</h3>
                  <p className="text-sm text-gray-400">{quest.description}</p>
                </div>
                <span className="text-yellow-500">+{quest.xp} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isComplete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm">
                  {quest.current}/{quest.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Phase 9: Project Upload & Analysis

### Step 9.1: Backend Upload Route

**Create `backend/src/routes/projects.js`**:
```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`), false);
    }
  },
});

// Upload project files
router.post('/upload', auth, upload.array('files', 50), async (req, res) => {
  try {
    const { projectName } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Create project record
    const project = {
      id: `proj_${Date.now()}`,
      name: projectName || 'Untitled Project',
      userId: req.userId,
      files: files.map(f => ({
        name: f.originalname,
        path: f.path,
        size: f.size,
      })),
      createdAt: new Date(),
    };

    // TODO: Store in MongoDB and analyze
    // For now, return the project info
    res.json({
      message: 'Project uploaded successfully',
      project,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;
```

### Step 9.2: Frontend Upload Component

**Create `frontend/src/features/upload/ProjectUpload.tsx`**:
```typescript
import { useState, useCallback } from 'react';
import api from '../../services/api';

export default function ProjectUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('projectName', projectName || 'Untitled');
      files.forEach(file => formData.append('files', file));

      const response = await api.post('/projects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });

      alert('Project uploaded successfully!');
      setFiles([]);
      setProjectName('');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">📁 Upload Project</h2>

      {/* Project Name */}
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Project Name"
        className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
      />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center
                   hover:border-blue-500 transition-colors cursor-pointer"
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
          accept=".js,.ts,.jsx,.tsx,.py,.java,.go,.rs"
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <div className="text-4xl mb-4">📂</div>
          <p className="text-lg">Drop files here or click to browse</p>
          <p className="text-sm text-gray-400 mt-2">
            Supports: .js, .ts, .jsx, .tsx, .py, .java, .go, .rs
          </p>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">{files.length} files selected</h3>
          <div className="space-y-2 max-h-48 overflow-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-800 rounded-lg"
              >
                <span className="truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={files.length === 0 || isUploading}
        className="w-full mt-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? `Uploading... ${progress}%` : 'Upload Project'}
      </button>
    </div>
  );
}
```

---

## Deployment Guide

### Option 1: Deploy to Render (Recommended for Beginners)

1. **Push code to GitHub**
2. **Create Render account** at [render.com](https://render.com)
3. **Deploy Backend**:
   - New → Web Service → Connect GitHub repo
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `node src/app.js`
   - Add environment variables
4. **Deploy Frontend**:
   - New → Static Site → Connect GitHub repo
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`
5. **Set up MongoDB Atlas** for database

### Option 2: Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Railway auto-detects and deploys both services

### Option 3: Deploy to Vercel + Railway

- **Frontend**: Vercel (optimized for React/Next.js)
- **Backend**: Railway (for Node.js API)
- **Database**: MongoDB Atlas (free tier)

### Environment Variables for Production

**Backend**:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
GEMINI_API_KEY=your_api_key
```

**Frontend**:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_GEMINI_API_KEY=your_api_key
```

---

## NPM Modules Reference

### Frontend Modules Explained

| Module | Version | Purpose | Usage |
|--------|---------|---------|-------|
| `react` | 18.3.1 | UI library | Core framework |
| `react-dom` | 18.3.1 | React DOM renderer | Rendering React to DOM |
| `react-router-dom` | 6.22.0 | Client-side routing | Navigation between pages |
| `@reduxjs/toolkit` | 2.0.1 | State management | Global app state (industry standard) |
| `react-redux` | 9.0.4 | React bindings for Redux | Connect components to store |
| `redux-persist` | 6.0.0 | Persist Redux state | Save user preferences to localStorage |
| `axios` | 1.6.0 | HTTP client | API calls to backend |
| `@google/generative-ai` | 0.21.0 | Gemini AI SDK | AI chat and generation |
| `@monaco-editor/react` | 4.6.0 | VS Code editor | Code editing component |
| `reactflow` | 11.11.4 | Graph visualization | Dependency graph display |
| `@reactflow/background` | 11.3.14 | ReactFlow backgrounds | Graph styling |
| `@reactflow/controls` | 11.2.14 | ReactFlow controls | Pan/zoom controls |
| `@dnd-kit/core` | 6.3.1 | Drag and drop | Parsons problems |
| `@dnd-kit/sortable` | 10.0.0 | Sortable lists | Reorderable code blocks |
| `@dnd-kit/utilities` | 3.2.2 | DnD utilities | CSS transform helpers |
| `framer-motion` | 12.0.0 | Animations | Page transitions, UI effects |
| `gsap` | 3.14.2 | Advanced animations | Landing page animations |
| `@gsap/react` | 2.1.1 | GSAP React hooks | useGSAP hook |
| `prismjs` | 1.30.0 | Syntax highlighting | Code blocks in chat |
| `react-syntax-highlighter` | 15.5.0 | React syntax highlighter | Chat code display |

### Backend Modules Explained

| Module | Version | Purpose | Usage |
|--------|---------|---------|-------|
| `express` | 4.18.2 | Web framework | HTTP server and routing |
| `mongoose` | 8.0.0 | MongoDB ODM | Database operations |
| `ioredis` | 5.3.2 | Redis client | Caching, sessions, rate limiting |
| `redis` | 4.6.0 | Official Redis client | Alternative Redis client |
| `cors` | 2.8.5 | CORS middleware | Cross-origin requests |
| `dotenv` | 16.3.1 | Environment variables | Config management |
| `bcryptjs` | 2.4.3 | Password hashing | Secure password storage |
| `jsonwebtoken` | 9.0.2 | JWT tokens | Authentication |
| `multer` | 1.4.5 | File uploads | Project file handling |
| `express-validator` | 7.0.1 | Input validation | Request validation |
| `@google/generative-ai` | 0.21.0 | Gemini AI SDK | AI features (optional) |
| `helmet` | 7.1.0 | Security headers | HTTP security |
| `morgan` | 1.10.0 | Request logging | Development logging |
| `express-rate-limit` | 7.1.5 | Rate limiting | API protection |

---

## Quick Start Commands

```bash
# Clone and setup
git clone <your-repo>
cd socraticdev

# Start Redis (required for caching/rate limiting)
# On Windows: Use WSL or Docker
# On Mac: brew install redis && brew services start redis
# On Linux: sudo apt install redis-server && sudo systemctl start redis

# Backend setup
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.local.example .env.local  # Edit with your values
npm run dev

# Open browser: http://localhost:5173
```

---

## Summary

Congratulations! You now have a complete guide to build SocraticDev with MERN stack. Here's what you've learned:

| Phase | What You Built |
|-------|---------------|
| 1 | Foundation with Vite + Express + MongoDB |
| 2 | User auth with JWT, User/Flashcard models |
| 3 | Redux Toolkit store, Redis caching, API service |
| 4 | AI chat with Gemini, Learning/Building modes |
| 5 | Dojo with 10 challenge types, AI generation |
| 6 | SRS with SM-2 algorithm |
| 7 | Code visualizer with execution trace |
| 8 | Analytics dashboard + Gamification |
| 9 | Project upload functionality |

**Tech Stack Summary**:
- **Frontend**: React 18, Redux Toolkit, Vite, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Redis
- **AI**: Google Gemini API
- **Libraries**: ReactFlow, dnd-kit, Monaco Editor, GSAP, Framer Motion

**Next Steps**:
1. Build the MVP with core features (Chat + Dojo + SRS)
2. Add authentication and user data
3. Implement gamification to increase engagement
4. Deploy to Render/Railway + MongoDB Atlas + Redis Cloud
5. Iterate based on user feedback

Good luck with your project! 🚀
