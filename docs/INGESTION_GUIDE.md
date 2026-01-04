# SignalFusion Core: Log Ingestion Guide

## Overview

SignalFusion Core supports multiple methods for ingesting security logs from various sources. This guide covers all available ingestion methods with practical examples.

---

## Supported Log Sources

- **`auth`**: Authentication and authorization events (logins, logouts, privilege changes)
- **`endpoint`**: Endpoint security events (process execution, file access, registry changes)
- **`network`**: Network traffic and firewall logs
- **`cloud`**: Cloud service events (AWS, Azure, GCP)

---

## Method 1: REST API (Primary Method)

### Endpoint
```
POST http://localhost:8001/api/ingest
Content-Type: application/json
```

### Request Format
```json
{
  "source": "auth|endpoint|network|cloud",
  "data": {
    // Source-specific fields
  }
}
```

### Examples

#### Authentication Log
```bash
curl -X POST http://localhost:8001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "auth",
    "data": {
      "timestamp": "2026-01-03T10:00:00Z",
      "user": "john.doe",
      "source_ip": "192.168.1.100",
      "result": "SUCCESS",
      "geo_location": "USA"
    }
  }'
```

#### Endpoint/Process Log
```bash
curl -X POST http://localhost:8001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "endpoint",
    "data": {
      "timestamp": "2026-01-03T10:05:00Z",
      "user": "admin",
      "process": "powershell.exe",
      "parent_process": "cmd.exe",
      "hostname": "workstation-01"
    }
  }'
```

#### Network Traffic Log
```bash
curl -X POST http://localhost:8001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "network",
    "data": {
      "timestamp": "2026-01-03T10:10:00Z",
      "source_ip": "10.0.1.50",
      "dest_ip": "185.220.101.45",
      "type": "HTTPS",
      "port": 443,
      "bytes_transferred": 1048576
    }
  }'
```

#### Cloud Service Log
```bash
curl -X POST http://localhost:8001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "cloud",
    "data": {
      "timestamp": "2026-01-03T10:15:00Z",
      "action": "S3_OBJECT_UPLOAD",
      "user": "cloud_admin",
      "resource": "sensitive-data-bucket",
      "status": "SUCCESS"
    }
  }'
```

---

## Method 2: Batch Ingestion

### Ingest Multiple Logs at Once
```bash
# Create a file with multiple logs (logs.json)
cat > logs.json << 'EOF'
[
  {
    "source": "auth",
    "data": {
      "timestamp": "2026-01-03T10:00:00Z",
      "user": "alice",
      "source_ip": "192.168.1.101",
      "result": "FAILED"
    }
  },
  {
    "source": "auth",
    "data": {
      "timestamp": "2026-01-03T10:00:05Z",
      "user": "alice",
      "source_ip": "192.168.1.101",
      "result": "FAILED"
    }
  },
  {
    "source": "auth",
    "data": {
      "timestamp": "2026-01-03T10:00:10Z",
      "user": "alice",
      "source_ip": "192.168.1.101",
      "result": "SUCCESS"
    }
  }
]
EOF

# Ingest each log
jq -c '.[]' logs.json | while read log; do
  curl -X POST http://localhost:8001/api/ingest \
    -H "Content-Type: application/json" \
    -d "$log"
  sleep 0.1
done
```

---

## Method 3: Automated Simulation

### Run Pre-Configured Attack Scenarios

SignalFusion includes 48 diverse attack scenarios across all MITRE ATT&CK tactics.

#### Run Random Scenarios
```bash
# Run 10 random scenarios
curl -X POST 'http://localhost:8001/api/simulation/run?count=10'

# Run 5 high-severity scenarios
curl -X POST 'http://localhost:8001/api/simulation/run?count=5&intensity=high'

# Run low-severity scenarios
curl -X POST 'http://localhost:8001/api/simulation/run?count=15&intensity=low'
```

#### Run Specific MITRE Tactics
```bash
# Run only Initial Access scenarios
curl -X POST 'http://localhost:8001/api/simulation/run?tactics=Initial Access'

# Run multiple tactics
curl -X POST 'http://localhost:8001/api/simulation/run?tactics=Persistence,Privilege Escalation'

# Run all Credential Access scenarios
curl -X POST 'http://localhost:8001/api/simulation/run?tactics=Credential Access'
```

#### List Available Scenarios
```bash
# Get all scenarios
curl -s http://localhost:8001/api/simulation/scenarios | jq '.'

# Count scenarios by tactic
curl -s http://localhost:8001/api/simulation/scenarios | jq '.tactics'

# List scenario names
curl -s http://localhost:8001/api/simulation/scenarios | jq '.scenarios[].name'
```

---

## Method 4: Programmatic Ingestion (Node.js)

### Using the Ingestion Service Directly

