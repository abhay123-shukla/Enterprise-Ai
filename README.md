# OpsPilot 🚀
### Autonomous Enterprise Operations & Service AI Copilot

[![Phase 1 Complete](https://img.shields.io/badge/Phase%201-Problem%20%26%20Solution%20Architecture%20Ready-brightgreen.svg)](#phase-1-done-when)
[![Phase 2 Complete](https://img.shields.io/badge/Phase%202-Full--Stack%20Complete-brightgreen.svg)](#phase-2-checklist)
[![Phase 3 Complete](https://img.shields.io/badge/Phase%203-AI%20Pipeline%20%26%20Security%20Complete-brightgreen.svg)](#phase-3-done-when)
[![Enterprise Ready](https://img.shields.io/badge/Enterprise-IT%20%7C%20HR%20%7C%20Finance%20%7C%20Facilities-blue.svg)](#core-departments)
[![AI Capabilities](https://img.shields.io/badge/AI%20Pipeline-8%20Stage%20Autonomous%20Engine-purple.svg)](#8-stage-ai-capabilities)

---

## 🌟 The Big Picture: What is OpsPilot?

**OpsPilot** is an end-to-end, multi-agent AI copilot designed to eliminate operational chaos in enterprises. 

When employees encounter problems across **IT, HR, Finance, Facilities, or Procurement**, their requests are currently scattered across unmonitored Slack/Teams chats, buried Outlook email threads, and manual spreadsheets. This causes:
- Manual triage bottlenecks and inaccurate routing
- Painfully slow response times and frequent SLA breaches
- Duplicate efforts across support teams
- Zero managerial visibility into emerging systemic issues

**OpsPilot transforms internal support into an autonomous, closed-loop AI engine:**
1. **Understands & Classifies** requests instantly using multi-label NLP.
2. **Extracts Structured Entities** (Asset IDs, software versions, error codes, dollar amounts).
3. **Retrieves Institutional Knowledge (RAG)** and synthesizes immediate self-service answers (deflecting ~45% of tickets).
4. **Intelligently Routes** complex issues with skill matching and SLA countdowns.
5. **Empowers Support Agents** with AI thread summaries and 1-click contextual reply drafts.
6. **Delivers Real-Time Manager Insights** on operational health, team capacity, and undocumented knowledge gaps.

---

## 🧭 Navigation & Phase 1 Deliverables

| Document | Description |
|----------|-------------|
| 📄 **[PHASE_1_SPECIFICATION.md](./PHASE_1_SPECIFICATION.md)** | **The Complete Phase 1 Specification:** Problem Definition, Solution Flows, 3 Role Journeys, Technical Architecture, and Hackathon Value Proposition. |

---

## ⚡ Problem vs. Solution Workflow

### Legacy Workflow (Broken)
```
Employee → Problem → Scattered Channels (Email/Chat/Sheets) → Manual Triage → Slow Response → Missed SLAs → Zero Visibility
```

### OpsPilot Workflow (Intelligent & Closed-Loop)
```
Employee → OpsPilot Ingestion → AI Understanding & Classification → Structured Extraction → 
RAG Knowledge Matching → Instant Deflection / Smart Routing → Agent Copilot Resolution → Manager Insights & Gap Detection
```

---

## 👥 Three Core Roles

| Role | Core Objective | Primary Workflow |
|------|----------------|------------------|
| **1. Employee** | Frictionless help & rapid resolution | `Login` → `Dashboard` → `Create Request` → `Instant AI Answer` → `Track SLA` → `Comment` → `Resolve` |
| **2. Operations Agent** | High-velocity triage & resolution | `Login` → `Smart Queue` → `Request Detail` → `AI Summary` → `Generate Reply` → `Update/Assign` → `Resolve` |
| **3. Admin / Manager** | Operational health & governance | `Login` → `Command Dashboard` → `Analytics` → `AI Insights` → `Knowledge Gap Radar` → `User Management` |

---

## 🎯 Phase 1 Evaluation Criteria ("PHASE 1 DONE WHEN")

- [x] **Problem is clearly defined** — Detailed across all 5 enterprise operational departments.
- [x] **Solution flow is clear** — Complete end-to-end diagram and 8-stage AI engine specification.
- [x] **Three roles are defined** — Employee, Operations Agent, and Admin/Manager personas and capabilities.
- [x] **User journeys are defined** — Step-by-step user interaction scenarios for each role.
- [x] **Architecture decisions are documented** — UI, API gateway, AI orchestration, data schema, and security.
- [x] **Hackathon value proposition is ready** — Quantified business ROI, competitive differentiators, and pitch script.

---

## 🎯 Phase 2 Evaluation Criteria ("PHASE 2 DONE WHEN")

- [x] **Full-Stack Application Running** — React 18 + Vite frontend and Express + Mongoose backend.
- [x] **11 Dedicated Pages & Dynamic Navigation** — Employee, Agent, and Admin command centers.
- [x] **Real-time Status Transitions & SLA Timers** — SLA countdown timers with priority-based rules.
- [x] **Seamless In-Memory / MongoDB Fallback** — Instant local execution without external database blockers.

---

## 🎯 Phase 3 Evaluation Criteria ("PHASE 3 DONE WHEN")

- [x] **Backend-Only Gemini Architecture** — Strict `React -> Express API -> AI Controller -> aiService.js -> Gemini API`. Gemini key NEVER exposed in client.
- [x] **3.1 Smart Triage** — Raw text input triaged into structured JSON (`department`, `category`, `priority`, `sentiment`, `title`, `summary`, `tags`, `suggestedDueDate`).
- [x] **3.2 Instant Answer / RAG** — Knowledge search retrieving top 3-5 articles. Low confidence fallback: `"No confident answer found. A human agent will assist you."`
- [x] **3.3 Duplicate Detection** — Keyword/Jaccard candidate filtering + AI semantic confirmation (`isDuplicate`, `duplicateOf`, `similarityScore`, `reasoning`).
- [x] **3.4 Agent Draft Reply** — Contextual, professional drafts synthesized from ticket context, comments thread, and knowledge articles.
- [x] **3.5 Thread Summarization** — Executive multi-turn thread summaries (Core Issue, Steps Taken, Next Action).
- [x] **3.6 Manager AI Insights** — 4 high-impact managerial insights + strategic operational recommendations.
- [x] **3.7 Knowledge Gap Finder** — Identifies frequent low-confidence queries and auto-drafts enterprise articles for 1-click publishing.
- [x] **3.8 Enterprise AI Security** — Input sanitization & prompt injection guardrails, Zod schema validation, temperature $\le 0.3$, 10s timeout with max 2 retries, and `AiLog` audit trail.

---

## 🎯 Phase 4 Evaluation Criteria ("PHASE 4 DONE WHEN")

[![Phase 4 Complete](https://img.shields.io/badge/Phase%204-Production%20Ready-brightgreen.svg)](#phase-4-evaluation-criteria-phase-4-done-when)
[![Security Audit](https://img.shields.io/badge/Security%20Audit-31%2F31%20Passed-blue.svg)](#47-security-test)
[![End-to-End Flow](https://img.shields.io/badge/E2E%20Test-38%2F38%20Passed-purple.svg)](#411-final-end-to-end-test)

- [x] **4.1 Responsive UI** — Validated on Desktop ($>1280\text{px}$), Laptop ($1024\text{px}-1280\text{px}$), Tablet ($\le 1024\text{px}$), and Mobile ($\le 768\text{px}$) with collapsible mobile navigation.
- [x] **4.2 Loading States** — Skeleton shimmer cards and tables (`SkeletonCard`, `SkeletonTable`) on every API request.
- [x] **4.3 Error States** — Non-blocking error panels with explicit `[Try Again]` retry handlers.
- [x] **4.4 Empty States** — Context-aware empty state components with action buttons (`No requests found. Create your first request →`).
- [x] **4.5 Toast Notifications** — Floating user feedback alerts (`✓ Request created`, `✓ Request assigned`, `✓ Article saved`, `✓ User role updated`, `✕ Something went wrong`).
- [x] **4.6 Role-Based Navigation** — Strict 3-tier navigation matrix for Employee, Agent, and Admin roles.
- [x] **4.7 Security Hardening (31/31 Automated Tests Passed)** — Verified JWT, bcrypt, Zod, CORS, Helmet headers, Rate Limiting, RBAC authorization, and environment variable isolation (`npm run test:security`).
- [x] **4.8 MongoDB Atlas & 4.9 Backend Deployment** — Render deployment configuration (`opspilot/server/render.yaml`) with `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`, `NODE_ENV`.
- [x] **4.10 Frontend Deployment** — Vercel SPA configuration (`opspilot/client/vercel.json`) with SPA rewrite rules and `VITE_API_URL` environment variable.
- [x] **4.11 Final End-to-End Test (38/38 Automated Tests Passed)** — Verified the complete 13-stage lifecycle (`npm run test:e2e`):
  `REGISTER → LOGIN → DASHBOARD → NEW REQUEST → AI TRIAGE → INSTANT ANSWER → AGENT QUEUE → REQUEST DETAIL → AI DRAFT → AGENT RESPONSE → RESOLVE → ANALYTICS → AI INSIGHTS`.


