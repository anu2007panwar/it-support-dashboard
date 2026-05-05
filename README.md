# 🔧 IT Support Cost Optimizer — Data Analyst Project

A full-stack analytics dashboard for IT Support Cost Optimization using data analysis.

## Problem Statement
- **2 million IT support tickets/year**
- Goals: Reduce cost by 20%, improve satisfaction to 4.2+, reduce escalations, optimize engineer allocation
- Constraints: 50,000 events/sec, up to 20% missing data, predictions within 5 seconds

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- npm installed

### Step 1: Start Backend
```bash
cd backend
npm install
npm start
```
Backend runs at: http://localhost:5000

### Step 2: Start Frontend (new terminal)
```bash
cd frontend
npm install
npm start
```
Frontend runs at: http://localhost:3000

---

## 📁 Project Structure

```
it-support-dashboard/
├── backend/
│   ├── server.js          # Express API server
│   ├── dataGenerator.js   # Synthetic data engine
│   └── package.json
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js          # Main app + navigation
        ├── App.css         # Design system
        ├── pages/
        │   ├── Dashboard.jsx       # KPIs, charts, trends
        │   ├── Tickets.jsx         # Filterable ticket table
        │   ├── Predictor.jsx       # ML-style prediction + streaming
        │   └── Recommendations.jsx # Actionable insights
        └── utils/api.js    # API client
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/summary` | Dashboard KPIs |
| GET | `/api/analytics` | Full analytics data |
| GET | `/api/tickets` | Paginated + filtered tickets |
| GET | `/api/recommendations` | Actionable recommendations |
| GET | `/api/stream` | SSE live data stream |
| POST | `/api/predict` | Cost prediction (<5s) |
| POST | `/api/regenerate` | Regenerate dataset |
| GET | `/api/filters` | Available filter options |

---

## ✅ How It Addresses All Requirements

| Requirement | Implementation |
|-------------|----------------|
| Reduce cost 20% | Recommendations page shows $X savings per action |
| Satisfaction > 4.2 | KPI card + prediction flags below-target tickets |
| Reduce escalations | Top escalated categories chart + escalation reduction rec |
| Optimize engineers | Dynamic allocation recommendation |
| 50k events/sec | Stream demo in Predictor page |
| 20% missing data | Simulated + shown as "Imputed" badge in table |
| Predict within 5s | Prediction API shows response time in ms |

---

## 🛠 Tech Stack
- **Backend**: Node.js, Express, Statistical Data Generation
- **Frontend**: React 18, Recharts, CSS Variables
- **Features**: SSE Streaming, Real-time Filtering, Pagination, Prediction API
