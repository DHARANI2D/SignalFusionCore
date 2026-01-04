import express from "express";
import { prisma } from "../lib/db";
import { ingestionService } from "./ingestion";
import { detectionEngine } from "../detection/engine";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

/**
 * ENTERPRISE INGESTION METHODS
 * For production deployments where manual UI ingestion isn't practical
 */

// ============================================================================
// 1. BATCH FILE INGESTION
// ============================================================================

/**
 * Ingest logs from a JSON file
 * POST /api/enterprise/ingest/batch
 * Body: { filePath: string } or multipart file upload
 */
router.post("/batch", async (req, res) => {
    try {
        const { filePath, logs } = req.body;

        let logsToIngest: any[] = [];

        if (filePath) {
            // Read from file path
            const fileContent = await fs.readFile(filePath, 'utf-8');
            logsToIngest = JSON.parse(fileContent);
        } else if (logs) {
            // Direct logs array
            logsToIngest = logs;
        } else {
            return res.status(400).json({ error: "Provide either filePath or logs array" });
        }

        const results = [];
        for (const log of logsToIngest) {
            const { source, ...logData } = log;
            const event = await ingestionService.ingestRawLog(source, logData);
            results.push({ eventId: event.id, source });
        }

        // Run detection on all new events
        const allEvents = await prisma.event.findMany({
            orderBy: { ingestedAt: 'desc' },
            take: logsToIngest.length
        });

        const unifiedEvents = allEvents.map(e => ({
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

        res.json({
            status: "success",
            eventsIngested: results.length,
            alertsGenerated: detections.length,
            results
        });
    } catch (error: any) {
        console.error("Batch ingestion error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// 2. SYSLOG RECEIVER (CEF/LEEF Format)
// ============================================================================

/**
 * Receive syslog messages in CEF or LEEF format
 * POST /api/enterprise/ingest/syslog
 */
router.post("/syslog", async (req, res) => {
    try {
        const { message, format } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Missing syslog message" });
        }

        // Parse CEF format: CEF:Version|Device Vendor|Device Product|Device Version|Signature ID|Name|Severity|Extension
        let parsedLog: any = {};
        let source = "network";

        if (format === "CEF" || message.startsWith("CEF:")) {
            const parts = message.split("|");
            if (parts.length >= 7) {
                parsedLog = {
                    eventType: parts[5] || "SYSLOG_EVENT",
                    severity: parts[6],
                    vendor: parts[1],
                    product: parts[2],
                    raw_message: message
                };
            }
        } else if (format === "LEEF") {
            // LEEF format parsing
            parsedLog = {
                eventType: "SYSLOG_EVENT",
                raw_message: message
            };
        } else {
            // Generic syslog
            parsedLog = {
                eventType: "SYSLOG_EVENT",
                message: message
            };
        }

        const event = await ingestionService.ingestRawLog(source as any, parsedLog);

        res.json({
            status: "success",
            eventId: event.id,
            format: format || "generic"
        });
    } catch (error: any) {
        console.error("Syslog ingestion error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// 3. WEBHOOK RECEIVER (For SIEM Forwarding)
// ============================================================================

/**
 * Generic webhook endpoint for SIEM integrations
 * POST /api/enterprise/ingest/webhook
 * Supports Splunk, Elastic, Sentinel, QRadar formats
 */
router.post("/webhook", async (req, res) => {
    try {
        const { events, source_type } = req.body;

        if (!events || !Array.isArray(events)) {
            return res.status(400).json({ error: "Expected 'events' array" });
        }

        const results = [];

        for (const event of events) {
            // Auto-detect source based on event structure
            let source: any = "network";
            let logData: any = event;

            // Splunk format
            if (event.sourcetype) {
                if (event.sourcetype.includes("auth")) source = "auth";
                else if (event.sourcetype.includes("endpoint")) source = "endpoint";
                else if (event.sourcetype.includes("cloud")) source = "cloud";
                logData = event._raw || event;
            }
            // Elastic format
            else if (event["@timestamp"]) {
                source = event.event?.category || "network";
                logData = event;
            }
            // Sentinel format
            else if (event.TimeGenerated) {
                source = event.Type || "network";
                logData = event;
            }

            const ingestedEvent = await ingestionService.ingestRawLog(source, logData);
            results.push({ eventId: ingestedEvent.id });
        }

        res.json({
            status: "success",
            eventsIngested: results.length,
            source_type: source_type || "auto-detected"
        });
    } catch (error: any) {
        console.error("Webhook ingestion error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// 4. SCHEDULED POLLING (For SIEM APIs)
// ============================================================================

/**
 * Trigger a poll from configured SIEM
 * POST /api/enterprise/ingest/poll
 * Body: { siem: "splunk" | "elastic" | "sentinel", query: string, time_range: string }
 */
router.post("/poll", async (req, res) => {
    try {
        const { siem, query, time_range } = req.body;

        // This would integrate with actual SIEM APIs
        // For now, return configuration guidance

        res.json({
            status: "configured",
            message: `Polling setup for ${siem}`,
            next_steps: [
                "Configure SIEM API credentials in environment variables",
                "Set up cron job or scheduled task to call this endpoint",
                "Monitor ingestion logs for errors"
            ],
            example_cron: "*/5 * * * * curl -X POST http://localhost:8001/api/enterprise/ingest/poll -d '{\"siem\":\"splunk\"}'"
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// 5. FILE WATCHER (Directory Monitoring)
// ============================================================================

/**
 * Configure file watcher for log directory
 * POST /api/enterprise/ingest/watch
 * Body: { directory: string, pattern: string }
 */
router.post("/watch", async (req, res) => {
    try {
        const { directory, pattern } = req.body;

        if (!directory) {
            return res.status(400).json({ error: "Directory path required" });
        }

        // Check if directory exists
        try {
            await fs.access(directory);
        } catch {
            return res.status(400).json({ error: "Directory does not exist" });
        }

        res.json({
            status: "configured",
            watching: directory,
            pattern: pattern || "*.json",
            message: "File watcher would be configured here",
            note: "In production, use a proper file watcher library like chokidar"
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        methods: [
            "POST /batch - Batch file ingestion",
            "POST /syslog - Syslog receiver (CEF/LEEF)",
            "POST /webhook - SIEM webhook integration",
            "POST /poll - Scheduled SIEM polling",
            "POST /watch - File directory monitoring"
        ]
    });
});

export const enterpriseIngestionRouter = router;
