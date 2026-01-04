import { ingestionService } from '../services/ingestion';
import { detectionEngine } from '../detection/engine';
import { SimulationScenario, SimulationConfig } from './types';

// Import all scenario collections
import { initialAccessScenarios } from './scenarios/initialAccess';
import { executionScenarios } from './scenarios/execution';
import { persistenceScenarios } from './scenarios/persistence';
import { privilegeEscalationScenarios } from './scenarios/privilegeEscalation';
import { defenseEvasionScenarios } from './scenarios/defenseEvasion';
import { credentialAccessScenarios } from './scenarios/credentialAccess';
import { discoveryScenarios } from './scenarios/discovery';
import { lateralMovementScenarios } from './scenarios/lateralMovement';
import { collectionScenarios } from './scenarios/collection';
import { exfiltrationScenarios } from './scenarios/exfiltration';
import { commandControlScenarios } from './scenarios/commandControl';
import { impactScenarios } from './scenarios/impact';

/**
 * Enhanced Simulation Engine
 * Orchestrates diverse attack scenarios with configurable parameters
 */
class SimulationEngine {
    private allScenarios: SimulationScenario[];
    private scenariosByTactic: Map<string, SimulationScenario[]>;

    constructor() {
        // Combine all scenarios
        this.allScenarios = [
            ...initialAccessScenarios,
            ...executionScenarios,
            ...persistenceScenarios,
            ...privilegeEscalationScenarios,
            ...defenseEvasionScenarios,
            ...credentialAccessScenarios,
            ...discoveryScenarios,
            ...lateralMovementScenarios,
            ...collectionScenarios,
            ...exfiltrationScenarios,
            ...commandControlScenarios,
            ...impactScenarios
        ];

        // Index by tactic for quick lookup
        this.scenariosByTactic = new Map();
        this.allScenarios.forEach(scenario => {
            scenario.mitreTactics.forEach(tactic => {
                if (!this.scenariosByTactic.has(tactic)) {
                    this.scenariosByTactic.set(tactic, []);
                }
                this.scenariosByTactic.get(tactic)!.push(scenario);
            });
        });
    }

    /**
     * Get total number of available scenarios
     */
    getTotalScenarios(): number {
        return this.allScenarios.length;
    }

    /**
     * Get all available MITRE tactics
     */
    getAvailableTactics(): string[] {
        return Array.from(this.scenariosByTactic.keys());
    }

    /**
     * Run simulation with configuration
     */
    async runSimulation(config: SimulationConfig = {}): Promise<{
        logs: string[];
        scenariosExecuted: string[];
        totalAlerts: number;
    }> {
        const logs: string[] = [];
        const scenariosExecuted: string[] = [];

        logs.push('🚀 Starting Enhanced Attack Simulation...');
        logs.push(`📊 Total Available Scenarios: ${this.allScenarios.length}`);
        logs.push('');

        // Determine scenarios to run
        let scenariosToRun: SimulationScenario[] = [];

        if (config.tactics && config.tactics.length > 0) {
            // Filter by specific tactics
            config.tactics.forEach(tactic => {
                const tacticScenarios = this.scenariosByTactic.get(tactic) || [];
                scenariosToRun.push(...tacticScenarios);
            });
            logs.push(`🎯 Running scenarios for tactics: ${config.tactics.join(', ')}`);
        } else {
            // Random selection
            const count = config.scenarioCount || 10;
            scenariosToRun = this.selectRandomScenarios(count, config.intensity);
            logs.push(`🎲 Randomly selected ${count} scenarios`);
        }

        logs.push(`⚡ Intensity: ${config.intensity || 'medium'}`);
        logs.push('');

        // Execute each scenario
        for (const scenario of scenariosToRun) {
            logs.push(`--- ${scenario.name} (${scenario.id}) ---`);
            logs.push(`📝 ${scenario.description}`);
            logs.push(`🎯 Tactics: ${scenario.mitreTactics.join(', ')}`);
            logs.push(`⚠️  Severity: ${scenario.severity}`);

            // Ingest logs for this scenario
            for (const log of scenario.logs) {
                if (log.delayMs) {
                    await this.delay(log.delayMs);
                }

                const event = await ingestionService.ingestRawLog(log.source, log.data);
                logs.push(`  ✅ Ingested event: ${event.id.substring(0, 8)}... [${log.source}]`);
            }

            scenariosExecuted.push(scenario.name);
            logs.push('');
        }

        // Fetch all events from database for detection
        logs.push('📥 Fetching ingested events from database...');
        const { prisma } = await import('../lib/db');
        const dbEvents = await prisma.event.findMany({
            orderBy: { timestamp: 'asc' }
        });

        // Convert to UnifiedEvent format
        const events: any[] = dbEvents.map(e => ({
            id: e.id,
            timestamp: e.timestamp,
            source: e.source,
            eventType: e.eventType,
            actor: {
                user: e.user || undefined,
                process: e.process || undefined,
                service: e.service || undefined
            },
            network: {
                sourceIp: e.sourceIp || undefined,
                destIp: e.destIp || undefined,
                geo: e.geo || undefined
            },
            metadata: e.metadata as any
        }));

        logs.push(`  Found ${events.length} events to analyze`);

        // Run detection engine
        logs.push('🔍 Running Detection Engine...');
        const alerts = await detectionEngine.runDetections(events);
        logs.push(`✅ Detection Complete: Generated ${alerts.length} alerts.`);
        logs.push('');
        logs.push('✅ Simulation Complete.');

        return {
            logs,
            scenariosExecuted,
            totalAlerts: alerts.length
        };
    }

    /**
     * Select random scenarios based on intensity
     */
    private selectRandomScenarios(count: number, intensity?: string): SimulationScenario[] {
        let pool = [...this.allScenarios];

        // Filter by intensity/severity
        if (intensity === 'high') {
            pool = pool.filter(s => s.severity === 'High');
        } else if (intensity === 'low') {
            pool = pool.filter(s => s.severity === 'Low' || s.severity === 'Medium');
        }

        // Shuffle and select
        const shuffled = pool.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    /**
     * Get scenario by ID
     */
    getScenarioById(id: string): SimulationScenario | undefined {
        return this.allScenarios.find(s => s.id === id);
    }

    /**
     * Get scenarios by tactic
     */
    getScenariosByTactic(tactic: string): SimulationScenario[] {
        return this.scenariosByTactic.get(tactic) || [];
    }

    /**
     * List all scenarios
     */
    listAllScenarios(): Array<{ id: string, name: string, tactics: string[], severity: string }> {
        return this.allScenarios.map(s => ({
            id: s.id,
            name: s.name,
            tactics: s.mitreTactics,
            severity: s.severity
        }));
    }

    /**
     * Utility delay function
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const simulationEngine = new SimulationEngine();
