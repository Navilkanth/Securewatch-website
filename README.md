# 🛡️ SecureWatch - Civic & Enterprise Security Operations Center (SOC)
https://securewatch-website.vercel.app/
SecureWatch is a full-stack, enterprise-grade Security Operations Center (SOC) dashboard built to monitor, analyze, and investigate civic and enterprise audit logs, security events, and threat alerts in real time.

---

## 🚀 Features

- **📊 Interactive Security Dashboard:** Real-time KPIs, severity distribution bar charts, regional threat heatmaps, action breakdown donut charts, and recent activity monitoring.
- **🚨 Global Live Threat Ticker:** Infinite horizontal scrolling ticker running at the top of every page displaying real-time critical & high-severity threat alerts with dynamic speed and theme-adaptive contrast.
- **🔍 Advanced Audit Log Explorer:** High-performance search, filtering (severity, status, role, region, action), multi-column sorting, and pagination with immediate URL sync.
- **📄 Data Export:** One-click full dataset exports to both CSV and formatted PDF reports.
- **📈 Deep Security Analytics:** Event timeline trends, top suspicious IP identification, actor activity rankings, and regional risk mapping.
- **🌗 Theme Intelligence:** Flawless Dark Mode and Light Mode support across all UI elements, charts, tables, and banners.
- **⚡ Automatic Data Seeding:** Automatic fallback in-memory database and auto-seeding mechanism for zero-config instant setup.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS v4 with custom dark/light variant tokens (`@custom-variant`)
- **State & Data Fetching:** React Query (`@tanstack/react-query`) with automatic polling (30s intervals)
- **Animations:** Framer Motion for marquee tickers and micro-interactions
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB (Mongoose ODM) with optional `mongodb-memory-server` automatic fallback
- **Search & Aggregation:** MongoDB Aggregation Pipeline with case-insensitive Regex filtering
- **Utilities:** `dotenv`, `cors`, `morgan`

---

## 📋 Setup & Installation Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB server or a MongoDB Atlas cloud connection URI.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Navilkanth/Securewatch-website.git
cd Securewatch-website
```

### Step 2: Install Dependencies
Install dependencies for both the root workspace, server, and client:

```bash
# Install root dependencies
npm install

# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

---

### Step 3: Environment Configuration
Create a `.env` file in the `server` directory (or edit `server/.env`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.czt07el.mongodb.net/securewatch?appName=Cluster0
NODE_ENV=development
```

> **Note:** If no `MONGODB_URI` is provided or local MongoDB is unavailable, the application automatically falls back to an **in-memory MongoDB instance** (`mongodb-memory-server`) so you can run the app with zero database setup!

---

### Step 4: Data Seeding (Optional)
The server automatically detects if the database is empty on launch and seeds 500 sample security log records. To manually seed a custom number of records (e.g., 1,000 logs):

```bash
npm run seed --prefix server 1000
```

---

### Step 5: Run the Full-Stack Application
Start both the Express backend and Vite frontend concurrently with a single command:

```bash
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:5000`

---

## 🧠 Architectural & Technical Decisions

### 1. In-Memory Database Fallback (`mongodb-memory-server`)
- **Decision:** Integrated `mongodb-memory-server` into `server/src/config/db.js`.
- **Rationale:** Developer experience (DX) and reviewer evaluation ease. If a reviewer or client cloned the repo without a local MongoDB service running, standard connection logic would crash with `ECONNREFUSED`. The fallback guarantees the app runs instantly out of the box.

### 2. Intelligent Auto-Seeding Pipeline
- **Decision:** Refactored `seed.js` into an exported module and hooked it into the server startup sequence in `index.js`.
- **Rationale:** Ensures that fresh environments immediately display realistic security data without requiring manual CLI seed execution.

### 3. Server-Side MongoDB Aggregation Pipelines
- **Decision:** Built filtering, sorting (`queryBuilder.js`), and pagination using MongoDB Native Aggregation (`Log.aggregate`).
- **Rationale:** Traditional in-memory JavaScript filtering scales poorly. Aggregation pipelines process thousands of audit records directly within the database engine, returning exact paginated slices (`$skip` / `$limit`) alongside exact matching counts (`$count`).

### 4. Theme-Adaptive CSS & Dual Variant Tokens
- **Decision:** Implemented custom Tailwind v4 `@custom-variant light (&:where(.light, .light *));` in `index.css`.
- **Rationale:** Standard Tailwind dark mode (`dark:`) assumes light mode is default. For a SOC dashboard where dark mode is primary, inverse variant scoping (`light:`) ensured that dark mode remains crisp and vibrant while light mode receives tailored high-contrast text styling (`#0f172a`, `#1e293b`).

### 5. Global Real-Time Threat Ticker Architecture
- **Decision:** Created `LiveAlertTicker.jsx` mounted in `Layout.jsx` powered by Framer Motion infinite linear translation (`x: ['0%', '-33.33%']`).
- **Rationale:** Placed above the Navbar globally rather than inside individual pages. Moved gradient fade masks inside the scroll-track container (`left-0` / `right-0`) with relative z-indexes (`z-20` on static sidebars, `z-10` on track) to eliminate pixel-based overflow bugs across various screen widths and themes.

### 6. Debounced URL State Synchronization
- **Decision:** Integrated custom `useDebounce` hook for audit log search inputs, syncing query parameters directly into React Router `useSearchParams`.
- **Rationale:** Prevents API spamming on keypresses while ensuring search states are bookmarkable and shareable via URL parameters.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