```javascript
import { ingestionService } from './services/ingestion';

// Ingest a single log
const event = await ingestionService.ingestRawLog('auth', {
  timestamp: new Date().toISOString(),
  user: 'john.doe',
  source_ip: '192.168.1.100',
  result: 'SUCCESS',
  geo_location: 'USA'
});

console.log(`Ingested event: ${event.id}`);
```

### Batch Ingestion Script

```javascript
import { ingestionService } from './services/ingestion';

const logs = [
  { source: 'auth', data: { /* ... */ } },
  { source: 'endpoint', data: { /* ... */ } },
  { source: 'network', data: { /* ... */ } }
];

for (const log of logs) {
  await ingestionService.ingestRawLog(log.source, log.data);
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
}
```

---

## Method 5: Integration with SIEM/Log Aggregators

### Splunk Forwarder
```bash
# Configure Splunk to forward to SignalFusion
# In outputs.conf:
[httpout:signalfusion]
httpEventCollectorToken = <your-token>
uri = http://localhost:8001/api/ingest
```

### Logstash Pipeline
```ruby
output {
  http {
    url => "http://localhost:8001/api/ingest"
    http_method => "post"
    format => "json"
    mapping => {
      "source" => "network"
      "data" => "%{message}"
    }
  }
}
```

### Fluentd Configuration
```ruby
<match **>
  @type http
  endpoint http://localhost:8001/api/ingest
  json_array true
  <buffer>
    flush_interval 10s
  </buffer>
</match>
```

---

## Field Mapping Reference

### Auth Source
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | ISO 8601 | Event timestamp | `2026-01-03T10:00:00Z` |
| `user` | string | Username | `john.doe` |
| `source_ip` | string | Source IP address | `192.168.1.100` |
| `result` | string | Auth result | `SUCCESS`, `FAILED` |
| `geo_location` | string | Geographic location | `USA`, `China` |
| `user_agent` | string | User agent string | `Mozilla/5.0...` |

### Endpoint Source
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | ISO 8601 | Event timestamp | `2026-01-03T10:00:00Z` |
| `user` | string | Username | `admin` |
| `process` | string | Process name/command | `powershell.exe` |
| `parent_process` | string | Parent process | `cmd.exe` |
| `hostname` | string | Hostname | `workstation-01` |
| `process_name` | string | Alt process field | `mimikatz.exe` |

### Network Source
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | ISO 8601 | Event timestamp | `2026-01-03T10:00:00Z` |
| `source_ip` | string | Source IP | `10.0.1.50` |
| `dest_ip` | string | Destination IP | `185.220.101.45` |
| `type` | string | Protocol type | `HTTPS`, `SSH`, `SMB` |
| `port` | number | Port number | `443`, `22`, `445` |
| `bytes_transferred` | number | Data transferred | `1048576` |

### Cloud Source
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` | ISO 8601 | Event timestamp | `2026-01-03T10:00:00Z` |
| `action` | string | Cloud action | `S3_OBJECT_UPLOAD` |
| `user` | string | Cloud user | `cloud_admin` |
| `resource` | string | Resource name | `my-bucket` |
| `status` | string | Action status | `SUCCESS`, `FAILED` |

---

## Best Practices

### 1. Timestamp Format
Always use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

### 2. Batch Processing
For large volumes, batch logs in groups of 100-1000 with small delays between batches.

### 3. Error Handling
```bash
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8001/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"source":"auth","data":{...}}')

http_code=$(echo "$response" | tail -n1)
if [ "$http_code" != "200" ]; then
  echo "Ingestion failed with code: $http_code"
fi
```

### 4. Rate Limiting
SignalFusion can handle ~1000 events/second. For higher volumes, implement queuing.

---

## Testing Your Ingestion

### 1. Verify Event Count
```bash
curl -s http://localhost:8001/api/stats | jq '.totalEvents'
```

### 2. Check Recent Events
```bash
curl -s http://localhost:8001/api/events?limit=10 | jq '.[]'
```

### 3. Trigger Detection
After ingesting logs, run detection:
```bash
curl -X POST http://localhost:8001/api/detection/run
```

### 4. View Generated Alerts
```bash
curl -s http://localhost:8001/api/alerts | jq '.[] | {id, summary, severity}'
```

---

## Troubleshooting

### Issue: Events ingested but no alerts generated
**Solution**: Run the detection engine manually or wait for the next detection cycle.

### Issue: "No adapter found for source"
**Solution**: Ensure `source` is one of: `auth`, `endpoint`, `network`, `cloud`

### Issue: Timestamp parsing errors
**Solution**: Use ISO 8601 format. Example: `new Date().toISOString()`

### Issue: High latency
**Solution**: Use batch ingestion or reduce log volume

---

## Next Steps

- **View Alerts**: `http://localhost:3000/`
- **API Documentation**: See `COMPREHENSIVE_GUIDE.md`
- **Simulation Scenarios**: See `SIMULATION_SCENARIOS.md`
- **Detection Logic**: See `LOGIC_IMPLEMENTATION.md`
