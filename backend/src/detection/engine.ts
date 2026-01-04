import { prisma } from "../lib/db";
import { UnifiedEvent, Detector, Detection } from "../types";
import { GeoVelocityDetector } from "./detectors/geoVelocity";
import { FSMChainDetector } from "./detectors/fsmChain";
import { AnomalousActionDetector } from "./detectors/anomalousAction";
import { ThreatIntelDetector } from "./detectors/threatIntel";
import { ReconnaissanceDetector } from "./detectors/reconnaissance";
import { CredentialHarvestingDetector } from "./detectors/credentialHarvesting";
import { LateralMovementDetector } from "./detectors/lateralMovement";
import { DataExfiltrationDetector } from "./detectors/dataExfiltration";
import { PersistenceDetector } from "./detectors/persistenceDetector";
import { DefenseEvasionDetector } from "./detectors/defenseEvasionDetector";
import { ImpactDetector } from "./detectors/impactDetector";

export class DetectionEngine {
    private detectors: Detector[] = [];

    constructor() {
        // Original detectors
        this.registerDetector(new GeoVelocityDetector());
        this.registerDetector(new FSMChainDetector());
        this.registerDetector(new AnomalousActionDetector());
        this.registerDetector(new ThreatIntelDetector());

        // New detectors for comprehensive MITRE coverage
        this.registerDetector(new ReconnaissanceDetector());
        this.registerDetector(new CredentialHarvestingDetector());
        this.registerDetector(new LateralMovementDetector());
        this.registerDetector(new DataExfiltrationDetector());
        this.registerDetector(new PersistenceDetector());
        this.registerDetector(new DefenseEvasionDetector());
        this.registerDetector(new ImpactDetector());
    }

    registerDetector(detector: Detector) {
        this.detectors.push(detector);
    }

    async runDetections(events: UnifiedEvent[]) {
        const allDetections: Detection[] = [];

        for (const detector of this.detectors) {
            const detections = detector.run(events);
            allDetections.push(...detections);
        }

        // Enrich detections with enterprise fields
        const enrichedDetections = allDetections.map(detection => {
            // Calculate base risk score from confidence
            let baseRiskScore = detection.confidence * 100;

            // Apply multipliers based on signal severity
            let severityMultiplier = 1;
            const signals = detection.signals.map(s => s.toLowerCase());

            // Check for critical signals
            if (signals.some(s => s.includes('ransomware') || s.includes('credential_dumping') ||
                s.includes('mimikatz') || s.includes('data_destruction'))) {
                severityMultiplier = 10;
            }
            // Check for high severity signals
            else if (signals.some(s => s.includes('lateral_movement') || s.includes('exfiltration') ||
                s.includes('persistence') || s.includes('privilege_escalation') || s.includes('malware'))) {
                severityMultiplier = 7;
            }
            // Check for medium severity signals
            else if (signals.some(s => s.includes('reconnaissance') || s.includes('discovery') ||
                s.includes('suspicious') || s.includes('anomalous'))) {
                severityMultiplier = 4;
            }
            // Low severity
            else {
                severityMultiplier = 2;
            }

            const riskScore = Math.min(baseRiskScore * severityMultiplier, 1000);

            const user = detection.matchedEvents[0]?.actor?.user;
            const sourceIp = detection.matchedEvents[0]?.network?.sourceIp;

            return {
                ...detection,
                riskScore,
                riskObject: sourceIp || user || 'unknown',
                riskObjectType: sourceIp ? 'system' : user ? 'user' : 'unknown',
                user: user,
                ruleId: `${detection.detector}@@${Date.now()}`,
                ruleName: `${detection.detector}_Detection`
            };
        });

        // Create alerts
        for (const detection of enrichedDetections) {
            const severity = this.calculateSeverity(detection.riskScore);
            const riskMessage = this.generateRiskMessage(detection);

            await prisma.alert.create({
                data: {
                    summary: `${detection.detector}: ${detection.reasoning[0]}`,
                    severity,
                    confidence: detection.confidence,
                    signals: JSON.stringify(detection.signals),
                    mitreTactics: JSON.stringify(detection.mitreTactics || []),
                    mitreTechniques: JSON.stringify(detection.mitreTechniques || []),
                    reasoning: JSON.stringify(detection.reasoning),
                    matchedEventIds: JSON.stringify(detection.matchedEvents.map(e => e.id)),
                    detectorName: detection.detector,

                    riskScore: detection.riskScore,
                    riskMessage: riskMessage,
                    riskObject: detection.riskObject,
                    riskObjectType: detection.riskObjectType,
                    threatObject: detection.threatObject,
                    threatObjectType: detection.threatObjectType,

                    user: detection.user,
                    userEmail: detection.userEmail,
                    userBunit: detection.userBunit,
                    userCategory: detection.userCategory,

                    ruleId: detection.ruleId,
                    ruleName: detection.ruleName,
                    previousNotableCount: detection.previousNotableCount || 0,

                    iocType: detection.iocType,
                    iocValue: detection.iocValue,
                    threatActor: detection.threatActor,
                    campaignName: detection.campaignName,

                    startTime: detection.matchedEvents[0]?.timestamp,
                    priority: severity === 'Critical' ? 'High' : severity === 'High' ? 'Medium' : 'Low'
                }
            });
        }

        return enrichedDetections;
    }

    private calculateSeverity(riskScore: number): string {
        if (riskScore >= 700) return "Critical";
        if (riskScore >= 400) return "High";
        if (riskScore >= 100) return "Medium";
        return "Low";
    }

    private generateRiskMessage(detection: Detection & { riskScore: number }): string {
        if (detection.threatObject) {
            return `A ${detection.threatObjectType || 'threat indicator'} matched a threat intelligence indicator: ${detection.threatObject}`;
        }

        const primarySignal = detection.signals[0] || 'suspicious activity';
        const technique = (detection.mitreTechniques && detection.mitreTechniques[0]) || 'unknown technique';

        return `Detected ${primarySignal} associated with ${technique}`;
    }
}

export const detectionEngine = new DetectionEngine();
