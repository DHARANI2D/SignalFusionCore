# SignalFusion Core: Technical Deep Dive

This document provides a low-level technical analysis of the SignalFusion Core architecture, data pipelines, and algorithmic implementations.

## 1. Data Architecture (Prisma/PostgreSQL)

The system relies on a highly relational schema designed to support graph traversal and automated correlation.

### Core Models:
- **Alert**: The primary signal unit. Contains metadata in JSON format (`mitreTactics`, `mitreTechniques`).
- **Event**: Low-level telemetry logs. Linked to Alerts via `matchedEventIds`.
- **AttackNode & AttackEdge**: These models store the persistent representation of the graph.
  - `AttackNode`: Represents an Alert or an Entity (User, Host, IP).
  - `AttackEdge`: Represents the relationship (e.g., "TriggeredBy", "AssociatedWith").
- **Playbook & PlaybookAction**: A 1:N relationship defining the automation state machine.

---

## 2. The Attack Graph Engine (`backend/src/services/attackGraph.ts`)

### Graph Construction Algorithm:
1.  **Ingestion**: Fetch all alerts within a specified window (`T`).
2.  **Entity Extraction**: For each alert, parse the `metadata` and extract identifiers:
    - User (Identity Context)
    - HostName (Asset Context)
    - SourceIP (Network Context)
3.  **Deduplication**: Use an in-memory `Map` (Key: `type:value`) to ensure that if multiple alerts involve the same IP, they point to the exact same `AttackNode`.
4.  **Edge Creation**: Automatically generate directed edges:
    - `EntityNode` -> `AlertNode` (Dependency/Causation)
5.  **Export Optimization**:
    - The engine uses `.slice(0, 500)` to limit frontend rendering load.
    - JSON metadata parsing is wrapped in `try-catch` to ensure malformed detector logs don't crash the visualization.

---

## 3. Automation Engine (`backend/src/services/playbookEngine.ts`)

### Trigger Evaluation Logic:
The `matchesTrigger` function implements a multi-predicate matching engine:
```typescript
if (trigger.severity && alert.severity !== trigger.severity) return false;
if (trigger.technique) { ... check against alert.mitreTechniques ... }
if (trigger.riskScore && (alert.riskScore || 0) < trigger.riskScore) return false;
```

### Retroactive Execution Pipeline:
1.  **Query**: Fetch the last 100 alerts from the database.
2.  **Filter**: Apply the Playbook's trigger logic to each historical alert.
3.  **Spawn**: For every match, initiate a new `PlaybookExecution` thread.
4.  **Logging**: Track duration, success/failure, and the specific `failedAction` in the `PlaybookExecution` table.

---

## 4. Frontend Implementation (Next.js/Cytoscape)

### Cytoscape Optimized Layout:
We use the `cose-bilkent` layout, which is a force-directed layout more sophisticated than standard COSE.
- **Node Repulsion**: Set to `12000` to prevent label overlap.
- **Ideal Edge Length**: Set to `150` to spread out clusters.
- **Dynamic Fitting**: We hook into the `layoutstop` event to call `cy.fit(undefined, 100)`, ensuring the graph is centered regardless of the number of nodes.

### State Management:
- **Client-Side Data Fetching**: Uses standard `useEffect` hooks with `fetch` to interact with the Express backend.
- **Dynamic Imports**: The `GraphViewer` is dynamically imported with `ssr: false` because Cytoscape requires access to the `window` and `document` DOM objects.

---

## 5. API Layer (Express/Node.js)

### Endpoint Strategy:
- **GET /api/attack-graph/export**: Returns a Cytoscape-compatible JSON object containing `elements: { nodes, edges }`.
- **POST /api/playbooks/simulate**: A stateless endpoint that receives a playbook draft + a target alert ID and returns a "What-If" prediction.
- **PATCH /api/config/:key**: Securely updates system settings (like thresholds) stored in the `SystemConfig` table.

---

## 6. Security & Performance
- **Database Indexing**: Indexes on `enabled`, `priority`, and `createdAt` ensure that even with thousands of playbooks/alerts, the trigger engine remains sub-second.
- **Metadata Sanitization**: All incoming alert logs are parsed through a `safeJsonParse` utility to prevent injection or crashes from malformed JSON.
- **Error Boundaries**: Frontend components are wrapped in error boundaries to prevent a single graph rendering failure from breaking the SOC dashboard.
