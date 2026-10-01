# OpsPilot: Enterprise AI Service Operations Copilot
## Phase 2: Full-Stack Application Implementation Guide & API Reference

[![Phase 2 Complete](https://img.shields.io/badge/Phase%202-Full--Stack%20Complete-brightgreen.svg)](#phase-2-checklist)
[![Node.js](https://img.shields.io/badge/Node.js-v20.18-green.svg)](https://nodejs.org/)
[![React + Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Recharts-blue.svg)](http://localhost:5173)
[![Express API](https://img.shields.io/badge/Backend-Express%20%2B%20Mongoose-purple.svg)](http://localhost:5000)

---

## 🏗️ Architecture & Directory Layout

```
opspilot/
├── client/                     # Frontend Application (React 18 + Vite + Recharts)
│   ├── src/
│   │   ├── components/         # Navbar, Badges (Status, Priority, Role, Department, SlaTimer)
│   │   ├── context/            # AuthContext (JWT state, 1-click role switcher)
│   │   ├── pages/              # 11 Dedicated Pages
│   │   │   ├── Login.jsx       # /login (1-click test credentials)
│   │   │   ├── Register.jsx    # /register (Zod validated, role presets)
│   │   │   ├── Dashboard.jsx   # /dashboard (Metrics, welcome, recent requests)
│   │   │   ├── NewRequest.jsx  # /new-request (Real-time AI triage & instant deflection)
│   │   │   ├── MyRequests.jsx  # /my-requests (Search, filter, pagination, employee scope)
│   │   │   ├── RequestDetail.jsx # /requests/:id (AI summary, 1-click draft reply, comments)
│   │   │   ├── AgentQueue.jsx  # /agent-queue (Dept filter, Priority/SLA sort, assign)
│   │   │   ├── KnowledgeBase.jsx # /knowledge (Search, view, create, edit, delete)
│   │   │   ├── Analytics.jsx   # /analytics (Recharts department, status, priority, 30d trend)
│   │   │   ├── AdminUsers.jsx  # /admin/users (Directory, role modification via PATCH)
│   │   │   └── NotFound.jsx    # /* (404 Page with Dashboard redirect)
│   │   ├── services/           # API fetch client with Bearer auth token injection
│   │   ├── App.jsx             # React router & role-based protected route guards
│   │   ├── index.css           # Modern Enterprise Dark theme with glassmorphism
│   │   └── main.jsx
│   ├── vite.config.js          # Vite config with /api and /health reverse proxies
│   └── package.json
│
├── server/                     # Backend Application (Express + Mongoose + AI Engine)
│   ├── src/
│   │   ├── config/             # env.js, db.js (MongoDB + seamless in-memory fallback)
│   │   ├── models/             # User, Request, Comment, KnowledgeArticle, AiLog, store.js
│   │   ├── routes/             # auth, request, comment, knowledge, analytics, user routes
│   │   ├── controllers/        # auth, request, comment, knowledge, analytics, user controllers
│   │   ├── middleware/         # auth (verifyAuth, requireRole), validate (Zod), errorHandler
│   │   ├── services/           # ai.service.js (triage, suggest deflection, summarize, draft)
│   │   ├── validators/         # auth, request, knowledge Zod schemas
│   │   ├── utils/              # jwt, bcrypt, seed.js (pre-populated enterprise data)
│   │   ├── app.js              # Express app with /health and API routing
│   │   └── server.js           # Server bootstrap
│   └── package.json
│
├── README.md                   # This documentation
└── .gitignore
```

---

## ⚡ Quick Start & Running Locally

### 1. Backend Server (`http://localhost:5000`)
```powershell
cd opspilot/server
npm run start
```
* Health check: `GET http://localhost:5000/health` → `{"status": "ok", "service": "OpsPilot Enterprise AI API"}`

### 2. Frontend Client (`http://localhost:5173`)
```powershell
cd opspilot/client
npm run dev
```

---

## 🔑 Pre-Seeded Demo Credentials (Judges / Evaluation)

For fast evaluation, the application includes a **Top Demo Switcher Bar** and **1-Click Login buttons**:

| Persona | Role | Email | Password |
|---------|------|-------|----------|
| **Alex Morgan** | `employee` | `employee@opspilot.com` | `password123` |
| **Marcus Reed** | `agent` | `agent@opspilot.com` | `password123` |
| **Sarah Chen** | `admin` | `admin@opspilot.com` | `password123` |

---

## 📡 API Endpoints Reference

### Health & Auth
* `GET  /health` - System health check (`{"status": "ok"}`)
* `POST /api/auth/register` - Zod validated registration
* `POST /api/auth/login` - Authenticate & obtain JWT
* `GET  /api/auth/me` - Authenticated user profile

### Requests & AI Copilot
* `POST /api/requests` - Ingest request, trigger AI triage & RAG deflection search
* `GET  /api/requests/my` - Employee requests (filtered, paginated)
* `GET  /api/requests` - Agent/Admin queue (sorted by priority or SLA)
* `GET  /api/requests/:id` - Ticket details with comments & AI metadata
* `PATCH /api/requests/:id` - Update status, priority, department, category
* `POST /api/requests/:id/assign` - Assign to agent
* `POST /api/requests/:id/draft-reply` - AI generates contextual draft reply
* `POST /api/requests/:id/summarize` - AI summarizes multi-turn thread

### AI Operations Engine (Phase 3: Backend-Only AI Pipeline)
* `POST /api/ai/triage` - 3.1 Smart Triage (department, category, priority, sentiment, title, summary, tags, suggestedDueDate)
* `POST /api/ai/instant-answer` - 3.2 Instant Answer / RAG with Low Confidence Deflection
* `POST /api/ai/duplicate-check` - 3.3 Semantic Duplicate Detection
* `POST /api/ai/draft-reply` - 3.4 Agent Draft Reply
* `POST /api/ai/summarize` - 3.5 Thread Summarization
* `GET  /api/ai/manager-insights` - 3.6 Manager AI Insights (Insight 1-4 + Recommendations)
* `GET  /api/ai/knowledge-gaps` - 3.7 Knowledge Gap Radar & Auto-Article Drafting
* `GET  /api/ai/logs` - 3.8 AI Transparency Logs (tokens, latency, status, model)

### Comments
* `GET  /api/comments/:requestId` - List discussion thread
* `POST /api/comments/:requestId` - Post comment

### Knowledge Base
* `GET    /api/knowledge` - Search & filter knowledge articles
* `GET    /api/knowledge/:id` - View article & increment view counter
* `POST   /api/knowledge` - Create article (Agent/Admin)
* `PATCH  /api/knowledge/:id` - Update article (Agent/Admin)
* `DELETE /api/knowledge/:id` - Delete article (Agent/Admin)

### Analytics & User Governance
* `GET   /api/analytics` - Aggregated stats, department/status/priority breakdowns, 30-day velocity
* `GET   /api/users` - Admin user directory
* `PATCH /api/users/:id/role` - Admin updates user role (`employee`, `agent`, `admin`)

---

## 🧠 Phase 3: AI Pipeline Architecture & Security Specifications

### 1. Judge Architecture Compliance
```
React Client
    ↓ (Bearer JWT, NO API keys in frontend)
Express API
    ↓
AI Controller (server/src/controllers/ai.controller.js)
    ↓
aiService.js (Provider-agnostic interface)
    ↓
Gemini Provider (JSON Mode: responseMimeType="application/json", Temp=0.2)
    ↓
Gemini 1.5 Flash API (API Key stored strictly in server/.env)
```
> ⚠️ **Strict Constraint**: React NEVER calls the Gemini API directly. `GEMINI_API_KEY` is loaded exclusively from backend `.env`.

### 2. The 8 AI Capabilities Implemented
* **3.1 Smart Triage**: Natural language extraction producing structured JSON: `department`, `category`, `priority`, `sentiment`, `title`, `summary`, `tags`, and `suggestedDueDate`.
* **3.2 Instant Answer / RAG**: Searches Knowledge Base for top 3-5 articles and grounds response strictly in context. If confidence is low: `"No confident answer found. A human agent will assist you."`
* **3.3 Duplicate Detection**: Jaccard similarity candidate pre-filtering + AI semantic verification to detect and link duplicate tickets.
* **3.4 Agent Draft Reply**: Synthesizes request context, conversation thread, and enterprise knowledge into professional, editable drafts.
* **3.5 Thread Summarization**: Condenses multi-turn discussion into a high-density executive snapshot (Core Issue, Steps Taken, Next Action).
* **3.6 Manager AI Insights**: Analyzes volume, resolution times, SLA breaches, and trends into 4 core insights + strategic recommendations.
* **3.7 Knowledge Gap Finder**: Automatically flags recurring employee queries with low deflection confidence and drafts ready-to-publish articles.
* **3.8 AI Security**: Input sanitization against prompt injection, Zod schema response validation, temperature $\le 0.3$, 10s timeout with max 2 retries, and comprehensive `AiLog` audit trail.

### 3. Automated Test Verification
Run the comprehensive Phase 3 test suite:
```powershell
cd opspilot/server
node test-ai-pipeline.js
# Output: TOTAL TESTS: 8 | PASSED: 8 | FAILED: 0
```

---

## 🚀 Phase 4: Production & Demo Readiness

[![Phase 4 Complete](https://img.shields.io/badge/Phase%204-Production%20Ready-brightgreen.svg)](#phase-4-production--demo-readiness)
[![Security Audit](https://img.shields.io/badge/Security%20Audit-31%2F31%20Passed-blue.svg)](#47-security-test)
[![End-to-End Test](https://img.shields.io/badge/E2E%20Flow-38%2F38%20Passed-purple.svg)](#411-final-end-to-end-test)

### 4.1 Responsive UI
* Tested across breakpoints:
  * **Desktop**: Full multi-column analytical and queue layouts ($> 1280\text{px}$)
  * **Laptop**: Flexible grid panels with adaptive chart widths ($1024\text{px} - 1280\text{px}$)
  * **Tablet**: Stacked card layouts, responsive modal dialogs ($\le 1024\text{px}$)
  * **Mobile**: Collapsible hamburger navigation drawer, touch-friendly action targets ($\le 768\text{px}$)

### 4.2 Loading States
* Every page and API call features modern glassmorphism skeleton loaders:
  * `SkeletonCard`: Used for metric summaries, AI insight cards, and article grids.
  * `SkeletonTable`: Used for Agent Queue, My Requests, Dashboard, and Users directory.
  * Shimmer animation keyframes (`@keyframes skeleton-shimmer`) prevent layout shift.

### 4.3 Error States
* Standardized, non-blocking error panels with explicit retry mechanisms:
  * `Unable to load requests. [Try Again]`
  * `Unable to load knowledge base articles. [Try Again]`
  * `Unable to load analytics. [Try Again]`
  * `Unable to load users. [Try Again]`

### 4.4 Empty States
* Context-aware empty state components with direct action triggers:
  * `"No requests found. Create your first request →"`
  * `"No articles found. Create your first article →"`
  * Direct deep links guiding users to submit tickets or author runbooks.

### 4.5 Toast Notifications
* Global toast notification system (`ToastProvider`, `useToast`):
  * `✓ Request created`
  * `✓ Request assigned`
  * `✓ Article saved`
  * `✓ User role updated`
  * `✕ Something went wrong`

### 4.6 Role-Based Navigation
* Navigation menus strictly partitioned according to persona permissions:
  * **Employee**: Dashboard, New Request, My Requests, Knowledge Base
  * **Agent**: Dashboard, Agent Queue, My Requests, Knowledge Base
  * **Admin**: Dashboard, Analytics, Knowledge Base, Users

### 4.7 Security Hardening Audit
* Automated audit script: `npm run test:security` in `opspilot/server`
* **Verified Security Controls (31/31 Passed)**:
  1. **JWT**: Signed with backend secret, verified via HMAC SHA-256, rejects tampered/expired tokens.
  2. **bcrypt**: Password salted and hashed with 10 rounds; plaintext never stored.
  3. **Zod**: Strict request payload schema validation on all inputs; malformed inputs return 400 Bad Request.
  4. **CORS**: Enforces `Access-Control-Allow-Origin` for authorized clients.
  5. **Helmet**: Injects security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-DNS-Prefetch-Control: off`, `X-Download-Options: noopen`, `X-Permitted-Cross-Domain-Policies: none`).
  6. **Rate Limiting**: Enforces rate limiting on global API routes (600 req/15m) and authentication endpoints (80 req/15m).
  7. **Authorization**: RBAC enforced via `verifyAuth` and `requireRole('agent', 'admin')`; 401 unauthenticated, 403 unauthorized.
  8. **Environment Variables**: `GEMINI_API_KEY`, `JWT_SECRET`, `MONGO_URI`, and credentials never leaked or exposed to frontend.

### 4.8 MongoDB Atlas & 4.9 Backend Deployment (Render)
* **Configuration**: `opspilot/server/render.yaml`
* **Target**: Render Web Service (Node.js runtime)
* **Required Environment Variables**:
  * `PORT`: `5000`
  * `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/opspilot?retryWrites=true&w=majority`
  * `JWT_SECRET`: High-entropy enterprise signing key
  * `GEMINI_API_KEY`: Server-side Gemini 1.5 Flash API Key
  * `CLIENT_URL`: `https://opspilot-app.vercel.app`
  * `NODE_ENV`: `production`
* Seamless fallback: If an external Atlas cluster is unreachable or offline, the server shifts automatically to its high-performance in-memory database without downtime.

### 4.10 Frontend Deployment (Vercel)
* **Configuration**: `opspilot/client/vercel.json`
* **Target**: Vercel Static/SPA Build
* **Build Command**: `vite build`
* **Output Directory**: `dist`
* **Rewrites**: `[{"source": "/(.*)", "destination": "/index.html"}]`
* **Environment Variable**: `VITE_API_URL` pointing to the Render backend URL.

### 4.11 Final End-to-End Test
* Automated test command: `npm run test:e2e` in `opspilot/server`
* Verifies the complete 13-stage lifecycle (**38/38 Passed**):
```
REGISTER
   ↓
LOGIN
   ↓
DASHBOARD
   ↓
NEW REQUEST
   ↓
AI TRIAGE
   ↓
INSTANT ANSWER
   ↓
AGENT QUEUE
   ↓
REQUEST DETAIL
   ↓
AI DRAFT
   ↓
AGENT RESPONSE
   ↓
RESOLVE
   ↓
ANALYTICS
   ↓
AI INSIGHTS
```
All criteria for Phase 4: Production & Demo Readiness are verified and production-ready.

