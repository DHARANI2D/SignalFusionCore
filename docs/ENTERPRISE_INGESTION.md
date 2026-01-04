# Enterprise Ingestion Methods

## Overview

SignalFusion provides multiple ingestion methods for enterprise deployments where manual UI-based ingestion isn't practical. These methods enable automated log collection from various sources.

---

## Available Methods

### 1. **Batch File Ingestion**
Ingest logs from JSON files or arrays for bulk processing.

**Endpoint**: `POST /api/enterprise/ingest/batch`

**Use Cases**:
- Importing historical logs
- Bulk data migration
- Scheduled batch processing

**Example**:
```bash
curl -X POST http://localhost:8001/api/enterprise/ingest/batch \
  -H "Content-Type: application/json" \
  -d '{
    "logs": [
      {"source": "auth", "eventType": "LOGIN_FAIL", "user": "admin", "source_ip": "192.168.1.100"},
      {"source": "endpoint", "eventType": "PROCESS_START", "process": "cmd.exe", "user": "admin"}
    ]
  }'
```

---

### 2. **Syslog Receiver**
Receive syslog messages in CEF or LEEF format.

**Endpoint**: `POST /api/enterprise/ingest/syslog`

---

### 3. **Webhook Receiver**
Generic webhook endpoint for SIEM forwarding.

**Endpoint**: `POST /api/enterprise/ingest/webhook`

**Supported SIEM Formats**: Splunk, Elastic, Sentinel, QRadar

---

### 4. **Scheduled SIEM Polling**
Poll logs from SIEM APIs on a schedule.

**Endpoint**: `POST /api/enterprise/ingest/poll`

---

### 5. **File Directory Watcher**
Monitor a directory for new log files.

**Endpoint**: `POST /api/enterprise/ingest/watch`

---

## Testing

```bash
# Health check
curl http://localhost:8001/api/enterprise/ingest/health

# Test batch ingestion
curl -X POST http://localhost:8001/api/enterprise/ingest/batch \
  -H "Content-Type: application/json" \
  -d '{"logs": [{"source":"auth","eventType":"TEST"}]}'
```
