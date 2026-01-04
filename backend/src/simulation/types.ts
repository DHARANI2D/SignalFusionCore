/**
 * Simulation Scenario Types
 * Defines the structure for attack scenarios
 */

export interface SimulationScenario {
    id: string;
    name: string;
    description: string;
    mitreTactics: string[];
    mitreTechniques: string[];
    severity: 'Low' | 'Medium' | 'High';
    logs: ScenarioLog[];
}

export interface ScenarioLog {
    source: 'auth' | 'endpoint' | 'network' | 'cloud';
    data: any;
    delayMs?: number; // Delay before ingesting this log
}

export interface SimulationConfig {
    scenarioCount?: number;
    tactics?: string[];
    intensity?: 'low' | 'medium' | 'high';
    includeNoise?: boolean;
}
