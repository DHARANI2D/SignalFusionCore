# SignalFusion Core: Ingestion & Data Reference

## 1. Supported Log Sources

SignalFusion Core normalizes logs from 4 primary sources:
- **`auth`**: Authentication events (success/fail, logins, MFA).
- **`endpoint`**: Process execution, file access, registry changes.
- **`network`**: Traffic flows, destination IPs, ports.
- **`cloud`**: Cloud service actions (S3 access, IAM changes).

---

## 2. Ingestion Methods

### REST API (Primary)
**Endpoint**: `POST http://localhost:8001/api/ingest`
```json
{
  "source": "auth",
  "data": {
    "timestamp": "2026-01-03T10:00:00Z",
    "user": "john.doe",
    "source_ip": "192.168.1.100",
    "result": "SUCCESS"
  }
}
```

### Enterprise & Automated Methods
- **Batch Ingestion**: `POST /api/enterprise/ingest/batch` for bulk processing.
- **Syslog Receiver**: `POST /api/enterprise/ingest/syslog` (CEF/LEEF support).
- **SIEM Webhooks**: Generic receivers for Splunk, Elastic, and Sentinel.
- **Attack Simulation**: Trigger 48 scenarios via `POST /api/simulation/run`.

---

## 3. Field Mapping Reference

SignalFusion supports **125+ enterprise alert fields** from platforms like Splunk, CrowdStrike, and Sentinel.

### Core Alert Schema
| Category | Fields |
|----------|--------|
| **Core** | `id`, `summary`, `severity`, `confidence`, `status` |
| **MITRE** | `mitreTactics`, `mitreTechniques`, `mitreSubTechniques` |
| **Risk** | `riskScore`, `riskLevel`, `riskObject`, `impactScore` |
| **Threat** | `threatActor`, `malwareFamily`, `iocType`, `iocValue` |
| **User** | `user`, `userDomain`, `userDepartment`, `userRiskScore` |
| **Asset** | `hostName`, `hostIp`, `hostOs`, `hostCriticality` |
| **Network** | `sourceIp`, `destIp`, `protocol`, `bytesIn`, `bytesOut` |
| **Process** | `processName`, `processCommandLine`, `fileHash` |

---

## 4. Best Practices
1. **Timestamping**: Use ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`).
2. **Rate Limiting**: Designed for ~1000 events/second.
3. **Data Integrity**: All raw logs are preserved in the `metadata` column for lossless analysis.
