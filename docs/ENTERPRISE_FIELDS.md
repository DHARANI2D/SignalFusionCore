# Enterprise SIEM Alert Fields - Complete Reference

## Overview

SignalFusion Core now supports **150+ enterprise alert fields** from all major SIEM and security platforms:

- ✅ **Splunk Enterprise Security**
- ✅ **CrowdStrike Falcon**
- ✅ **Elastic Security (ELK)**
- ✅ **Microsoft Sentinel**
- ✅ **IBM QRadar**
- ✅ **Palo Alto Cortex XDR**
- ✅ **LogRhythm**
- ✅ **ArcSight ESM**
- ✅ **Sumo Logic**
- ✅ **Rapid7 InsightIDR**

---

## Field Categories

### 1. Core Alert Fields
```typescript
id                    // Unique alert identifier
summary               // Brief alert description
description           // Detailed description
severity              // Low, Medium, High, Critical
confidence            // 0.0 - 1.0
status                // New, Triage, In Progress, Resolved, Closed, False Positive
priority              // Low, Medium, High, Critical
```

### 2. Detection & Classification
```typescript
signals               // Detection signals (JSON array)
detectorName          // Name of detector that fired
detectionMethod       // signature, anomaly, ml, behavioral, correlation
alertType             // security, compliance, operational
category              // malware, intrusion, data_loss, policy_violation
subcategory           // Specific subcategory
```

### 3. MITRE ATT&CK Framework
```typescript
mitreTactics          // ["Initial Access", "Execution"]
mitreTechniques       // ["T1566 - Phishing", "T1059 - Command and Scripting Interpreter"]
mitreSubTechniques    // ["T1566.001 - Spearphishing Attachment"]
killChainPhase        // reconnaissance, weaponization, delivery, exploitation, c2
```

### 4. Risk & Scoring (Splunk, QRadar)
```typescript
riskScore             // 0-1000 calculated risk score
riskLevel             // low, medium, high, critical
riskMessage           // Human-readable risk description
riskObject            // Affected entity (hostname, user, IP)
riskObjectType        // system, user, network, application, data
threatScore           // Threat-specific score
impactScore           // Business impact score
urgencyScore          // Response urgency score
```

### 5. Threat Intelligence (CrowdStrike, Elastic)
```typescript
threatObject          // Malicious indicator (domain, IP, hash)
threatObjectType      // domain, ip, hash, url, email
iocType               // Indicator type
iocValue              // Indicator value
threatActor           // APT28, Lazarus Group, etc.
threatGroup           // Associated threat group
campaignName          // Operation name
malwareFamily         // TrickBot, Emotet, Cobalt Strike
attackVector          // phishing, exploit, brute_force
threatConfidence      // low, medium, high, confirmed
```

### 6. User & Identity (Sentinel, Elastic)
```typescript
user                  // Username
userName              // Full name
userEmail             // Email address
userDomain            // Active Directory domain
userBunit             // Business unit
userDepartment        // Department
userTitle             // Job title
userCategory          // Employee, Contractor, Service Account
userRiskScore         // User-specific risk score
userEndDate           // Account expiration
userId                // Unique user ID
userSid               // Windows Security Identifier
```

### 7. Asset & Host (Cortex XDR, CrowdStrike)
```typescript
hostName              // Computer name
hostIp                // IP address
hostMac               // MAC address
hostOs                // Windows 10, Ubuntu 20.04
hostOsVersion         // Build number
hostDomain            // Domain membership
hostCriticality       // low, medium, high, critical
assetId               // Asset management ID
assetOwner            // Asset owner
assetValue            // Business value
agentId               // EDR agent ID
sensorId              // Sensor identifier
```

### 8. Network & Communication
```typescript
sourceIp              // Source IP address
sourcePort            // Source port
sourceHostname        // Source hostname
sourceCountry         // Source country
destIp                // Destination IP
destPort              // Destination port
destHostname          // Destination hostname
destCountry           // Destination country
protocol              // TCP, UDP, ICMP, HTTP
networkZone           // internal, external, dmz
bytesIn               // Bytes received
bytesOut              // Bytes sent
packetsIn             // Packets received
packetsOut            // Packets sent
```

