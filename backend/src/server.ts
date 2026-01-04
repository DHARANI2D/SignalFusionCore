import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/db";
import { ingestionService } from "./services/ingestion";
import { detectionEngine } from "./detection/engine";
import { simulationEngine } from "./simulation/engine";
import { enterpriseIngestionRouter } from "./services/enterpriseIngestion";
import { threatIntelRouter } from "./routes/threatIntel";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Apps Configuration State (In-Memory)
let appConfig = {
    anomalySensitivity: 75,
    realTimeCorrelation: true,
    emailAlerts: true,
    webhookActive: true
};

app.use(cors());
app.use(express.json());

// Mount enterprise ingestion routes

// Mount threat intelligence routes
app.use("/api/threat-intel", threatIntelRouter);

app.use("/api/enterprise/ingest", enterpriseIngestionRouter);

// --- Configuration API ---
app.get("/api/config", (req, res) => res.json(appConfig));

app.post("/api/config", (req, res) => {
    appConfig = { ...appConfig, ...req.body };
    console.log("⚙️ Config updated:", appConfig);
    res.json(appConfig);
});

// --- System Reset API ---
app.delete("/api/reset", async (req, res) => {
    console.log("⚠️ System Reset Initiated...");
    try {
        await prisma.$transaction([
            prisma.auditLog.deleteMany(),
            prisma.note.deleteMany(),
            prisma.alert.deleteMany(),
            prisma.event.deleteMany(),
        ]);
        console.log("✅ Database cleared.");
        res.json({ success: true });
    } catch (e: any) {
        console.error("Reset failed:", e);
        res.status(500).json({ error: e.message });
    }
});

