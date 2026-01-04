export type Severity = "low" | "medium" | "high";
export type SourceType = "auth" | "endpoint" | "network" | "cloud";
export type AlertStatus = "New" | "Triage" | "In Progress" | "Closed";

export interface Actor {
  user?: string;
  process?: string;
  service?: string;
}

export interface Network {
  sourceIp?: string;
  destIp?: string;
  geo?: string;
}

export interface UnifiedEvent {
  id: string;
  timestamp: Date;
  ingestedAt: Date;
  source: SourceType;
  eventType: string;
  actor: Actor;
  network: Network;
  severityHint: Severity;
  confidenceHint: number;
  metadata: Record<string, any>;
}

export interface Detection {
  detector: string;
  matchedEvents: UnifiedEvent[];
  signals: string[];
  confidence: number;
  reasoning: string[];
}

export interface Detector {
  name: string;
  description: string;
  run(events: UnifiedEvent[]): Detection[];
}

export interface Alert {
  id: string;
  severity: "Low" | "Medium" | "High";
  score: number;
  confidence: number;
  status: AlertStatus;
  summary: string;
  reasoning: string;
  signals: string[];
  recommendedActions: string[];
  createdAt: Date;
  updatedAt: Date;
}
