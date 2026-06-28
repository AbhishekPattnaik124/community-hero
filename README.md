# 🏙️ Community Hero — Rourkela Civic Issue Platform

> **Empowering Rourkela citizens to report, track, and resolve civic issues using AI**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-community--hero--client.onrender.com-6366f1?style=for-the-badge)](https://community-hero-client.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-AbhishekPattnaik124%2Fcommunity--hero-181717?style=for-the-badge&logo=github)](https://github.com/AbhishekPattnaik124/community-hero)
[![Backend](https://img.shields.io/badge/API-community--hero--server.onrender.com-10b981?style=for-the-badge)](https://community-hero-server.onrender.com/health)
[![ML Service](https://img.shields.io/badge/ML-community--hero--ml.onrender.com-f59e0b?style=for-the-badge)](https://community-hero-ml.onrender.com/health)

---

## 🌐 Live URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://community-hero-client.onrender.com | ✅ Live |
| **Backend API** | https://community-hero-server.onrender.com | ✅ Live |
| **ML Service** | https://community-hero-ml.onrender.com | ✅ Live |
| **API Docs** | https://community-hero-server.onrender.com/api/docs | ✅ Live |

> ⚠️ **Free Tier Note:** Render free instances spin down after 15 minutes of inactivity. First request may take ~30–45 seconds to wake up. After that, response times are instant.

---

## 📸 Features

### 🤖 AI-Powered Issue Detection (Gemini 1.5 Pro)
Upload a photo of a civic issue → Gemini analyzes it and returns:
- Issue category (pothole, waterlogging, streetlight, etc.)
- Severity score (1–5)
- Urgency level (low/medium/high/critical)
- Responsible authority (RMC or SAIL RSP)
- Estimated fix time
- Safety risk assessment

### 🗺️ Interactive Rourkela Map
- Real-time issue pins with color coding by severity
- All 40 RMC wards visualized
- SAIL RSP sector boundaries
- Flood-prone zone overlays (Bondamunda, Jhirpani, Panposh)
- Heatmap mode for issue density

### 🌊 Flood Prediction Engine
- Real-time Koel River level monitoring
- Mandira Dam level tracking
- Ward-wise flood risk alerts
- Monsoon pattern analysis

### 🏭 Dual Authority Routing (Unique to Rourkela)
Issues are automatically routed to:
- **RMC** (Rourkela Municipal Corporation) — civic wards 1–40
- **SAIL RSP** (Rourkela Steel Plant Township) — Sectors 1–28
- **OSPCB** — pollution complaints
- **OSDMA** — disaster/flood alerts
- **NHAI** — national highway issues

### ⚡ Real-Time Updates (Socket.io)
- Live issue feed
- Upvote notifications
- Status change alerts
- Flood emergency broadcast

### 🏆 Gamification System
- Points for reporting (10 pts), verifying (5 pts), upvoting
- Badges: First Report, Verified Hero, Top Reporter, Flood Watcher, 7-Day Streak
- Ward-wise leaderboard
- Weekly/Monthly/All-Time rankings

### 📊 Analytics Dashboard
- Bento-grid stats for all 40 wards
- Category-wise pie charts
- Resolution time metrics
- AQI monitoring for Rourkela
- Authority comparison (RMC vs SAIL RSP)

### 📱 PWA Support
- Works offline
- Installable on Android/iOS
- Background sync for reports

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite 8 | UI framework |
| TailwindCSS 3 | Styling |
| Framer Motion | Animations |
| Mapbox GL JS | Interactive maps |
| Socket.io Client | Real-time events |
| Recharts | Data visualization |
| Zustand | State management |
| React Query | Server state |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 24 + Express | API server |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time events |
| JWT | Authentication |
| Passport.js + Google OAuth | Auth strategies |
| Apollo Server + GraphQL | GraphQL API |
| Redis (optional) | Caching |
| Winston | Logging |
| node-cron | Scheduled jobs |
| Swagger UI | API documentation |

### ML Service
| Technology | Purpose |
|-----------|---------|
| FastAPI + Python 3.12 | ML microservice |
| Google Gemini 1.5 Pro | Image analysis + AI |
| scikit-learn | DBSCAN hotspot clustering, Random Forest |
| NumPy + Pandas | Data processing |
| Pillow | Image processing |
| SciPy | Budget optimization (Linear Programming) |

### Google Technologies Used ✅
- ✅ **Google Gemini 1.5 Pro** — Civic issue image analysis, AI routing
- ✅ **Google AI Studio** — API key management
- ✅ **Google OAuth 2.0** — Social login
- ✅ **Google Maps Geocoding** — Address resolution

---

## 🚀 Local Development Setup

### Prerequisites
```bash
node --version  # >= 18
python --version  # >= 3.10
```

### 1. Clone
```bash
git clone https://github.com/AbhishekPattnaik124/community-hero.git
cd community-hero
```

### 2. Backend Setup
```bash
cd server
npm install --legacy-peer-deps
cp ../.env.example .env
# Edit .env and fill in MONGO_URI, GEMINI_API_KEY, etc.
npm run dev
# Server runs at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install --legacy-peer-deps
# Create .env file:
echo "VITE_API_URL=http://localhost:5000" > .env
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env
npm run dev
# App runs at http://localhost:5173
```

### 4. ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt
# Create .env file:
echo "GEMINI_API_KEY=your_key_here" > .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# ML Service runs at http://localhost:8000
```

### 5. Seed Database
```bash
cd server
npm run seed
```

---

## 📁 Project Structure

```
community-hero/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/              # Axios instance + interceptors
│   │   ├── components/       # Reusable UI components
│   │   │   ├── dashboard/    # AQI Monitor, Flood Predictor, Stats
│   │   │   ├── layout/       # Navbar, Footer
│   │   │   └── ui/           # Shared UI primitives
│   │   ├── context/          # React contexts (Socket, Auth)
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Route pages
│   │   │   ├── Landing.jsx   # Home page with live map
│   │   │   ├── ReportIssue.jsx  # 4-step AI-powered form
│   │   │   ├── Dashboard.jsx # Analytics dashboard
│   │   │   ├── Leaderboard.jsx  # Gamification
│   │   │   ├── MapView.jsx   # Full map view
│   │   │   └── ...
│   │   ├── store/            # Zustand stores
│   │   └── utils/            # Constants, helpers
│   └── vite.config.js
│
├── server/                   # Node.js + Express backend
│   └── src/
│       ├── config/           # DB, Redis, Kafka, Passport, Swagger
│       ├── controllers/      # Business logic
│       ├── graphql/          # Apollo GraphQL schema + resolvers
│       ├── middleware/        # Auth, rate limit, error handling
│       ├── models/           # Mongoose schemas (User, Issue, etc.)
│       ├── routes/           # Express route handlers
│       ├── seeds/            # Database seeder (20 real Rourkela issues)
│       ├── services/         # Gemini AI, Socket, Listening engine
│       └── utils/            # JWT, ApiResponse, rourkelaData (40 wards)
│
├── ml-service/               # Python FastAPI ML microservice
│   └── app/
│       ├── api/              # FastAPI routes + endpoints
│       ├── core/             # Config, Kafka client
│       ├── models/           # Pydantic schemas, ML model wrappers
│       ├── services/         # Gemini, Analytics, Hotspot, Vision
│       └── utils/            # Image utilities
│
├── render.yaml               # Render deployment config
├── docker-compose.yml        # Local Docker setup
└── .env.example              # Environment variable template
```

---

## 🗺️ Rourkela-Specific Data

### All 40 RMC Wards
Real ward names, councillor info, GPS coordinates, and authority mapping.

### Flood-Prone Zones
| Zone | Risk | Trigger |
|------|------|---------|
| Bondamunda Low Area | HIGH | Koel River > 147m elevation |
| Jhirpani River Bank | HIGH | Rainfall > 40mm/hour |
| Panposh Confluence | MEDIUM | Sanjo River overflow |

### Dual Authority Zones
- **RMC** handles: Wards 1–40 (civic infrastructure)
- **SAIL RSP Township** handles: Sectors 1–28 (steel plant residential)
- **OSPCB** handles: Industrial pollution complaints
- **OSDMA** handles: Flood/disaster emergencies

---

## 👤 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@communityhero.in | Admin@1234 |
| Citizen | rajesh@rourkela.in | User@1234 |
| Citizen | priya@rourkela.in | User@1234 |
| Citizen | sunita@rourkela.in | User@1234 |

---

## 🏆 Hackathon Submission

**Event:** Vibe2Ship Hackathon 2026 — Coding Ninjas × Google for Developers

### Problem Being Solved
Rourkela is a unique city with two distinct administrative authorities — RMC for civic wards and SAIL RSP Township for steel plant sectors. Citizens have no unified platform to:
1. Report civic issues with AI-powered categorization
2. Know which authority (RMC vs SAIL) is responsible
3. Track issue resolution in real-time
4. Get flood alerts specific to Rourkela's geography

### Innovation
- **Dual Authority Routing**: Unique to Rourkela — auto-routes to RMC or SAIL RSP
- **Hyperlocal AI**: Gemini trained on Rourkela-specific civic context
- **Flood Intelligence**: Koel River + Mandira Dam level monitoring
- **Ward-Level Accountability**: All 40 RMC wards with councillor contacts

### Evaluation Criteria Coverage
| Criteria | Implementation |
|----------|---------------|
| Problem Solving (20%) | Real Rourkela civic pain points solved |
| Agentic Depth (20%) | Gemini AI + automated routing + cron jobs |
| Innovation (20%) | SAIL RSP dual authority unique to city |
| Google Technologies (15%) | Gemini 1.5 Pro + Google OAuth + Maps API |
| Product Design (10%) | Glassmorphism dark UI with animations |
| Technical Excellence (10%) | MERN + FastAPI + Socket.io + GraphQL |
| Completeness (5%) | All features working and deployed |

---

## 📝 Environment Variables

See [`.env.example`](.env.example) for the full list. Critical variables:

```env
# Backend (server/.env)
MONGO_URI=mongodb+srv://...
JWT_SECRET=64_character_random_string
GEMINI_API_KEY=your_gemini_key
CLIENT_URL=https://community-hero-client.onrender.com
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret

# Frontend (client/.env)
VITE_API_URL=https://community-hero-server.onrender.com
VITE_SOCKET_URL=https://community-hero-server.onrender.com
VITE_MAPBOX_TOKEN=your_mapbox_token

# ML Service (ml-service/.env)
GEMINI_API_KEY=your_gemini_key
```

---

## 📄 License

MIT License — Built for Vibe2Ship Hackathon 2026
