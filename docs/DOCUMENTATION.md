# SignalFusion Core Technical Documentation

SignalFusion Core is a high-fidelity **Threat Signal Correlation and Alert Triage Engine** designed for modern Security Operations Centers (SOC). It bridges the gap between raw security logs and actionable alerts through sophisticated behavioral analysis and stateful correlation.

---

## 🚀 Concept & Purpose

Traditional SIEMs often overwhelm analysts with "noise" (isolated, low-context alerts). SignalFusion Core addresses this by:
1. **Normalizing Logs**: Intake from disparate sources (AWS, Okta, Endpoint) into a unified format.
2. **Behavioral Detections**: Looking for *sequences* of actions rather than single events (e.g., discovery followed by suspicious execution).
3. **Correlation & Scoring**: Grouping related detections into a single "Alert" with a dynamic risk score (0-100).
4. **Distributed Triage**: Providing a decoupled analyst interface to manage the alert lifecycle.

---

## 🛠️ Technology Stack

### Backend (Security Engine)
- **Node.js & Express.js**: High-performance REST API for ingestion and triage.
- **TypeScript**: Ensuring type safety across complex security data models.
- **Prisma ORM**: Type-safe database access and schema management.
- **SQLite**: Lightweight, portable local database for event and alert storage.

### Frontend (Analyst Dashboard)
- **Next.js (v16+)**: React framework providing efficient Server Components and dynamic routing.
- **Tailwind CSS v4**: Cutting-edge, high-performance styling engine using the new `@theme` architecture.
- **Lucide React**: Clean, consistent security iconography.
- **Date-fns**: Robust time manipulation for security timelines.

### Infrastructure & Operations
- **Docker & Docker Compose**: Containerization of both services for one-command deployment.
- **Distributed Architecture**: Separation of concerns between the ingestion/engine (port 8001) and the analyst UI (port 3000).

---

## 🏗️ Technical Architecture

### 1. Ingestion Pipeline
Logs are posted to `/api/ingest`. The **Ingestion Service** normalizes these into `UnifiedEvent` types, mapping fields like `sourceIp`, `user`, and `eventType` into a standard schema.

### 2. Detection Engine
The engine runs multiple detectors against the unified stream:
- **Geo-Velocity**: Detects "Impossible Travel" by calculating distance/time between logins.
- **FSM Chain**: A Finite State Machine that tracks multi-step attack patterns (e.g., `Failed Login` → `Success` → `Sensitive Action`).
- **Anomalous Action**: Identifies suspicious tool execution following reconnaissance commands.

### 3. Triage Workflow
The application implements a full audit trail:
- **Server Actions**: Frontend proxies triage commands to the backend.
- **Audit Logs**: Every status change (New → Triage → Closed) is recorded with a timestamp and analyst ID.
- **Note System**: Analysts can collaborate directly within the alert detail view.

### 4. Styling System (v4)
The UI uses a **Premium Dark Aesthetic**:
- **Glassmorphism**: Semi-transparent panels with backdrop blurs for a focused, modern feel.
- **Severity Visuals**: Color-coded indicators (Red for High, Amber for Medium, Blue for Low) for instant situational awareness.
- **Dynamic Highlights**: The sidebar uses `usePathname` from Next.js to provide real-time visual feedback on the analyst's location.

---

## 📦 How it is Built

The project is structured as a **distributed system**:
- **/backend**: Contains the security logic, database, and API. It is built to be a standalone, headless engine.
- **/frontend**: Contains the Next.js visual dashboard. It connects to the backend exclusively via the REST API.
- **docker-compose.yml**: Orchestrates the networking, ensuring the frontend can talk to the backend using the service name `http://backend:8001` or fallback to `localhost` in development.

---

*This document serves as the technical source of truth for SignalFusion Core.*
