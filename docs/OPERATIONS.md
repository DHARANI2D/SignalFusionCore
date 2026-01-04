# SignalFusion Core: Operations & Incident Response

## 1. Triage Workflow

SignalFusion Core implements a strictly enforced "Audit-First" triage system.

### Status Lifecycle
Each alert follows a clear progression:
`New → Triage → In Progress → Closed`

- **New**: Freshly detected alert awaiting analysis.
- **Triage**: Analyst has claimed the alert and is performing initial assessment.
- **In Progress**: Active investigation or remediation is underway.
- **Closed**: Alert resolved (as true or false positive).

### Collaborative Features
- **Analyst Notes**: Add observations directly to the alert detail page.
- **Activity Timeline**: A chronological audit trail of all status changes, notes, and actions.
- **User Attribution**: Every action is stamped with the analyst's identity.

---

## 2. Response Playbooks

Playbooks enable automated "If-This-Then-That" logic for incident response.

### Execution Engine
- **Logic**: A JSON-driven state machine evaluates signals against active triggers.
- **Context Injection**: Alert data is passed as context to every sequential action.
- **Audit Logs**: Every execution is recorded with full JSON results in the database.

### Automation Examples
- **Host Isolation**: If Ransomware detected → Isolate host.
- **IP Blocking**: If Malicious IP matched → Block in firewall.
- **Credential Reset**: If Account Takeover detected → Reset user password.

---

## 3. Playbook Simulator

The simulator allows SOC teams to validate automation logic against historical data without risk.

### How to Simulate
1. Open the Playbook Builder.
2. Select an existing alert to test against.
3. Click **"Run Simulation"**.
4. The system provides a **"What-If" prediction** showing whether the playbook would have triggered and what actions it would have taken.

---

## 4. Triage Analytics
The Dashboard tracks key performance indicators:
- **MTTD**: Mean Time to Detect (Ingestion → Alert Creation).
- **MTTR**: Mean Time to Respond (Alert Creation → Remediation).
- **Tactic Heatmap**: Identifies where attackers are most active in the MITRE lifecycle.
