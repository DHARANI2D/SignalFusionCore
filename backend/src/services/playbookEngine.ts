import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Evaluate if a specific alert matches a playbook's trigger
export function matchesTrigger(playbook: any, alert: any) {
    try {
        const trigger = typeof playbook.trigger === 'string' ? JSON.parse(playbook.trigger) : playbook.trigger;

        // Severity check
        if (trigger.severity && alert.severity !== trigger.severity) return false;

        // Technique check
        if (trigger.technique) {
            const techniques = typeof alert.mitreTechniques === 'string' ? JSON.parse(alert.mitreTechniques) : alert.mitreTechniques;
            if (!techniques?.includes(trigger.technique)) return false;
        }

        // Risk score check
        if (trigger.riskScore && (alert.riskScore || 0) < trigger.riskScore) return false;

        // Detector check
        if (trigger.detector && alert.detectorName !== trigger.detector) return false;

        return true;
    } catch (e) {
        console.error("Error evaluating trigger:", e);
        return false;
    }
}

// Evaluate all playbooks against an alert
export async function evaluateTriggers(alert: any) {
    const playbooks = await prisma.playbook.findMany({
        where: { enabled: true },
        include: { actions: { orderBy: { order: 'asc' } } },
        orderBy: { priority: 'desc' }
    });

    const matchedPlaybooks = [];

    for (const playbook of playbooks) {
        if (matchesTrigger(playbook, alert)) {
            matchedPlaybooks.push(playbook);
        }
    }

    return matchedPlaybooks;
}

// Execute playbook
export async function executePlaybook(playbookId: string, alert: any, triggeredBy: string = 'auto') {
    const playbook = await prisma.playbook.findUnique({
        where: { id: playbookId },
        include: { actions: { orderBy: { order: 'asc' } } }
    });

    if (!playbook) throw new Error('Playbook not found');

    const execution = await prisma.playbookExecution.create({
        data: {
            playbookId,
            alertId: alert.id,
            triggeredBy,
            status: 'running',
            startTime: new Date(),
            results: JSON.stringify([]),
            context: JSON.stringify(alert)
        }
    });

    const results = [];

    for (const action of playbook.actions) {
        try {
            const result = await executeAction(action, alert);
            results.push({ action: action.name, status: 'success', output: result });
        } catch (error: any) {
            results.push({ action: action.name, status: 'failed', error: error.message });

            await prisma.playbookExecution.update({
                where: { id: execution.id },
                data: {
                    status: 'failed',
                    endTime: new Date(),
                    error: error.message,
                    failedAction: action.name,
                    results: JSON.stringify(results)
                }
            });

            return execution;
        }
    }

    await prisma.playbookExecution.update({
        where: { id: execution.id },
        data: {
            status: 'completed',
            endTime: new Date(),
            results: JSON.stringify(results)
        }
    });

    await prisma.playbook.update({
        where: { id: playbookId },
        data: {
            executionCount: { increment: 1 },
            successCount: { increment: 1 }
        }
    });

    return execution;
}

// Simulate playbook
export async function simulatePlaybook(playbookData: any, alertId: string) {
    const alert = await prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) throw new Error('Alert not found');

    const matched = matchesTrigger(playbookData, alert);

    return {
        matched,
        alertSummary: alert.summary,
        alertSeverity: alert.severity,
        actions: playbookData.actions || [],
        predictedOutcome: matched ? 'Playbook would execute ' + (playbookData.actions?.length || 0) + ' actions' : 'Playbook would not trigger for this alert'
    };
}

// Retroactive execution
export async function executeRetroactive(playbookId: string) {
    const playbook = await prisma.playbook.findUnique({
        where: { id: playbookId },
        include: { actions: { orderBy: { order: 'asc' } } }
    });

    if (!playbook) throw new Error('Playbook not found');

    const alerts = await prisma.alert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to last 100 alerts for safety
    });

    const matches = [];
    for (const alert of alerts) {
        if (matchesTrigger(playbook, alert)) {
            matches.push(alert);
        }
    }

    const executions = [];
    for (const alert of matches) {
        const execution = await executePlaybook(playbook.id, alert, 'retroactive');
        executions.push(execution);
    }

    return {
        alertsAnalyzed: alerts.length,
        matchesFound: matches.length,
        executionsTriggered: executions.length
    };
}

// Execute individual action
async function executeAction(action: any, context: any) {
    const params = typeof action.parameters === 'string' ? JSON.parse(action.parameters) : action.parameters;

    switch (action.actionType) {
        case 'isolate_host':
            console.log(`🔒 Isolating host: ${params.hostname || context.hostName}`);
            return { isolated: true, host: params.hostname || context.hostName };

        case 'block_ip':
            console.log(`🚫 Blocking IP: ${params.ip || context.sourceIp}`);
            return { blocked: true, ip: params.ip || context.sourceIp };

        case 'notify_slack':
            console.log(`📢 Sending Slack notification: ${params.message}`);
            return { notified: true, channel: params.channel };

        case 'create_ticket':
            console.log(`🎫 Creating ticket: ${params.title}`);
            return { ticketId: `TICKET-${Date.now()}`, title: params.title };

        default:
            throw new Error(`Unknown action type: ${action.actionType}`);
    }
}

// Create approval request for playbook execution
export async function createApprovalRequest(playbookId: string, alertId: string) {
    const approval = await prisma.playbookApproval.create({
        data: {
            playbookId,
            alertId,
            status: 'pending',
            requestedAt: new Date()
        }
    });

    console.log(`📋 Created approval request ${approval.id} for playbook ${playbookId}`);
    return approval;
}
