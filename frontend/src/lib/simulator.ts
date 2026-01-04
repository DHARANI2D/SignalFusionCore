// Global simulator worker that runs independently of React components
// This ensures the simulator continues even when navigating between pages

const SIMULATOR_KEY = 'signalFusion_simulator';
let globalSimulatorInterval: NodeJS.Timeout | null = null;

const generateRandomLog = () => {
    const sources = ["auth", "endpoint", "network", "cloud"];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const isMalicious = Math.random() < 0.3;

    const normalScenarios: any = {
        auth: [{ eventType: "LOGIN_SUCCESS", user: "alice.smith", source_ip: "10.0.1.50", type: "normal" }],
        endpoint: [{ eventType: "PROCESS_START", process: "chrome.exe", user: "alice", hostname: "DESK-001", type: "normal" }],
        network: [{ eventType: "CONNECTION", source_ip: "10.0.1.50", dest_ip: "8.8.8.8", port: 443, type: "normal" }],
        cloud: [{ eventType: "S3_ACCESS", resource: "s3://docs/report.pdf", user: "alice", action: "READ", type: "normal" }]
    };

    const maliciousScenarios: any = {
        auth: [{ eventType: "BRUTE_FORCE", user: "root", source_ip: "185.220.101.45", attempts: 50, type: "malicious" }],
        endpoint: [{ eventType: "PROCESS_START", process: "mimikatz.exe", user: "admin", hostname: "DESK-001", type: "malicious" }],
        network: [{ eventType: "CONNECTION", source_ip: "10.0.0.50", dest_ip: "185.220.101.45", port: 443, type: "malicious" }],
        cloud: [{ eventType: "S3_ACCESS", resource: "s3://sensitive/creds.zip", user: "svc", action: "DOWNLOAD", type: "malicious" }]
    };

    const scenarios = isMalicious ? maliciousScenarios : normalScenarios;
    const logs = scenarios[randomSource];
    const randomLog = logs[Math.floor(Math.random() * logs.length)];
    return { source: randomSource, log: randomLog };
};

const saveSimulatorState = (stats: any, logs: any[], isRunning: boolean) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SIMULATOR_KEY, JSON.stringify({
            stats,
            logs,
            isRunning,
            lastUpdate: new Date().toISOString()
        }));
    }
};

const runSimulatorTick = async () => {
    if (typeof window === 'undefined') return;

    const savedState = localStorage.getItem(SIMULATOR_KEY);
    if (!savedState) {
        stopGlobalSimulator();
        return;
    }

    const state = JSON.parse(savedState);
    if (!state.isRunning || state.stats.totalSent >= 100) {
        saveSimulatorState(state.stats, state.logs, false);
        stopGlobalSimulator();
        return;
    }

    const { source, log } = generateRandomLog();

    try {
        const res = await fetch("http://localhost:8001/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source, log })
        });
        const result = await res.json();

        const newStats = {
            totalSent: state.stats.totalSent + 1,
            successful: state.stats.successful + 1,
            failed: state.stats.failed,
            alertsGenerated: state.stats.alertsGenerated + (result.alertsGenerated || 0)
        };

        const newLog = {
            timestamp: new Date().toISOString(),
            source,
            eventType: log.eventType,
            status: "success",
            alerts: result.alertsGenerated || 0,
            isMalicious: log.type === "malicious",
            details: log.user || log.process || log.domain || log.resource || ""
        };

        const newLogs = [newLog, ...state.logs.slice(0, 19)];
        const isStillRunning = newStats.totalSent < 100;

        saveSimulatorState(newStats, newLogs, isStillRunning);

        if (!isStillRunning) {
            stopGlobalSimulator();
        }
    } catch (error) {
        console.error('Simulator error:', error);
        const newStats = {
            ...state.stats,
            totalSent: state.stats.totalSent + 1,
            failed: state.stats.failed + 1
        };
        saveSimulatorState(newStats, state.logs, state.stats.totalSent + 1 < 100);
    }
};

export const startGlobalSimulator = () => {
    if (globalSimulatorInterval) return; // Already running

    globalSimulatorInterval = setInterval(runSimulatorTick, 1500);
    console.log('✅ Global simulator started');
};

export const stopGlobalSimulator = () => {
    if (globalSimulatorInterval) {
        clearInterval(globalSimulatorInterval);
        globalSimulatorInterval = null;
        console.log('⏹️ Global simulator stopped');
    }
};

export const initializeSimulator = () => {
    if (typeof window === 'undefined') return;

    // Check if simulator should be running on page load
    const savedState = localStorage.getItem(SIMULATOR_KEY);
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.isRunning && state.stats.totalSent < 100) {
            startGlobalSimulator();
        }
    }
};

// Initialize on module load
if (typeof window !== 'undefined') {
    initializeSimulator();
}
