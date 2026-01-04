import { ingestionService } from "./ingestion";

export const simulationService = {
    async runSimulation() {
        const logs: string[] = [];
        const log = (msg: string) => logs.push(msg);

        log("🚀 Starting Distributed Attack Simulation...");

        const user = "dharani.s";
        const attackerIp = "99.88.77.66";

        // Helper to ingest and log
        const ingest = async (source: string, data: any) => {
            log(`> POST /api/ingest [${source}]`);
            try {
                const event = await ingestionService.ingestRawLog(source as any, data);
                log(`  ✅ Ingested event: ${event.id.substring(0, 8)}...`);
            } catch (e: any) {
                log(`  ❌ Failed: ${e.message}`);
            }
        };

        // Helper for random time offsets (minutes ago)
        const timeAgo = (minutes: number) => new Date(Date.now() - 1000 * 60 * minutes + (Math.random() * 30000)).toISOString();

        // --- Attack Pattern 1: Credential Stuffing (Recent) ---
        log("\n--- Pattern 1: Credential Stuffing -> Success -> Sensitive Action ---");
        for (let i = 0; i < 3; i++) {
            await ingest("auth", {
                timestamp: timeAgo(15 - i), // ~15 mins ago
                user,
                source_ip: attackerIp,
                result: "FAILED",
                geo_location: "Russia (Simulated)"
            });
        }
        await ingest("auth", {
            timestamp: timeAgo(5), // ~5 mins ago
            user,
            source_ip: attackerIp,
            result: "SUCCESS",
            geo_location: "Russia (Simulated)"
        });
        await ingest("cloud", {
            timestamp: timeAgo(2), // ~2 mins ago
            action: "IAM_POLICY_UPDATE",
            user,
            resource: "production-iam-role",
            status: "SUCCESS"
        });

        // --- Attack Pattern 2: Impossible Travel (Spread out) ---
        log("\n--- Pattern 2: Impossible Travel ---");
        await ingest("auth", {
            timestamp: timeAgo(180), // 3 hours ago
            user: "alice.w",
            source_ip: "44.33.22.11",
            result: "SUCCESS",
            geo_location: "USA"
        });
        await ingest("auth", {
            timestamp: timeAgo(10), // 10 mins ago (Impossible jump)
            user: "alice.w",
            source_ip: "123.123.123.123",
            result: "SUCCESS",
            geo_location: "Japan"
        });

        // --- Attack Pattern 3: Suspicious Tooling (Current) ---
        log("\n--- Pattern 3: Discovery -> Suspicious Tooling ---");
        await ingest("endpoint", {
            timestamp: timeAgo(45),
            user: "admin.b",
            process: "whoami /all",
            parent_process: "cmd.exe",
            hostname: "finance-ws-01"
        });
        await ingest("endpoint", {
            timestamp: new Date().toISOString(), // RIGHT NOW
            user: "admin.b",
            process: "powershell -enc JABzAD0ATgBlAHcALQBPAA...",
            parent_process: "cmd.exe",
            hostname: "finance-ws-01"
        });

        // --- Attack Pattern 4: Data Exfiltration (Multi-stage) ---
        log("\n--- Pattern 4: Multi-stage Data Exfiltration ---");
        const targetIp = "10.0.0.5";
        await ingest("network", {
            timestamp: timeAgo(60),
            source_ip: attackerIp,
            dest_ip: targetIp,
            type: "SCAN",
            port: 445
        });
        await ingest("endpoint", {
            timestamp: timeAgo(30),
            user: "service_account",
            process: "psexec.exe",
            parent_process: "services.exe",
            hostname: "prod-db-01"
        });
        await ingest("cloud", {
            timestamp: timeAgo(1),
            action: "S3_OBJECT_MODIFIED",
            user: "service_account",
            resource: "customer-data-vault",
            status: "SUCCESS",
            metadata: { operation: "BatchDownload", size: "4.2GB" }
        });

        // --- Trigger Detections ---
        log("\n🔍 Running Detection Engine...");

        const { prisma } = require("../lib/db");
        const { detectionEngine } = require("../detection/engine");

        const allEvents = await prisma.event.findMany();
        const unifiedEvents = allEvents.map((e: any) => ({
            id: e.id,
            timestamp: e.timestamp,
            ingestedAt: e.ingestedAt,
            source: e.source as any,
            eventType: e.eventType,
            actor: { user: e.user || undefined, process: e.process || undefined, service: e.service || undefined },
            network: { sourceIp: e.sourceIp || undefined, destIp: e.destIp || undefined, geo: e.geo || undefined },
            severityHint: e.severityHint as any,
            confidenceHint: e.confidenceHint,
            metadata: JSON.parse(e.metadata)
        }));

        const detections = await detectionEngine.runDetections(unifiedEvents);
        log(`✅ Detection Complete: Generated ${detections.length} alerts.`);

        log("\n✅ Simulation Complete.");
        return logs;
    }
};
