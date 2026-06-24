# 🏙️ Community Hero — Rourkela Civic Issue Platform

<div align="center">

![Community Hero Banner](https://via.placeholder.com/900x300/1e293b/3b82f6?text=Community+Hero+%7C+Rourkela)

**Empowering 6 lakh Rourkela citizens to report, track, and resolve civic issues using AI**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Click_Here-blue?style=for-the-badge)](https://community-hero.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Abhishekpattnaik124/community-hero)
[![Built with Gemini](https://img.shields.io/badge/Google_Gemini_1.5_Pro-Powered-orange?style=for-the-badge&logo=google)](https://aistudio.google.com)

</div>

---

## 🌐 Live URLs

| Service | URL |
|---|---|
| **Frontend App** | _Coming soon — deploy to Railway/Vercel_ |
| **Backend API** | _Coming soon_ |
| **API Docs (Swagger)** | `/api/docs` |

---

## 📸 Screenshots

| Home — Rourkela Map | AI Issue Analysis | Ward Dashboard |
|---|---|---|
| ![Home](docs/screenshots/home.png) | ![AI](docs/screenshots/ai.png) | ![Dashboard](docs/screenshots/dashboard.png) |

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Issue Detection** | Google Gemini 1.5 Pro Vision analyzes photos and identifies issue type, severity, and authority |
| 🗺️ **Rourkela Interactive Map** | All 40 RMC wards with real GPS data, issue pins, flood zones, RSP sector boundaries |
| 🌊 **Flood Prediction Engine** | Real-time risk assessment using Koel River levels, Mandira Dam data, and IMD rainfall |
| 🏭 **Dual Authority Routing** | Smart routing between RMC (municipal) and SAIL RSP (steel plant township) jurisdictions |
| ⚡ **Real-time Updates** | Socket.io — new issues appear on map instantly for all users |
| 🏆 **Gamification System** | Points, badges, streaks, and leaderboard to reward active citizens |
| 📊 **Ward Analytics Dashboard** | Resolution rates, trust index, and issue heatmaps for all 40 wards |
| 🌿 **AQI Monitor** | Real-time air quality for Rourkela (elevated near RSP Steel Plant) |
| 📱 **PWA Support** | Works offline, installable on mobile |
| 🔐 **Google OAuth** | Sign in with Google for instant access |

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + Vite + React Router v6
- **TailwindCSS** + Framer Motion animations
- **Mapbox GL JS** — interactive ward map
- **Recharts** — analytics visualizations
- **Socket.io Client** — real-time sync
- **Zustand** — state management

### Backend
- **Node.js** + Express 4
- **MongoDB** + Mongoose — main database
- **Redis** — caching (optional, graceful fallback)
- **Socket.io** — real-time WebSocket
- **JWT** — authentication
- **Puppeteer** — PDF report generation
- **node-cron** — scheduled jobs

### Python ML Service
- **FastAPI** — ML inference API
- **Google Gemini 1.5 Pro Vision** — image analysis
- **Prophet** — time-series forecasting
- **Scikit-learn** — predictive models
- **SciPy** — budget optimization (Linear Programming)

### 🔵 Google Technologies Used
| Technology | Usage |
|---|---|
| ✅ **Google Gemini 1.5 Pro Vision** | Analyzing civic issue photos |
| ✅ **Google AI Studio** | Model prompting and testing |
| ✅ **Google OAuth 2.0** | User authentication |
| ✅ **Google Maps Geocoding API** | Address → GPS conversion |
| ✅ **Google Generative AI SDK** | AI pipeline integration |

---

## 🏙️ Rourkela-Specific Data

This platform is built specifically for **Rourkela, Odisha, India**:

- 📍 **40 RMC Wards** with real GPS coordinates and councillor data
- 🏭 **SAIL RSP Sectors 1–28** with separate authority routing
- 🌊 **3 flood-prone zones**: Bondamunda, Jhirpani, Panposh
- 🏥 **4 hospitals** (IGH, Govt Hospital, NIT Medical, Shanti NH)
- 🚔 **5 police stations** with contact numbers
- 🌊 **Mandira Dam** monitoring (critical level: 148m)
- 🏞️ **Koel River** monitoring (critical level: 147m)

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- MongoDB Atlas account (free tier works)
- Gemini API key (free from [aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Setup Backend
```bash
git clone https://github.com/Abhishekpattnaik124/community-hero
cd community-hero/server
npm install
cp .env.example .env
# Fill in MONGO_URI, GEMINI_API_KEY, JWT_SECRET
npm run dev
```

### 2. Setup Frontend
```bash
cd ../client
npm install
cp .env.example .env
# Fill in VITE_API_URL, VITE_GOOGLE_CLIENT_ID
npm run dev
```

### 3. Seed the Database
```bash
cd ../server
node src/seeds/seedDatabase.js
```

### 4. (Optional) Python ML Service
```bash
cd ../ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🗂️ Project Structure

```
community-hero/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/           # 14+ complete pages
│       ├── components/      # Reusable components
│       └── utils/constants.js  # Rourkela configuration
├── server/                  # Node.js + Express backend
│   └── src/
│       ├── models/          # Mongoose schemas
│       ├── routes/          # 15+ route files
│       ├── services/        # AI, flood prediction, etc.
│       └── seeds/           # 20 Rourkela issue seed data
├── ml-service/              # Python FastAPI ML service
│   └── app/
│       ├── services/        # Predictive models
│       └── api/routes.py    # ML endpoints
├── mobile/                  # React Native field officer app
└── .github/workflows/       # CI/CD pipelines
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@communityhero.in` | `Admin@1234` |
| Citizen | `rajesh@rourkela.in` | `User@1234` |
| Citizen | `priya@rourkela.in` | `User@1234` |

---

## 📊 Evaluation Criteria Alignment

| Criterion | Implementation |
|---|---|
| **Problem Solving (20%)** | Real Rourkela civic issues — waterlogging, RSP pollution, pothole tracking |
| **Agentic Depth (20%)** | Gemini AI analysis pipeline, autonomous issue routing, flood prediction agents |
| **Innovation (20%)** | Dual RMC/SAIL RSP authority routing unique to Rourkela; flood ML from real river data |
| **Google Technologies (15%)** | Gemini 1.5 Pro, Google OAuth, Google AI Studio, Maps Geocoding |
| **Product Design (10%)** | Dark theme, Framer Motion animations, interactive Mapbox map |
| **Technical Excellence (10%)** | MERN + FastAPI + Socket.io + Redis + Kafka social listening |
| **Completeness (5%)** | 14+ pages, seeded DB, mobile app, CI/CD, monitoring |

---

## 🏆 Built For

**Vibe2Ship Hackathon 2026** by Coding Ninjas × Google for Developers

> *"Every pothole reported, every streetlight fixed, every flood predicted — Community Hero makes Rourkela a smarter city, one civic report at a time."*

---

<div align="center">
Made with ❤️ in Rourkela, Odisha 🇮🇳 | &copy; 2026 Community Hero
</div>
