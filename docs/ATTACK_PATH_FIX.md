# Attack Path Reconstruction - Fix Summary

## Issue
The Attack Path Reconstruction was not highlighting any stages because it was using exact string matching (`includes()`) against hardcoded stage names, but the detectors were generating different MITRE tactic names.

## Root Cause
**Original Logic:**
```tsx
active: mitreTactics.includes("Initial Access")
```

**Problem:** This only worked if the tactic was exactly "Initial Access", but detectors were generating:
- "Command and Control"
- "Initial Access"  
- "Persistence"
- "Privilege Escalation"
- "Discovery"
- "Execution"

## Solution
Updated to use flexible matching with `.some()` and `.includes()`:

```tsx
active: mitreTactics.some(t => 
  t.includes("Initial Access") || 
  t.includes("Command and Control")
)
```

### Stage Mapping Logic:

1. **Initial Access** - Lights up for:
   - "Initial Access"
   - "Command and Control"

2. **Discovery** - Lights up for:
   - "Discovery"
   - "Reconnaissance"

3. **Persistence** - Lights up for:
   - "Persistence"
   - "Privilege Escalation"
   - "Execution"

4. **Exfiltration** - Lights up for:
   - "Exfiltration"
   - "Collection"
   - "Impact"

## Visual Enhancements
Added animated ping indicator for active stages:
```tsx
{step.active && (
  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 
       w-1 h-1 rounded-full bg-blue-500 animate-ping" />
)}
```

## Current Alert Tactics Distribution
Based on the simulation:
- **Command and Control** + **Initial Access**: ThreatIntel detections (malicious IPs, suspicious processes)
- **Persistence** + **Privilege Escalation**: FSM Chain detections (credential stuffing → sensitive actions)
- **Discovery** + **Execution**: Anomalous Action detections (discovery tools → suspicious processes)
- **Credential Access**: Geo-Velocity detections (impossible travel)

## Result
✅ Attack Path now properly highlights stages based on detected tactics
✅ Visual feedback with pulsing icons and ping indicators
✅ Flexible matching handles various MITRE tactic names