// --- Simulation API ---
// Simulation endpoint - Enhanced with multiple scenarios
app.post("/api/simulation/run", async (req, res) => {
    try {
        const { count, tactics, intensity } = req.query;

        const config = {
            scenarioCount: count ? parseInt(count as string) : 10,
            tactics: tactics ? (tactics as string).split(',') : undefined,
            intensity: (intensity as 'low' | 'medium' | 'high') || 'medium'
        };

        const result = await simulationEngine.runSimulation(config);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// List all available scenarios
app.get("/api/simulation/scenarios", (req, res) => {
    const scenarios = simulationEngine.listAllScenarios();
    res.json({
        total: simulationEngine.getTotalScenarios(),
        tactics: simulationEngine.getAvailableTactics(),
        scenarios
    });
});

// --- Health Check ---
app.get("/health", (req, res) => {
    res.json({ status: "ok", version: "2.0.0 (Distributed)" });
});

// --- Ingestion API ---
app.post("/api/ingest", async (req, res) => {
    try {
        const { source, log } = req.body;
        if (!source || !log) {
            return res.status(400).json({ error: "Missing source or log" });
        }

        console.log(`📥 Ingesting log from source: ${source}`);
        const event = await ingestionService.ingestRawLog(source as any, log);

        // Run detections synchronously for demo purposes, 
        // in production this would be an async worker process
        const allEvents = await prisma.event.findMany();
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
            eventId: event.id,
            alertsGenerated: detections.length
        });
    } catch (error: any) {
        console.error("Ingestion error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- Alerts API ---
app.get("/api/alerts", async (req, res) => {
    try {
        const alerts = await prisma.alert.findMany({
            orderBy: { createdAt: "desc" },
            take: 50
        });

        // Parse JSON fields for each alert
        const parsedAlerts = alerts.map(alert => ({
            ...alert,
            signals: JSON.parse(alert.signals),
            mitreTactics: JSON.parse(alert.mitreTactics),
            mitreTechniques: JSON.parse(alert.mitreTechniques),
            reasoning: JSON.parse(alert.reasoning),
            matchedEventIds: JSON.parse(alert.matchedEventIds)
        }));

        res.json(parsedAlerts);
    } catch (error: any) {
        console.error("Error fetching alerts:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/alerts/:id", async (req, res) => {
    try {
        const alert = await prisma.alert.findUnique({
            where: { id: req.params.id },
            include: {
                notes: {
                    orderBy: { createdAt: 'desc' }
                },
                auditLogs: {
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!alert) {
            return res.status(404).json({ error: "Alert not found" });
        }

        // Fetch events using matchedEventIds
        let events: any[] = [];
        try {
            const eventIds = JSON.parse(alert.matchedEventIds);
            console.log(`[Alert ${req.params.id}] Event IDs to fetch:`, eventIds);

            if (eventIds && eventIds.length > 0) {
                events = await prisma.event.findMany({
                    where: { id: { in: eventIds } },
                    orderBy: { timestamp: 'asc' }
                });
                console.log(`[Alert ${req.params.id}] Events fetched:`, events.length);
            } else {
                console.log(`[Alert ${req.params.id}] No event IDs to fetch`);
            }
        } catch (e) {
            console.error(`[Alert ${req.params.id}] Error fetching events:`, e);
        }

        // Parse JSON fields for the single alert
        const parsedAlert = {
            ...alert,
            signals: JSON.parse(alert.signals),
            mitreTactics: JSON.parse(alert.mitreTactics),
            mitreTechniques: JSON.parse(alert.mitreTechniques),
            reasoning: JSON.parse(alert.reasoning),
            matchedEventIds: JSON.parse(alert.matchedEventIds)
        };

        // Return alert with events
        res.json({ ...parsedAlert, events });
    } catch (error: any) {
        console.error("Error fetching alert:", error);
        res.status(500).json({ error: error.message });
    }
});

app.patch("/api/alerts/:id/status", async (req, res) => {
    const { status, user } = req.body;
    const alertId = req.params.id;

    const oldAlert = await prisma.alert.findUnique({
        where: { id: alertId },
        select: { status: true }
    });

    if (!oldAlert) return res.status(404).json({ error: "Alert not found" });

    await prisma.$transaction([
        prisma.alert.update({
            where: { id: alertId },
            data: { status },
        }),
        prisma.auditLog.create({
            data: {
                alertId,
                user: user || "System",
                action: "STATUS_CHANGE",
                previousState: oldAlert.status,
                newState: status,
            },
        }),
    ]);

    res.json({ success: true });
});

app.post("/api/alerts/:id/remediate", async (req, res) => {
    const { action, user } = req.body;
    const alertId = req.params.id;

    // In a real system, this would trigger an actual API call to an EDR, IAM, or WAF.
    // Here we simulate the action and log it to the audit trail.
    await prisma.auditLog.create({
        data: {
            alertId,
            user: user || "System Orchestrator",
            action: "REMEDIATION_EXECUTED",
            newState: `Action context: ${action}`,
        },
    });

    res.json({
        success: true,
        message: `Remediation action '${action}' has been initiated and logged.`,
        details: { action, timestamp: new Date() }
    });
});

app.post("/api/alerts/:id/notes", async (req, res) => {
    const { content, user } = req.body;
    const alertId = req.params.id;

    await prisma.$transaction([
        prisma.note.create({
            data: {
                alertId,
                content,
                user: user || "Analyst",
            },
        }),
        prisma.auditLog.create({
            data: {
                alertId,
                user: user || "Analyst",
                action: "ADD_NOTE",
                newState: "Note added",
            },
        }),
    ]);

    res.json({ success: true });
});

app.get("/api/stats", async (req, res) => {
    const totalAlerts = await prisma.alert.count();
    const highSeverity = await prisma.alert.count({ where: { severity: "High" } });
    const mediumSeverity = await prisma.alert.count({ where: { severity: "Medium" } });
    const lowSeverity = await prisma.alert.count({ where: { severity: "Low" } });
    const triageInProgress = await prisma.alert.count({ where: { status: "Triage" } });
    const completedAlerts = await prisma.alert.count({ where: { status: "Closed" } });

    res.json({
        totalAlerts,
        highSeverity,
        mediumSeverity,
        lowSeverity,
        triageInProgress,
        avgTimeToClose: completedAlerts > 0 ? "1.2h" : "--"
    });
});

app.get("/api/analytics", async (req, res) => {
    const alerts = await prisma.alert.findMany();
    const alertCount = alerts.length;

    // Volume over time
    const volume: Record<string, number> = {};
    alerts.forEach(alert => {
        const date = alert.createdAt.toISOString().split('T')[0];
        volume[date] = (volume[date] || 0) + 1;
    });

    // Top Targeted Assets (simulated from user associations)
    const userHits: Record<string, number> = {};
    alerts.forEach(a => {
        const match = a.summary.match(/User ([^ ]+)/);
        if (match) userHits[match[1]] = (userHits[match[1]] || 0) + 1;
    });

    const detectorTypes = new Set(alerts.map(a => {
        if (a.summary.includes('FSM')) return 'FSM';
        if (a.summary.includes('Anomalous')) return 'Behavior';
        if (a.summary.includes('Geo')) return 'Geo';
        return 'Other';
    }));
    const coverage = Math.round((detectorTypes.size / 3) * 100);

    const highMedCount = alerts.filter(a => ['High', 'Medium'].includes(a.severity)).length;
    const precision = alertCount > 0 ? Math.round((highMedCount / alertCount) * 100) : 0;

    // MITRE Tactic Distribution
    const tacticHits: Record<string, number> = {};
    alerts.forEach(a => {
        try {
            const tactics = JSON.parse(a.mitreTactics || "[]") as string[];
            tactics.forEach(t => {
                tacticHits[t] = (tacticHits[t] || 0) + 1;
            });
        } catch (e) { }
    });

    const analytics = {
        volumeTrends: Object.entries(volume).map(([date, count]) => ({ date, count })),
        severityDistribution: [
            { name: 'High', value: alerts.filter(a => a.severity === 'High').length, color: '#ff4d4d' },
            { name: 'Medium', value: alerts.filter(a => a.severity === 'Medium').length, color: '#ff9900' },
            { name: 'Low', value: alerts.filter(a => a.severity === 'Low').length, color: '#4d94ff' },
        ],
        mitreDistribution: Object.entries(tacticHits)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value })),
        performance: {
            mttr: "0m",
            coverage: `${coverage}%`,
            falsePositiveRate: `${(100 - precision).toFixed(1)}%`
        },
        topDetectors: [
            { name: 'FSM-Chain', value: alerts.filter(a => a.summary.includes('FSM')).length },
            { name: 'AnomalousAction', value: alerts.filter(a => a.summary.includes('Anomalous')).length },
            { name: 'GeoVelocity', value: alerts.filter(a => a.summary.includes('Geo')).length },
            { name: 'ThreatIntel', value: alerts.filter(a => a.summary.includes('ThreatIntel')).length },
        ],
        topTargetedAssets: Object.entries(userHits)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, hits]) => ({ name, hits }))
    };

    res.json(analytics);
});

// ============================================================================
// MITRE ATT&CK API
// ============================================================================

// Get all MITRE tactics
app.get("/api/mitre/tactics", async (req, res) => {
    try {
        const tactics = await prisma.mitreTactic.findMany({
            orderBy: { order: 'asc' },
            include: { techniques: true }
        });
        res.json(tactics);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get all MITRE techniques
app.get("/api/mitre/techniques", async (req, res) => {
    try {
        const techniques = await prisma.mitreTechnique.findMany({
            include: { tactic: true, subTechniques: true }
        });
        res.json(techniques);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get techniques by tactic
app.get("/api/mitre/tactics/:tacticId/techniques", async (req, res) => {
    try {
        const tactic = await prisma.mitreTactic.findUnique({
            where: { tacticId: req.params.tacticId },
            include: { techniques: { include: { subTechniques: true } } }
        });
        if (!tactic) return res.status(404).json({ error: "Tactic not found" });
        res.json(tactic.techniques);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// ATTACK SCENARIOS API
// ============================================================================

// Get all scenarios
app.get("/api/scenarios", async (req, res) => {
    try {
        const { enabled, severity, category } = req.query;
        const where: any = {};

        if (enabled !== undefined) where.enabled = enabled === 'true';
        if (severity) where.severity = severity;
        if (category) where.category = category;

        const scenarios = await prisma.attackScenario.findMany({
            where,
            include: { logTemplates: true, techniques: true },
            orderBy: { createdAt: 'desc' }
        });

        const parsed = scenarios.map(s => ({
            ...s,
            tacticNames: JSON.parse(s.tacticNames),
            techniqueNames: JSON.parse(s.techniqueNames),
            tags: s.tags ? JSON.parse(s.tags) : []
        }));

        res.json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get scenario by ID
app.get("/api/scenarios/:id", async (req, res) => {
    try {
        const scenario = await prisma.attackScenario.findUnique({
            where: { id: req.params.id },
            include: { logTemplates: { orderBy: { order: 'asc' } }, techniques: true }
        });

        if (!scenario) return res.status(404).json({ error: "Scenario not found" });

        const parsed = {
            ...scenario,
            tacticNames: JSON.parse(scenario.tacticNames),
            techniqueNames: JSON.parse(scenario.techniqueNames),
            tags: scenario.tags ? JSON.parse(scenario.tags) : []
        };

        res.json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Create new scenario
app.post("/api/scenarios", async (req, res) => {
    try {
        const { name, description, severity, category, tacticNames, techniqueNames, tags, logTemplates } = req.body;

        const scenario = await prisma.attackScenario.create({
            data: {
                scenarioId: `custom-${Date.now()}`,
                name,
                description,
                severity,
                category,
                tacticNames: JSON.stringify(tacticNames || []),
                techniqueNames: JSON.stringify(techniqueNames || []),
                tags: JSON.stringify(tags || []),
                author: 'User',
            }
        });

        res.json(scenario);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// THREAT INTELLIGENCE API
// ============================================================================

// Get all threat intelligence
app.get("/api/threat-intel", async (req, res) => {
    try {
        const { iocType, active, severity } = req.query;
        const where: any = {};

        if (iocType) where.iocType = iocType;
        if (active !== undefined) where.active = active === 'true';
        if (severity) where.severity = severity;

        const intel = await prisma.threatIntelligence.findMany({
            where,
            orderBy: { lastSeen: 'desc' },
            take: 100
        });

        res.json(intel);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add new IOC
app.post("/api/threat-intel", async (req, res) => {
    try {
        const { iocType, iocValue, threatActor, malwareFamily, severity, confidence, source } = req.body;

        const ioc = await prisma.threatIntelligence.create({
            data: {
                iocType,
                iocValue,
                threatActor,
                malwareFamily,
                severity: severity || 'medium',
                confidence: confidence || 'medium',
                source: source || 'manual',
                firstSeen: new Date(),
                lastSeen: new Date(),
                active: true
            }
        });

        res.json(ioc);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// SYSTEM CONFIGURATION API
// ============================================================================

// Get all config (public only for non-admin)
app.get("/api/config", async (req, res) => {
    try {
        const { category, isPublic } = req.query;
        const where: any = {};

        if (category) where.category = category;
        if (isPublic !== undefined) where.isPublic = isPublic === 'true';

        const configs = await prisma.systemConfig.findMany({ where });

        const parsed = configs.map(c => ({
            ...c,
            value: c.dataType === 'json' ? JSON.parse(c.value) : c.value
        }));

        res.json(parsed);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update config
app.patch("/api/config/:key", async (req, res) => {
    try {
        const { value } = req.body;

        const config = await prisma.systemConfig.update({
            where: { key: req.params.key },
            data: {
                value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                updatedBy: 'admin'
            }
        });

        res.json(config);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`🔥 SignalFusion Backend running on http://localhost:${PORT}`);
});

// Import additional routers
import { attackGraphRouter } from "./routes/attackGraph";
import { analyticsRouter } from "./routes/analytics";
import { playbooksRouter } from "./routes/playbooks";

// Mount additional routes
app.use("/api/attack-graph", attackGraphRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/playbooks", playbooksRouter);