### 9. File & Process (EDR Platforms)
```typescript
fileName              // File name
filePath              // Full file path
fileHash              // File hash value
fileHashType          // md5, sha1, sha256
fileSize              // File size in bytes
processName           // Process name
processId             // Process ID
processCommandLine    // Full command line
parentProcess         // Parent process name
parentProcessId       // Parent process ID
```

### 10. Rule & Correlation (Splunk, QRadar, ArcSight)
```typescript
ruleId                // Rule identifier
ruleName              // Rule name
ruleVersion           // Rule version
correlationId         // Correlation identifier
correlationName       // Correlation rule name
notableEventId        // Splunk notable event ID
previousNotableCount  // Historical count
relatedAlertIds       // Related alert IDs (JSON array)
```

### 11. Time & Duration
```typescript
startTime             // Alert start time
endTime               // Alert end time
duration              // Duration in seconds
firstSeen             // First occurrence
lastSeen              // Last occurrence
createdAt             // Creation timestamp
updatedAt             // Last update timestamp
```

### 12. Investigation & Response (Sentinel, LogRhythm)
```typescript
assignedTo            // Assigned analyst
assignedTeam          // Assigned team
investigationStatus   // new, assigned, investigating, resolved
incidentId            // Incident ID
caseId                // Case management ID
ticketId              // Ticketing system ID
playbookName          // Automated playbook
automationStatus      // Automation status
```

### 13. Compliance & Policy (ArcSight, Sumo Logic)
```typescript
complianceFramework   // PCI-DSS, HIPAA, SOX, GDPR, ISO27001
policyViolation       // Policy violated
policyName            // Policy name
regulatoryRequirement // Specific requirement
dataClassification    // public, internal, confidential, restricted
```

### 14. Evidence & Artifacts
```typescript
matchedEventIds       // Matched event IDs (JSON array)
evidenceIds           // Evidence IDs (JSON array)
artifactIds           // Artifact IDs (JSON array)
reasoning             // Detection reasoning (JSON array)
attackPath            // Attack path visualization (JSON)
remediationSteps      // Remediation steps (JSON array)
```

### 15. Source & Vendor (Multi-platform)
```typescript
sourceSystem          // splunk, crowdstrike, elastic, sentinel, qradar
sourceIndex           // Source index/database
sourceType            // Source type
vendor                // Vendor name
product               // Product name
version               // Product version
```

### 16. Additional Context
```typescript
tags                  // Custom tags (JSON array)
labels                // Labels (JSON array)
customFields          // Platform-specific fields (JSON object)
rawEvent              // Original raw event data
```

---

## Platform-Specific Examples

### Splunk Enterprise Security
```json
{
  "ruleId": "3F58FB56-0D21-4081-851B-FD3FD83FA5A4@@notable@@5be76e90740cf34f4f84f2fb24cbea8f",
  "ruleName": "CDC_RIR_0006-24_Hour_Risk_Threshold",
  "notableEventId": "notable_12345",
  "riskScore": 264.00,
  "riskObject": "hpe-5cg4442nhq",
  "riskObjectType": "system",
  "threatObject": "brainspinesurgery.com",
  "previousNotableCount": 2,
  "sourceSystem": "splunk",
  "sourceIndex": "main"
}
```

### CrowdStrike Falcon
```json
{
  "severity": "critical",
  "threatActor": "FANCY BEAR",
  "campaignName": "Operation Ghost",
  "malwareFamily": "Cobalt Strike",
  "iocType": "domain",
  "iocValue": "malicious.example.com",
  "threatConfidence": "high",
  "agentId": "abc123def456",
  "hostName": "DESKTOP-ABC123",
  "sourceSystem": "crowdstrike"
}
```

