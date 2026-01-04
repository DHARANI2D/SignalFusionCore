import "dotenv/config";

async function simulate() {
    console.log("🚀 Starting Distributed Attack Simulation Replay...");
    const API_BASE = "http://localhost:8001/api";

    const user = "dharani.s";
    const attackerIp = "99.88.77.66";

    const ingest = async (source: string, log: any) => {
        const res = await fetch(`${API_BASE}/ingest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source, log }),
        });
        if (!res.ok) console.error(`Failed to ingest ${source}:`, await res.text());
        return res.json();
    };

    // --- Attack Pattern 1: Credential Stuffing + Success + Sensitive Action ---
    console.log("--- Simulating Pattern: Credential Stuffing -> Success -> Sensitive Action ---");

    for (let i = 0; i < 5; i++) {
        await ingest("auth", {
            timestamp: new Date(Date.now() - 1000 * 60 * (10 - i)).toISOString(),
            user,
            source_ip: attackerIp,
            result: "FAILED",
            geo_location: "Russia (Simulated)"
        });
    }

    await ingest("auth", {
        timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        user,
        source_ip: attackerIp,
        result: "SUCCESS",
        geo_location: "Russia (Simulated)"
    });

    await ingest("cloud", {
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        action: "IAM_POLICY_UPDATE",
        user,
        resource: "production-iam-role",
        status: "SUCCESS"
    });

    // --- Attack Pattern 2: Impossible Travel ---
    console.log("--- Simulating Pattern: Impossible Travel ---");

    await ingest("auth", {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        user: "alice.w",
        source_ip: "44.33.22.11",
        result: "SUCCESS",
        geo_location: "USA"
    });

    await ingest("auth", {
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        user: "alice.w",
        source_ip: "123.123.123.123",
        result: "SUCCESS",
        geo_location: "Japan"
    });

    // --- Attack Pattern 3: Discovery -> Suspicious Tooling ---
    console.log("--- Simulating Pattern: Discovery -> Suspicious Tooling ---");

    await ingest("endpoint", {
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: "admin.b",
        process: "whoami /all",
        parent_process: "cmd.exe",
        hostname: "finance-ws-01"
    });

    await ingest("endpoint", {
        timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString(),
        user: "admin.b",
        process: "powershell -enc JABzAD0ATgBlAHcALQBPAA...",
        parent_process: "cmd.exe",
        hostname: "finance-ws-01"
    });

    console.log("✅ Simulation requests sent to Backend API.");
}

simulate().catch(console.error);
