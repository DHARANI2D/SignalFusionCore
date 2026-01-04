# SignalFusion Core: Logic Implementation Guide

This guide provides an in-depth explanation of the core algorithms and business logic implemented within SignalFusion Core.

---

## 1. Stateful Detection Logic

The "statefulness" of SignalFusion is what sets it apart from simple pattern matching. We don't just look for "bad logs"; we look for "bad stories."

### 🔗 FSM Chain Correlation (`FSMChainDetector.ts`)
**Problem**: A single failed login is noise. A successful login is normal. A sensitive process start is normal.
**Logic**: We use a **Finite State Machine (FSM)** tracked per user.
- **State START**: Looking for `FAILED_LOGIN`.
- **State FAILED_LOGIN**: If we see another failure, we reset a timer. If we see a `SUCCESS_LOGIN` from the *same* user, we move to `SUCCESS_LOGIN` state.
- **State SUCCESS_LOGIN**: Now the system is on high alert. If that same user performs a `SENSITIVE_ACTION` (like starting a database shell or a debugger), we trigger a detection.
- **Implementation**: The logic uses an in-memory `Map<string, { state: string, chain: Event[] }>` to maintain state across independent ingestion calls.

### 🌍 Geo-Velocity "Impossible Travel" (`GeoVelocityDetector.ts`)
**Problem**: Users log in from different IPs all the time.
**Logic**: 
1. **Cache**: Store the last `(timestamp, coordinates)` for every user.
2. **Calculate**: When a new event arrives, calculate the distance between the last known location and the new one.
3. **Speed Test**: `Speed = Distance / (NewTime - OldTime)`.
4. **Threshold**: If `Speed > 500mph`, the detection is triggered with a high confidence score.

---

## 2. Multi-Dimensional Risk Scoring (`engine.ts`)

Alert severity isn't just a category (Low/High); it's a calculated value based on three distinct risk vectors.

### The Algorithm
For every detection, we calculate three scores:
1. **Auth Risk (40 points max)**: Triggered by identity signals (login chains, MFA bypass).
2. **Behavior Risk (50 points max)**: Triggered by process anomalies or impossible travel.
3. **Intel Risk (20 points max)**: Triggered by matches against known bad IPs or file hashes (IOCs).

**Final Score Calculation**:
```typescript
const score = Math.min(100, 
  (authRisk * confidence) + 
  (behaviorRisk * confidence) + 
  (intelRisk * confidence)
);
```
- **Why?**: This ensures that an "Impossible Travel" (high behavior risk) combined with a "Sensitive Action" (auth risk) hits the `90-100` range (Critical), while a single isolated anomaly stays around `30-40` (Low).

---

## 3. Distributed Data Flow Logic

### Ingestion Synchronicity
Logs are posted to the backend. The backend **synchronously** runs the detection engine before responding. 
- **Reasoning**: This provides immediate feedback to the simulator or the user. In a production version, this would be moved to an asynchronous queue (like RabbitMQ or Kafka).

### Frontend Proxy Logic (`actions.ts`)
We use Next.js **Server Actions** as a security barrier.
- **The Flow**: `User Click` → `Server Action (Server Side)` → `Backend API (Authenticated)`.
- **Implementation**: By using `use server`, we ensure that the API keys (if added later) never leak to the browser. The frontend only knows the relative path; the server handles the actual HTTP request to the backend.

---

## 4. Triage & Audit Logic

We implement a strictly enforced "Audit-First" triage system.

### The Transaction Pattern (`server.ts`)
When an analyst updates an alert, we use a **Prisma Transaction** (`prisma.$transaction`).
- **Atomic Operation**: We update the `Alert` record AND create an `AuditLog` entry.
- **Failure Handling**: If the audit log fails (e.g., DB full), the alert status change is rolled back. This ensures we never have a "ghost" status change without a record of who did it.

---

## 5. UI Logic: Dynamic Highlighting (`Sidebar.tsx`)

The sidebar isn't just a list of links; it's a state-aware component.
- **Implementation**: It uses `usePathname()` from `next/navigation`.
- **Matching**: It iterates through a `navItems` array and applies the `isActive` style if the current URL matches the link's `href`.
- **Performance**: We use `twMerge` and `clsx` to efficiently manage Tailwind classes without browser overhead.

---

*This guide explains the "Intelligence" layer of SignalFusion Core.*
