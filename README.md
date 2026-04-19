# Cognivibe AI

## Description

Cognivibe AI is an emotion-adaptive learning platform that combines real-time facial emotion detection, mood analytics, AI-assisted learning, interactive quizzes, and educational games. It helps learners stay motivated, reduce burnout, and improve retention by adapting content and recommendations based on emotional state.

## Problem it solves

- Detects emotional state during learning sessions and adapts experience accordingly
- Reduces stress and improves focus through mood-aware coaching
- Replaces static study flows with emotionally intelligent recommendations
- Keeps learners engaged with quizzes, games, and interactive feedback
- Provides analytics for mood trends, resilience, and learning progress

## Features

- User authentication and profile management
- Real-time emotion detection via webcam and face-api.js
- Mood recording, history, and distribution analytics
- AI chatbot powered by Gemini/Google Generative AI for emotional support and learning guidance
- Personalized recommendations based on mood and learning history
- GK quizzes and interactive games for motivation and practice
- Mood-aware learning modules with AI-generated content
- Quiz result tracking and progress submission
- 3D dashboard visuals using Three.js
- Sentiment analysis for textual input

## Tech stack

- Frontend: React, Vite, Zustand, Tailwind CSS, Chart.js, face-api.js, Three.js, Framer Motion, GSAP
- Backend: Node.js, Express, Sequelize, MySQL, JWT, bcrypt, Google Generative AI, natural
- Tools: Axios, dotenv, nodemon, Jest

## Folder structure

```
Cognivibe-ai/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── learning.controller.js
│   │   ├── mood.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   └── ... Sequelize models ...
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── chat.routes.js
│   │   ├── learning.routes.js
│   │   └── mood.routes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── models/
│   ├── src/
│   │   ├── ai/
│   │   ├── components/
│   │   ├── 3d/
│   │   ├── store/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── models/
│   └── ... face-api model weights ...
└── download-models.ps1
```

## Installation

### Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` with:

```bash
DB_NAME=cognivibe_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306
CLIENT_URL=http://localhost:5173
PORT=5000
GEMINI_API_KEY=your_gemini_key
NODE_ENV=development
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/` if needed:

```bash
VITE_API_URL=http://localhost:5000/api
```

### Optional

If face detection model files are missing, run the PowerShell helper:

```powershell
.roadcast-models.ps1
```

## Usage

### Start backend

```bash
cd backend
npm run dev
```

### Start frontend

```bash
cd frontend
npm run dev
```

### Open app

Visit `http://localhost:5173` in your browser.

### Main flows

- Register or login
- Enable webcam emotion detection on the dashboard
- Review mood analytics and resilience insights
- Use personalized recommendations and AI coaching
- Launch GK quizzes and interactive learning games
- Track progress through quiz and mood history

## Future improvements

- Add leaderboard and social sharing features
- Improve mobile responsiveness and PWA support
- Expand adaptive content personalization
- Add offline learning support for modules
- Add audio sentiment analysis and voice coaching
- Build asynchronous multiplayer quiz modes
- Enhance Gemini prompt tuning for deeper emotional empathy
