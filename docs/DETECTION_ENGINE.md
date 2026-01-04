# SignalFusion Core: Detection Engine & Attack Paths

## 1. Stateful Detection Logic

SignalFusion looks for **"bad stories"** rather than just isolated bad logs by maintaining state across event streams.

### 🔗 FSM Chain Correlation
**Problem**: Individual authentication events are often noise.
**Logic**: Tracks state transitions per user: `FAILED_LOGIN → SUCCESS_LOGIN → SENSITIVE_ACTION`.
- **Implementation**: Uses an in-memory `Map` to maintain chain state across ingestion calls.

### 🌍 Geo-Velocity "Impossible Travel"
**Problem**: Detecting account takeovers from remote locations.
**Logic**: Calculates `Speed = Distance / (NewTime - OldTime)`.
- **Threshold**: Triggers if speed exceeds `800 km/h` (configurable).

### 🔍 Anomalous Action
**Logic**: Identifies discovery followed by exploitation.
- **Pattern**: `Discovery Process (whoami, net user) → Suspicious Process (powershell -enc, psexec)`.

---

## 2. Multi-Dimensional Risk Scoring

Alert severity is calculated based on three risk vectors:
1. **Auth Risk (40pts)**: Identity signals (login chains, MFA bypass).
2. **Behavior Risk (50pts)**: Process anomalies or impossible travel.
3. **Intel Risk (20pts)**: Matches against known bad IPs/hashes (IOCs).

**Formula**: `Score = Math.min(100, (AuthSum + BehaviorSum + IntelSum) * Confidence)`

---

## 3. Attack Path Reconstruction

The UI highlights the attack lifecycle based on MITRE tactics detected.

### Stage Mapping
| Stage | Lights Up When Tactics Include |
|-------|-------------------------------|
| **Initial Access** | "Initial Access", "Command and Control" |
| **Discovery** | "Discovery", "Reconnaissance" |
| **Persistence** | "Persistence", "Privilege Escalation", "Execution" |
| **Exfiltration** | "Exfiltration", "Collection", "Impact" |

### Visual Indicators
- **Active stages**: Blue glowing borders, pulsed icons, and animated ping dots.
- **Flexible Matching**: Uses substring matching (`some`/`includes`) to handle varied detector output.

---

## 4. Detection Policy Configuration
Located in `backend/src/config/policy.ts`. This file controls:
- **Geo-Velocity**: Max velocity and min confidence.
- **Threat Intel**: Malicious IP lists and suspicious process names.
- **FSM Chain**: Sensitive sources and max chain time gaps.