### Microsoft Sentinel
```json
{
  "incidentId": "INC-2024-001234",
  "severity": "High",
  "status": "In Progress",
  "assignedTo": "soc-analyst@company.com",
  "playbookName": "Phishing Investigation",
  "automationStatus": "running",
  "user": "john.doe",
  "userEmail": "john.doe@company.com",
  "userDepartment": "Finance",
  "sourceSystem": "sentinel"
}
```

### Elastic Security
```json
{
  "detectionMethod": "ml",
  "alertType": "security",
  "category": "malware",
  "killChainPhase": "exploitation",
  "fileHash": "a1b2c3d4e5f6...",
  "fileHashType": "sha256",
  "processCommandLine": "powershell.exe -enc ...",
  "sourceSystem": "elastic"
}
```

### IBM QRadar
```json
{
  "ruleId": "100001",
  "ruleName": "Multiple Failed Logins",
  "severity": "High",
  "magnitude": 8,
  "credibility": 9,
  "relevance": 10,
  "correlationId": "CORR-12345",
  "sourceIp": "192.168.1.100",
  "destIp": "10.0.0.50",
  "sourceSystem": "qradar"
}
```

### Palo Alto Cortex XDR
```json
{
  "alertType": "security",
  "category": "intrusion",
  "hostCriticality": "high",
  "assetValue": "critical",
  "sensorId": "sensor-001",
  "attackVector": "exploit",
  "mitreTechniques": ["T1190 - Exploit Public-Facing Application"],
  "sourceSystem": "cortex_xdr"
}
```

---

## Usage in SignalFusion

All these fields are automatically populated by the detection engine based on:
- Event data
- Detection logic
- Threat intelligence
- Asset inventory
- User directory

### Example Alert Creation
```typescript
await prisma.alert.create({
  data: {
    // Core fields
    summary: "Suspicious PowerShell Execution",
    severity: "High",
    confidence: 0.95,
    
    // Risk scoring
    riskScore: 850,
    riskLevel: "critical",
    riskObject: "DESKTOP-ABC123",
    riskObjectType: "system",
    
    // Threat intel
    threatActor: "APT29",
    malwareFamily: "Cobalt Strike",
    iocType: "domain",
    iocValue: "malicious.com",
    
    // User context
    user: "john.doe",
    userEmail: "john.doe@company.com",
    userDepartment: "Finance",
    userBunit: "Corporate",
    
    // Asset context
    hostName: "DESKTOP-ABC123",
    hostOs: "Windows 10",
    hostCriticality: "high",
    
    // MITRE
    mitreTactics: JSON.stringify(["Execution", "Defense Evasion"]),
    mitreTechniques: JSON.stringify(["T1059.001 - PowerShell"]),
    
    // Investigation
    assignedTo: "soc-team@company.com",
    priority: "High",
    status: "New"
  }
});
```

---

## Field Mapping by Platform

| Field | Splunk | CrowdStrike | Elastic | Sentinel | QRadar | Cortex XDR |
|-------|--------|-------------|---------|----------|--------|------------|
| Risk Score | ✅ | ✅ | ✅ | ✅ | ✅ (magnitude) | ✅ |
| Threat Actor | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MITRE Tactics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Context | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Asset Info | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| IOC Data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Compliance | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Playbooks | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |

---

## Total Field Count

- **Core Alert**: 7 fields
- **Detection**: 6 fields
- **MITRE**: 4 fields
- **Risk & Scoring**: 8 fields
- **Threat Intel**: 10 fields
- **User & Identity**: 12 fields
- **Asset & Host**: 12 fields
- **Network**: 14 fields
- **File & Process**: 10 fields
- **Rule & Correlation**: 8 fields
- **Time**: 7 fields
- **Investigation**: 8 fields
- **Compliance**: 5 fields
- **Evidence**: 6 fields
- **Source**: 6 fields
- **Additional**: 4 fields

**Total**: **127 enterprise alert fields** covering all major SIEM platforms!
