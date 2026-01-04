# SignalFusion Core: Complete Implementation & Logic Manifesto

This document provides an exhaustive breakdown of every feature within SignalFusion Core, detailing the **Frontend UI Logic**, **Application Logic**, and **Backend Business Logic**.

---

## 1. Feature: Attack Graph Visualization
**Objective**: To transform tabular alert data into a relational map that reveals the "blast radius" of a security incident.

### UI Logic (Frontend)
- **Library**: Cytoscape.js with `cose-bilkent` layout.
- **Visual Encoding**: 
    - **Vibrant Red (#EF4444)**: Alerts (indicates an event that needs attention).
    - **Bright Blue (#3B82F6)**: Entities (Hosts, Users, IPs).
    - **Visual Hierarchy**: Alert nodes are 25% larger than entity nodes.
- **Interaction Logic**: 
    - **Zoom/Pan**: Sensitive dragging with `wheelSensitivity: 0.1`.
    - **Auto-Fit**: On component mount and layout completion, the graph executes `cy.fit()` with 100px padding to ensure no nodes are off-screen.
    - **Selection**: Tapping a node highlights it with a 6px blue border and opens a detail panel.

### Backend & Build Logic
- **Service**: `backend/src/services/attackGraph.ts` -> `exportGraph()`.
- **Logic Sequence**:
    1.  **Node Sampling**: To maintain 60FPS in the browser, the backend only exports the first 500 nodes (`nodes.slice(0, 500)`).
    2.  **Referential Integrity**: Edges are filtered to ensure only those connecting existing "sampled" nodes are sent (`filteredEdges`).
    3.  **Metadata Parsing**: Recursively parses the JSON `metadata` column into top-level data attributes for Cytoscape.

---

## 2. Feature: Response Playbook Builder
**Objective**: Allowing SOC teams to define automated "If-This-Then-That" logic for incident response.

### UI Logic (Frontend)
- **Component**: Create Playbook Modal via `isCreateModalOpen`.
- **Logic**:
    - **Action Management**: Local state array `newPlaybook.actions` allows users to dynamically add/remove steps.
    - **Trigger Configuration**: Dropdown selection for severity levels and numeric input for Risk Score thresholds.
    - **Simulator Integration**: Real-time evaluation results shown in a green/red feedback box within the modal.

### Backend & Engine Logic
- **Service**: `backend/src/services/playbookEngine.ts` -> `executePlaybook()`.
- **Execution Flow**:
    1.  **Context Injection**: The alert's data is passed as "Context" to every action.
    2.  **Sequential Execution**: Actions are executed in the order defined by the `order` field.
    3.  **Error Handling**: If an action fails, the engine logs the `failedAction`, stops the sequence, and marks the execution as `failed` to prevent further damage.
    4.  **Audit Trail**: Every execution creates a record in `PlaybookExecution` with a full JSON log of the results.

---

## 3. Feature: Playbook Simulator & Retroactive Execution
**Objective**: Validating automation logic against historical data to ensure reliability.

### Logic Layers
- **Simulation**:
    - **Frontend**: Sends the *draft* playbook + a target alert ID to `/api/playbooks/simulate`.
    - **Backend**: Runs the `matchesTrigger` logic without persisting any changes. It returns a "Match/No Match" results and a human-readable prediction.
- **Retroactive Execution**:
    - **Objective**: Instantly applying a new defense to the last 100 alerts.
    - **Backend Logic**:
        1. Fetch last 100 alerts.
        2. Run filter: `alerts.filter(a => matchesTrigger(newPlaybook, a))`.
        3. Iterate and trigger `executePlaybook()` for each match.

---

## 4. Feature: Threat Intel & IOC Enrichment
**Objective**: Automating the "lookup" phase of an investigation.

### Application Logic
- **Regex Extraction**: Backend identifies patterns for IPv4 (`\b(?:\d{1,3}\.){3}\d{1,3}\b`) and SHA256 hashes in alert metadata.
- **Enrichment Hook**: When `GET /api/alerts/:id` is called, the server:
    1. Extracts IOCs from the alert.
    2. Queries the `ThreatIntel` database for matching entries.
    3. Appends the threat score and category (e.g., "Malicious") to the response.

---

## 5. Feature: Analytics & SOC Metrics
**Objective**: Data-driven management of security operations.

### Calcualtion Logic
- **MTTD (Mean Time to Detect)**:
    - `sum(alert.createdAt - event.timestamp) / alertCount`.
- **MTTR (Mean Time to Respond)**:
    - `sum(firstPlaybookExecution.startTime - alert.createdAt) / responseCount`.
- **Trend Logic**: Uses SQL `GROUP BY` on truncated dates to generate daily aggregates for the dashboard charts.

---

## 6. Feature: Alert Detail & Event Correlation
**Objective**: Drill-down from a high-level alert into the raw logs that triggered it.

### Logic
- **Mapping**: Alerts serve as a "Pointer" to a list of `Event` IDs stored in a JSON string `matchedEventIds`.
- **Integration**: The `/api/alerts/:id` endpoint performs a secondary query `prisma.event.findMany({ where: { id: { in: ids } } })` to resolve these pointers into full objects for display in the table.

---

## Technical Stack Summary
- **Database**: Prisma + SQLite (Relation-heavy).
- **Frontend**: Next.js 16 (App Router), Tailwind (Glassmorphism design system).
- **Visuals**: Cytoscape.js (Graph Engine), Lucide React (Iconography).
- **Runtime**: Node.js + Tsx (TypeScript Execution).
