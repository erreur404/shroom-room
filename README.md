# 🍄 Shroom Room — Interactive Mushroom Habitat & Fruiting Prediction Engine

An interactive geospatial application predicting mushroom habitat suitability and seasonal fruiting emergence across Europe (including *Boletus edulis* and *Cantharellus cibarius*).

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

---

## 💻 Running the Application

### Option A: Run Both Together (Recommended)
Runs both the Vite frontend (`http://localhost:5173`) and the Tile Baker backend (`http://localhost:3001`) simultaneously in a single terminal:

```bash
npm run dev:all
```

---

### Option B: Run in Separate Terminals

#### Terminal 1 — Backend Tile Baker Server (Port 3002)
```bash
npm run dev:server
```
*Accessible at `http://localhost:3001` (Health check: `http://localhost:3001/api/health`)*

#### Terminal 2 — Frontend Web App (Port 5173)
```bash
npm run dev:frontend
```
*(Also accessible via `npm run dev`)*

---

### Production Deployment & Execution

#### Build for production
```bash
npm run prod:build
```

#### Run pure JS production server
```bash
npm run prod:start
# or
npm start
```

---

## 🛠️ Technology Stack & Services

- **Frontend**: Vite, TypeScript, Leaflet.js (OpenTopoMap, CyclOSM, OSM Standard)
- **Backend**: Express, TypeScript, Node.js (`server/index.ts`)
- **Data Integrations**:
  - **ISRIC SoilGrids v2.0**: Topsoil pH (`phh2o`), sand/clay ratios, and soil organic carbon (SOC)
  - **OpenStreetMap Overpass API**: Forest boundary and woodland landcover classification
  - **Open-Meteo API**: Live 14-day cumulative precipitation and 0–10cm soil temperature shock triggers
  - **ForestPaths 10m**: Mycorrhizal host tree classification (Spruce, Pine, Beech, Oak)
