import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// ATTACK GRAPH BUILDER
// ============================================================================

export interface GraphNode {
    id: string;
    type: string;
    label: string;
    data: any;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type: string;
}

export async function buildAttackGraph(timeRange: { start: Date; end: Date }) {
    // Fetch alerts in time range
    const alerts = await prisma.alert.findMany({
        where: {
            createdAt: {
                gte: timeRange.start,
                lte: timeRange.end
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeMap = new Map<string, string>(); // entity -> nodeId

    for (const alert of alerts) {
        // Create alert node
        const alertNode = await prisma.attackNode.create({
            data: {
                nodeType: 'alert',
                label: alert.summary,
                alertId: alert.id,
                technique: alert.mitreTechniques ? JSON.parse(alert.mitreTechniques)[0] : null,
                tactic: alert.mitreTactics ? JSON.parse(alert.mitreTactics)[0] : null,
                severity: alert.severity,
                riskScore: alert.riskScore || 0,
                timestamp: alert.createdAt,
                metadata: JSON.stringify({
                    detector: alert.detectorName,
                    confidence: alert.confidence,
                    user: alert.user,
                    host: alert.hostName,
                    ip: alert.sourceIp
                })
            }
        });

        nodes.push({
            id: alertNode.id,
            type: 'alert',
            label: alert.summary,
            data: alertNode
        });

        // Create entity nodes and edges
        const entities: Array<{ type: string; value: string }> = [];

        if (alert.user) entities.push({ type: 'user', value: alert.user });
        if (alert.hostName) entities.push({ type: 'host', value: alert.hostName });
        if (alert.sourceIp) entities.push({ type: 'ip', value: alert.sourceIp });
        if (alert.processName) entities.push({ type: 'process', value: alert.processName });

        for (const entity of entities) {
            const entityKey = `${entity.type}:${entity.value}`;

            let entityNodeId = nodeMap.get(entityKey);

            if (!entityNodeId) {
                const entityNode = await prisma.attackNode.create({
                    data: {
                        nodeType: 'entity',
                        label: entity.value,
                        entityType: entity.type,
                        entityValue: entity.value,
                        severity: 'low',
                        timestamp: alert.createdAt,
                        metadata: JSON.stringify({ type: entity.type })
                    }
                });

                entityNodeId = entityNode.id;
                nodeMap.set(entityKey, entityNodeId);

                nodes.push({
                    id: entityNodeId,
                    type: 'entity',
                    label: entity.value,
                    data: entityNode
                });
            }

            // Create edge from entity to alert
            const edge = await prisma.attackEdge.create({
                data: {
                    sourceId: entityNodeId,
                    targetId: alertNode.id,
                    edgeType: 'causal',
                    relationship: 'triggered',
                    timestamp: alert.createdAt
                }
            });

            edges.push({
                id: edge.id,
                source: entityNodeId,
                target: alertNode.id,
                type: 'causal'
            });
        }
    }

    return { nodes, edges };
}

// ============================================================================
// ATTACK CHAIN DETECTION
// ============================================================================

export async function detectAttackChains() {
    // Simple chain detection: group alerts by user/host within time window
    const recentAlerts = await prisma.alert.findMany({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    const chains: Map<string, any[]> = new Map();

    for (const alert of recentAlerts) {
        const key = alert.user || alert.hostName || alert.sourceIp || 'unknown';

        if (!chains.has(key)) {
            chains.set(key, []);
        }

        chains.get(key)!.push(alert);
    }

    const detectedChains = [];

    for (const [entity, alerts] of chains.entries()) {
        if (alerts.length >= 2) {
            // Multiple alerts for same entity = potential chain
            const tactics = new Set<string>();
            const techniques = new Set<string>();
            let maxSeverity = 'low';
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };

            for (const alert of alerts) {
                if (alert.mitreTactics) {
                    JSON.parse(alert.mitreTactics).forEach((t: string) => tactics.add(t));
                }
                if (alert.mitreTechniques) {
                    JSON.parse(alert.mitreTechniques).forEach((t: string) => techniques.add(t));
                }
                if (severityOrder[alert.severity as keyof typeof severityOrder] > severityOrder[maxSeverity as keyof typeof severityOrder]) {
                    maxSeverity = alert.severity;
                }
            }

            const chain = await prisma.attackChain.create({
                data: {
                    name: `Attack Chain on ${entity}`,
                    description: `Detected ${alerts.length} related alerts`,
                    startTime: alerts[0].createdAt,
                    endTime: alerts[alerts.length - 1].createdAt,
                    severity: maxSeverity,
                    tactics: JSON.stringify(Array.from(tactics)),
                    techniques: JSON.stringify(Array.from(techniques)),
                    nodeIds: JSON.stringify(alerts.map(a => a.id)),
                    riskScore: alerts.reduce((sum, a) => sum + (a.riskScore || 0), 0) / alerts.length
                }
            });

            detectedChains.push(chain);
        }
    }

    return detectedChains;
}

// ============================================================================
// EXPORT GRAPH
// ============================================================================

export async function exportGraph(format: 'json' | 'cytoscape' = 'cytoscape') {
    const nodes = await prisma.attackNode.findMany({
        include: {
            sourceEdges: true,
            targetEdges: true
        }
    });

    const edges = await prisma.attackEdge.findMany();

    if (format === 'cytoscape') {
        const limitedNodes = nodes.slice(0, 500); // Limit to 500 nodes for performance
        const limitedNodeIds = new Set(limitedNodes.map(n => n.id));
        const filteredEdges = edges.filter(e => limitedNodeIds.has(e.sourceId) && limitedNodeIds.has(e.targetId));

        return {
            elements: {
                nodes: limitedNodes.map(n => {
                    let metadata = {};
                    try {
                        metadata = n.metadata ? JSON.parse(n.metadata) : {};
                    } catch (e) {
                        console.error(`Error parsing metadata for node ${n.id}:`, e);
                    }
                    return {
                        data: {
                            id: n.id,
                            label: n.label,
                            type: n.nodeType,
                            severity: n.severity,
                            ...metadata
                        }
                    };
                }),
                edges: filteredEdges.map(e => ({
                    data: {
                        id: e.id,
                        source: e.sourceId,
                        target: e.targetId,
                        type: e.edgeType,
                        weight: e.weight
                    }
                }))
            }
        };
    }

    return { nodes, edges };
}
