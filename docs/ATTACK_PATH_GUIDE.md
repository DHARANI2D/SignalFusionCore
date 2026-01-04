# Attack Path Highlighting - User Guide

## Current Status: ✅ Working Correctly

The Attack Path Reconstruction is functioning as designed. Different alerts highlight different stages based on their MITRE tactics.

## Alert Distribution in Current Simulation

Based on the current alerts in the system:

### 1. **Initial Access Stage** (15 alerts)
**Tactics**: "Command and Control" + "Initial Access"  
**Detector**: ThreatIntelDetector  
**Examples**:
- "Matched known malicious IP: 99.88.77.66"
- "Detected suspicious process execution: psexec.exe"

**What lights up**: Initial Access stage only

---

### 2. **Discovery Stage** (2 alerts)
**Tactics**: "Discovery" + "Execution"  
**Detector**: AnomalousActionDetector  
**Alert IDs**:
- `a070ec26-d9db-4c79-9a73-7a635f2ff0a4`
- `12da309b-6223-4738-8782-209d23e05410`

**Summary**: "User admin.b executed discovery process 'whoami /all' followed by suspicious process..."

**What lights up**: Discovery + Persistence stages

---

### 3. **Persistence Stage** (2 alerts)
**Tactics**: "Persistence" + "Privilege Escalation"  
**Detector**: FSMChainDetector  
**Alert IDs**:
- `abf3e52f-62cd-4cdc-ba90-9491ce5bb1a1`
- `5c87cf48-56fa-4dda-9417-77ea7560c8c4`

**Summary**: "User dharani.s experienced a FAILED_LOGIN followed by a SUCCESS_LOGIN, and then performed a sensitive action..."

**What lights up**: Persistence stage

---

## How to See Different Stages Highlighted

### Method 1: Navigate to Specific Alerts
1. Go to `http://localhost:3000`
2. Look for these specific alerts in the feed:
   - **For Discovery**: Look for "Anomalous Action Detector" alerts about "admin.b"
   - **For Persistence**: Look for "FSM-Chain Detector" alerts about "dharani.s"
   - **For Initial Access**: Any "ThreatIntel" alert

### Method 2: Direct URL Access
```bash
# Discovery + Persistence stages highlighted
http://localhost:3000/alerts/a070ec26-d9db-4c79-9a73-7a635f2ff0a4

# Persistence stage highlighted
http://localhost:3000/alerts/abf3e52f-62cd-4cdc-ba90-9491ce5bb1a1
```

### Method 3: Filter by Detector
Use the browser console or search for alerts by summary:
- Search: "Anomalous Action" → Discovery stage
- Search: "FSM-Chain" → Persistence stage
- Search: "ThreatIntel" → Initial Access stage

---

## Why Exfiltration Doesn't Light Up

**Current Simulation Doesn't Include Exfiltration Tactics**

The 4-stage simulation includes:
1. ✅ Initial Access (Credential stuffing, malicious IPs)
2. ✅ Discovery (whoami, reconnaissance)
3. ✅ Persistence (Privilege escalation, sensitive actions)
4. ❌ Exfiltration (Not currently simulated)

### To Add Exfiltration Detection:

You would need to:
1. Add a detector that generates "Exfiltration" or "Collection" tactics
2. Or update existing detectors to include these tactics for relevant patterns

Example: The Data Exfiltration pattern in the simulation could be enhanced to trigger an exfiltration tactic.

---

## Stage Mapping Reference

| Stage | Lights Up When Tactics Include |
|-------|-------------------------------|
| Initial Access | "Initial Access", "Command and Control" |
| Discovery | "Discovery", "Reconnaissance" |
| Persistence | "Persistence", "Privilege Escalation", "Execution" |
| Exfiltration | "Exfiltration", "Collection", "Impact" |

---

## Visual Indicators

When a stage is **active**:
- ✅ Blue glowing border
- ✅ Blue icon (instead of gray)
- ✅ Pulsing animation on icon
- ✅ Animated ping dot below the stage
- ✅ White text label (instead of gray)

When a stage is **inactive**:
- Gray icon
- Gray text
- No animations
- Transparent background

---

## Quick Test

Run this in your terminal to see which alerts have which tactics:

```bash
curl -s http://localhost:8001/api/alerts | jq -r '.[] | "\(.id | split("-")[0]): \(.mitreTactics)"'
```

Then visit an alert with different tactics to see different stages light up!
