/**
 * SignalFusion Security Policy Configuration
 * This file centralizes thresholds and indicators for detection logic.
 */

export const SecurityPolicy = {
    // Geo-Velocity Thresholds
    geoVelocity: {
        maxKmPerHour: 800, // Max physical speed for impossible travel
        minConfidence: 0.9
    },

    // Threat Intel Indicators
    threatIntel: {
        maliciousIps: [
            "99.88.77.66",   // Known C2 Infrastructure
            "45.33.22.11",   // Tor Exit Node
            "103.22.11.55",  // Botnet IP
        ],
        suspiciousProcesses: [
            "mimikatz.exe",
            "nc.exe",
            "pingsweep.ps1",
            "cobaltstrike.beacon",
            "psexec.exe",
        ]
    },

    // FSM Chain sensitive sources
    fsmChain: {
        sensitiveSources: ["cloud", "endpoint"],
        maxChainTimeGapMs: 1000 * 60 * 30 // 30 minutes
    }
};
