# SignalFusion Core - Project Structure

```
SignalFusion Core/
├── backend/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── policy.ts            # Security policy configuration
│   │   ├── detection/
│   │   │   ├── detectors/           # Detection algorithms
│   │   │   │   ├── anomalousAction.ts
│   │   │   │   ├── fsmChain.ts
│   │   │   │   ├── geoVelocity.ts
│   │   │   │   └── threatIntel.ts
│   │   │   └── engine.ts            # Detection orchestration
│   │   ├── lib/
│   │   │   └── db.ts                # Prisma client
│   │   ├── services/
│   │   │   ├── adapters/            # Log normalization
│   │   │   │   ├── authAdapter.ts
│   │   │   │   ├── base.ts
│   │   │   │   ├── cloudAdapter.ts
│   │   │   │   ├── endpointAdapter.ts
│   │   │   │   └── networkAdapter.ts
│   │   │   └── ingestion.ts         # Ingestion service
│   │   ├── simulation/              # Attack simulation
│   │   │   ├── scenarios/           # 48 attack scenarios
│   │   │   │   ├── collection.ts
│   │   │   │   ├── commandControl.ts
│   │   │   │   ├── credentialAccess.ts
│   │   │   │   ├── defenseEvasion.ts
│   │   │   │   ├── discovery.ts
│   │   │   │   ├── execution.ts
│   │   │   │   ├── exfiltration.ts
│   │   │   │   ├── impact.ts
│   │   │   │   ├── initialAccess.ts
│   │   │   │   ├── lateralMovement.ts
│   │   │   │   ├── persistence.ts
│   │   │   │   └── privilegeEscalation.ts
│   │   │   ├── engine.ts            # Simulation orchestration
│   │   │   └── types.ts             # Scenario interfaces
│   │   ├── types.ts                 # Core type definitions
│   │   └── server.ts                # Express application
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── alerts/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Alert detail page
│   │   │   ├── globals.css          # Global styles
│   │   │   ├── layout.tsx           # Root layout
│   │   │   └── page.tsx             # Dashboard
│   │   ├── components/
│   │   │   ├── AlertFeed.tsx
│   │   │   ├── RemediationTerminal.tsx
│   │   │   ├── SimulatorControl.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── TriageControls.tsx
│   │   ├── lib/
│   │   │   └── api.ts               # API utilities
│   │   └── services/
│   │       └── actions.ts           # Server actions
│   ├── .env.local                   # Environment variables
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── Documentation/
│   ├── ATTACK_PATH_FIX.md
│   ├── ATTACK_PATH_GUIDE.md
│   ├── COMPREHENSIVE_GUIDE.md       # Main documentation
│   ├── DEEP_DIVE.md
│   ├── DOCUMENTATION.md
│   ├── INGESTION_GUIDE.md           # Log ingestion methods
│   ├── LOGIC_IMPLEMENTATION.md
│   ├── TEST_RESULTS.md
│   └── TRIAGE_IMPLEMENTATION.md
│
├── docker-compose.yml               # Docker orchestration
├── .dockerignore
└── README.md
```

## Key Components

### Backend (Port 8001)
- **Express.js** REST API server
- **Prisma ORM** with SQLite database
- **TypeScript** for type safety
- **4 Detection Engines**: Geo-Velocity, FSM Chain, Anomalous Action, Threat Intel
- **48 Attack Scenarios** across 13 MITRE tactics
- **Simulation Engine** with configurable parameters

### Frontend (Port 3000)
- **Next.js 16** with App Router
- **React 19** for UI components
- **Tailwind CSS v4** for styling
- **Server Actions** for data mutations
- **Real-time** alert dashboard

### Database
- **SQLite** for development/demo
- **Prisma** schema with models: Event, Alert, Note, AuditLog

## Data Flow

```
Logs → Ingestion Service → Normalization → Database
                                              ↓
                                    Detection Engine
                                              ↓
                                    Alert Creation
                                              ↓
                                    Frontend Dashboard
```
