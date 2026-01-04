# SignalFusion Core: Comprehensive Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Requirements](#requirements)
4. [Installation & Setup](#installation--setup)
5. [How It Works](#how-it-works)
6. [Usage Guide](#usage-guide)
7. [Configuration](#configuration)
8. [Detection Logic](#detection-logic)
9. [API Reference](#api-reference)
10. [Development Guide](#development-guide)
11. [Troubleshooting](#troubleshooting)

---

## Overview

**SignalFusion Core** is a high-fidelity Threat Signal Correlation and Alert Triage Engine designed for Security Operations Centers (SOCs). It transforms raw security logs from multiple sources into actionable, context-rich alerts with MITRE ATT&CK mapping and integrated response workflows.

### Key Features
- **Multi-Source Ingestion**: Normalizes logs from Auth, Endpoint, Network, and Cloud sources
- **Advanced Detection**: 4 specialized detectors (Geo-Velocity, FSM Chain, Anomalous Action, Threat Intel)
- **MITRE ATT&CK Mapping**: Strategic context for every alert
- **Attack Path Visualization**: Causative timeline reconstruction
- **Response Orchestration**: Interactive remediation terminal
- **Threat Landscape Dashboard**: Real-time tactical distribution

### Philosophy
**Alert Quality over Alert Quantity** - Focus on high-fidelity, correlated signals rather than noisy individual events.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  - Dashboard: Stats, Threat Landscape, Alert Feed          │
│  - Alert Detail: Attack Path, MITRE Context, Remediation   │
│  - Port: 3000                                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                  Backend (Express.js)                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Ingestion Service                                  │    │
│  │  - Source Adapters (Auth/Endpoint/Network/Cloud)   │    │
│  │  - Normalization to UnifiedEvent                   │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                             │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │ Detection Engine                                   │    │
│  │  - Geo-Velocity Detector                           │    │
│  │  - FSM Chain Detector                              │    │
│  │  - Anomalous Action Detector                       │    │
│  │  - Threat Intel Detector                           │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                             │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │ Alert Scoring & Persistence                        │    │
│  │  - Dimensional Risk Scoring                        │    │
│  │  - MITRE Enrichment                                │    │
│  │  - Prisma ORM → SQLite                             │    │
│  └────────────────────────────────────────────────────┘    │
│  - Port: 8001                                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Node.js 20+
- Express.js 5.x
- TypeScript 5.x
- Prisma ORM 6.x
- SQLite (database)

**Frontend:**
- Next.js 16.x (App Router)
- React 19.x
- Tailwind CSS v4
- Lucide Icons

---

## Requirements

### System Requirements
- **OS**: macOS, Linux, or Windows (WSL2)
- **Node.js**: v20.x or higher
- **npm**: v9.x or higher
- **Memory**: 2GB RAM minimum
- **Disk**: 500MB free space

### Development Tools (Optional)
- **VS Code** or any TypeScript-compatible IDE
- **Postman** or **curl** for API testing
- **Docker** (if using containerized deployment)

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "SignalFusion Core"
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Initialize database
npx prisma db push
npx prisma generate

# Start backend server
npx tsx src/server.ts
```

The backend will start on `http://localhost:8001`

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Verify Installation
```bash
# Test backend health
curl http://localhost:8001/health

# Open browser
open http://localhost:3000
```

---

## How It Works

### Data Flow

#### 1. **Ingestion Phase**
Raw logs from various sources are sent to `/api/ingest`:

```typescript
// Example: Auth log
POST /api/ingest
{
  "source": "auth",
  "data": {
    "timestamp": "2026-01-03T10:00:00Z",
    "user": "alice.w",
    "source_ip": "192.168.1.100",
    "result": "SUCCESS",
    "geo_location": "USA"
  }
}
```

**Source Adapters** normalize this into a `UnifiedEvent`:
```typescript
{
  id: "uuid",
  timestamp: Date,
  source: "auth",
  eventType: "LOGIN_SUCCESS",
  actor: { user: "alice.w" },
  network: { sourceIp: "192.168.1.100", geo: "USA" },
  metadata: { _raw: {...} }  // Lossless storage
}
```

#### 2. **Detection Phase**
The Detection Engine runs all registered detectors on the event stream:

**Geo-Velocity Detector:**
- Detects impossible travel (e.g., USA → Japan in 10 minutes)
- Calculates velocity: `distance / time`
- Threshold: 800 km/h (configurable via `SecurityPolicy`)

**FSM Chain Detector:**
- Tracks state transitions: `FAILED_LOGIN → SUCCESS_LOGIN → SENSITIVE_ACTION`
- Uses Finite State Machine logic
- Detects account takeover patterns

**Anomalous Action Detector:**
- Identifies discovery tools (`whoami`, `net user`) followed by suspicious processes
- Time-window based correlation

**Threat Intel Detector:**
- Matches against known malicious IPs and processes
- Configurable IOC lists in `SecurityPolicy`

#### 3. **Alert Creation**
Detections are scored using **Dimensional Risk Scoring**:

```typescript
authRisk = hasAuthSignal ? confidence * 40 : 0
behaviorRisk = hasBehaviorSignal ? confidence * 50 : 0
intelRisk = hasIntelSignal ? confidence * 20 : 0

finalScore = min(100, authRisk + behaviorRisk + intelRisk)

severity = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low"
```

**MITRE Enrichment:**
- Each detector provides `mitreTactics` and `mitreTechniques`
- Example: `["Initial Access"]`, `["T1078 - Valid Accounts"]`

**Dynamic Remediation:**
- Recommendations generated based on detected tactics
- Example: If `Persistence` detected → "Reset user credentials immediately"

#### 4. **Visualization & Response**
Alerts are displayed in the UI with:
- **Attack Path Reconstruction**: Visual timeline of attack stages
- **MITRE Context**: Tactics and techniques highlighted
- **Response Terminal**: One-click remediation actions

---

## Usage Guide

### Running Attack Simulations

#### Via UI (Recommended)
1. Navigate to `http://localhost:3000`
2. Click **"Run Attack Simulation"** in the Simulator Control widget
3. View generated alerts in the Alert Feed

#### Via API
```bash
# Reset database (clean slate)
curl -X DELETE http://localhost:8001/api/reset

# Run simulation
curl -X POST http://localhost:8001/api/simulation/run
```

### Analyzing Alerts

#### 1. Dashboard View
- **Threat Landscape**: Shows active MITRE tactics distribution
- **Alert Feed**: Real-time list of alerts
- **Stats**: Total alerts, high severity count, triage status

#### 2. Alert Detail View
Click any alert to see:
- **Attack Path Reconstruction**: Visual stages (Initial Access → Discovery → Persistence → Exfiltration)
- **MITRE Tactics/Techniques**: Strategic context
- **Correlated Signal Timeline**: Event-by-event breakdown
- **Response Orchestration**: Execute remediation actions

### Executing Remediation

1. Open an alert detail page
2. Scroll to **Response Orchestration** terminal
3. Click **Execute** on any recommended action
4. Action is logged to audit trail (simulated execution)

### Triage Workflow

1. Change alert status: `New → Triage → In Progress → Closed`
2. Add analyst notes
3. Review audit logs for all status changes

---

## Configuration

### Security Policy (`backend/src/config/policy.ts`)

Centralized configuration for detection thresholds:

```typescript
export const SecurityPolicy = {
  geoVelocity: {
    maxKmPerHour: 800,  // Impossible travel threshold
    minConfidence: 0.9
  },
  
  threatIntel: {
    maliciousIps: [
      "99.88.77.66",    // Add your IOCs here
      "45.33.22.11"
    ],
    suspiciousProcesses: [
      "mimikatz.exe",
      "psexec.exe"
    ]
  },
  
  fsmChain: {
    sensitiveSources: ["cloud", "endpoint"],
    maxChainTimeGapMs: 1800000  // 30 minutes
  }
};
```

### Environment Variables

**Backend** (`.env`):
```bash
DATABASE_URL="file:./dev.db"
PORT=8001
```

**Frontend** (`.env`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

---

## Detection Logic

### Geo-Velocity Detector

**Purpose**: Detect impossible travel patterns

**Algorithm**:
```typescript
for each user:
  for consecutive login events:
    distance = haversine(geo1, geo2)
    timeDiff = timestamp2 - timestamp1
    velocity = distance / timeDiff
    
    if velocity > 800 km/h:
      create detection
```

**MITRE Mapping**: Initial Access, Credential Access (T1078)

### FSM Chain Detector

**Purpose**: Track multi-step attack chains

**State Machine**:
```
START → FAILED_LOGIN → SUCCESS_LOGIN → SENSITIVE_ACTION → ALERT
```

**MITRE Mapping**: Persistence, Privilege Escalation (T1078, T1548)

### Anomalous Action Detector

**Purpose**: Detect discovery followed by exploitation

**Pattern**:
```
Discovery Process (whoami, net user) 
  → 
Suspicious Process (powershell -enc, psexec)
```

**MITRE Mapping**: Discovery, Execution (T1087, T1059)

### Threat Intel Detector

**Purpose**: Match against known IOCs

**Logic**:
```typescript
if (event.sourceIp in maliciousIps OR 
    event.process in suspiciousProcesses):
  create high-confidence detection
```

**MITRE Mapping**: Command and Control, Initial Access (T1071, T1190)

---

## API Reference

### Ingestion

**POST** `/api/ingest`
```json
{
  "source": "auth|endpoint|network|cloud",
  "data": {
    // Source-specific fields
  }
}
```

### Alerts

**GET** `/api/alerts` - List all alerts

**GET** `/api/alerts/:id` - Get alert details

**PATCH** `/api/alerts/:id/status` - Update alert status
```json
{
  "status": "New|Triage|In Progress|Closed",
  "user": "analyst-name"
}
```

**POST** `/api/alerts/:id/notes` - Add analyst note
```json
{
  "content": "Note text",
  "user": "analyst-name"
}
```

**POST** `/api/alerts/:id/remediate` - Execute remediation
```json
{
  "action": "Reset user credentials",
  "user": "analyst-name"
}
```

### System

**GET** `/api/stats` - Dashboard statistics

**GET** `/api/analytics` - MITRE distribution, top detectors

**POST** `/api/simulation/run` - Run attack simulation

**DELETE** `/api/reset` - Clear database

---

## Development Guide

### Adding a New Detector

1. **Create detector file**: `backend/src/detection/detectors/myDetector.ts`

```typescript
import { UnifiedEvent, Detector, Detection } from "../../types";

export class MyDetector implements Detector {
  name = "My Custom Detector";
  description = "Detects X pattern";

  run(events: UnifiedEvent[]): Detection[] {
    const detections: Detection[] = [];
    
    // Your detection logic here
    
    return detections;
  }
}
```

2. **Register in engine**: `backend/src/detection/engine.ts`

```typescript
import { MyDetector } from "./detectors/myDetector";

constructor() {
  this.registerDetector(new MyDetector());
}
```

### Adding a New Source Adapter

1. **Create adapter**: `backend/src/services/adapters/myAdapter.ts`

```typescript
import { SourceAdapter } from "./base";

export class MyAdapter extends SourceAdapter {
  normalize(rawLog: any): UnifiedEvent {
    return this.createBaseEvent(rawLog, "my-source", {
      eventType: this.mapEventType(rawLog),
      actor: { user: rawLog.user },
      // ... map other fields
    });
  }
}
```

2. **Register in ingestion service**: `backend/src/services/ingestion.ts`

### Database Schema Changes

```bash
# Edit schema
vim backend/prisma/schema.prisma

# Apply changes
cd backend
npx prisma db push
npx prisma generate
```

---

## Troubleshooting

### Backend won't start
```bash
# Check port availability
lsof -i :8001

# Regenerate Prisma client
cd backend
npx prisma generate
```

### Frontend build errors
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### No alerts generated
1. Check backend logs for detection errors
2. Verify events are being ingested: `curl http://localhost:8001/api/stats`
3. Run simulation: `curl -X POST http://localhost:8001/api/simulation/run`

### Database locked
```bash
# Reset database
cd backend
rm -f prisma/dev.db
npx prisma db push
```

### Alert detail page 404
- Ensure you're using Next.js 15+ compatible params handling
- Check `AlertDetailPage` uses `await params`

---

## Project Structure

```
SignalFusion Core/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── policy.ts          # Security policy config
│   │   ├── detection/
│   │   │   ├── detectors/         # All detector implementations
│   │   │   └── engine.ts          # Detection orchestration
│   │   ├── services/
│   │   │   ├── adapters/          # Source normalization
│   │   │   ├── ingestion.ts       # Log ingestion
│   │   │   └── simulation.ts      # Attack simulation
│   │   ├── lib/
│   │   │   └── db.ts              # Prisma client
│   │   ├── types.ts               # TypeScript interfaces
│   │   └── server.ts              # Express app
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Dashboard
│   │   │   └── alerts/[id]/page.tsx  # Alert detail
│   │   ├── components/
│   │   │   ├── AlertFeed.tsx
│   │   │   ├── RemediationTerminal.tsx
│   │   │   ├── SimulatorControl.tsx
│   │   │   └── TriageControls.tsx
│   │   └── lib/
│   │       └── api.ts             # API utilities
│   └── package.json
│
├── DOCUMENTATION.md               # Original docs
├── DEEP_DIVE.md                   # Technical deep dive
├── LOGIC_IMPLEMENTATION.md        # Algorithm details
└── COMPREHENSIVE_GUIDE.md         # This file
```

---

## Performance Considerations

- **Event Volume**: Designed for demo/training (< 10k events)
- **Detection Latency**: Synchronous (< 100ms per event)
- **Database**: SQLite suitable for single-instance deployment
- **Scaling**: For production, migrate to PostgreSQL + Redis

## Security Notes

- **Remediation**: Currently simulated (logged only)
- **Authentication**: Not implemented (demo platform)
- **API Security**: No rate limiting or auth
- **Production Deployment**: Requires hardening

---

## License & Credits

**SignalFusion Core** - High-Fidelity Threat Detection Platform  
Built for Security Operations training and demonstration.

For questions or contributions, refer to the project repository.
