# SignalFusion Core: Architecture & Technical Guide

## ⚓ Vision & Core Idea
**SignalFusion Core** is a next-generation "Security Fusion" platform. Unlike traditional tools that merely collect logs, SignalFusion **synthesizes** security signals into a living, breathing map of your infrastructure's health.

The core idea is simple but powerful: **Context is King.** Instead of looking at 1,000 isolated alerts, SignalFusion fuses them into meaningful **Attack Graphs** and **Chains**, allowing security analysts to see the *story* of an attack, not just the chapters.

---

## 🛠️ Technology Stack

### Backend (Security Engine)
- **Node.js & Express.js**: High-performance REST API for ingestion and triage.
- **TypeScript**: Ensuring type safety across complex security data models.
- **Prisma ORM**: Type-safe database access and schema management.
- **SQLite**: Lightweight, portable local database for event and alert storage.

### Frontend (Analyst Dashboard)
- **Next.js (v16+)**: React framework providing efficient Server Components and dynamic routing.
- **Tailwind CSS v4**: Cutting-edge styling engine using the new `@theme` architecture.
- **Lucide React**: Clean, consistent security iconography.
- **Cytoscape.js**: Optimized graph library for attack path visualization.

---

## 🏗️ Technical Architecture

### 1. Ingestion Pipeline
Logs are posted to `/api/ingest`. The **Ingestion Service** normalizes these into `UnifiedEvent` types, mapping fields like `sourceIp`, `user`, and `eventType` into a standard schema.

### 2. Detection Engine
The engine runs multiple detectors against the unified stream:
- **Geo-Velocity**: Detects "Impossible Travel" by calculating distance/time between logins.
- **FSM Chain**: A Finite State Machine that tracks multi-step attack patterns.
- **Anomalous Action**: Identifies suspicious tool execution following reconnaissance.

### 3. Data Architecture (Prisma/SQLite)
The system relies on a relational schema designed to support graph traversal and automated correlation.
- **Alert**: The primary signal unit. Contains MITRE context.
- **Event**: Low-level telemetry logs linked to Alerts via `matchedEventIds`.
- **AttackNode & AttackEdge**: Persistent representation of the graph.

---

## 📂 Project Structure

```text
SignalFusion Core/
├── backend/              # Node.js/Express Backend
│   ├── prisma/           # Database schema & migrations
│   └── src/
│       ├── config/       # Security policy configuration
│       ├── detection/    # Detection engines & orchestration
│       ├── services/     # Ingestion & normalization
│       └── simulation/   # 48 attack scenarios
├── frontend/             # Next.js App Router UI
│   ├── src/
│   │   ├── app/          # Pages (Dashboard, Alerts)
│   │   ├── components/   # Visual SOC components
│   │   └── services/     # Server Actions
├── docs/                 # Consolidated documentation
└── README.md             # Project overview
```

---

## 🌪 Why SignalFusion?

Traditional SIEMs fail due to **Alert Fatigue**, **Context Fragmentation**, and the **Response Gap**. SignalFusion bridges these gaps with:
- **Visual-First Strategy**: Showing the exact path an attacker took.
- **Safety-First Automation**: Built-in simulator for testing playbooks.
- **Extreme Performance**: Optimized backend handling thousands of graph nodes.
