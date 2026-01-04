import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Calculate Mean Time To Detect
export async function calculateMTTD(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const periodMs = period === 'daily' ? 24 * 60 * 60 * 1000 : period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    const alerts = await prisma.alert.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - periodMs) }
        }
    });

    if (alerts.length === 0) return 0;

    const totalTime = alerts.reduce((sum, alert) => {
        const detectionTime = alert.createdAt.getTime() - (alert.startTime?.getTime() || alert.createdAt.getTime());
        return sum + detectionTime;
    }, 0);

    return totalTime / alerts.length / 1000; // seconds
}

// Calculate Mean Time To Respond
export async function calculateMTTR(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const periodMs = period === 'daily' ? 24 * 60 * 60 * 1000 : period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

    const resolvedAlerts = await prisma.alert.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - periodMs) },
            status: { in: ['Resolved', 'Closed'] }
        }
    });

    if (resolvedAlerts.length === 0) return 0;

    const totalTime = resolvedAlerts.reduce((sum, alert) => {
        const responseTime = alert.updatedAt.getTime() - alert.createdAt.getTime();
        return sum + responseTime;
    }, 0);

    return totalTime / resolvedAlerts.length / 1000; // seconds
}

// Get alert trends
export async function getAlertTrends(days: number = 7) {
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - i);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const count = await prisma.alert.count({
            where: {
                createdAt: { gte: start, lte: end }
            }
        });

        const bySeverity = await prisma.alert.groupBy({
            by: ['severity'],
            _count: true,
            where: {
                createdAt: { gte: start, lte: end }
            }
        });

        trends.push({
            date: start.toISOString().split('T')[0],
            total: count,
            bySeverity: bySeverity.reduce((acc, s) => ({ ...acc, [s.severity]: s._count }), {})
        });
    }

    return trends;
}

// Get top techniques
export async function getTopTechniques(limit: number = 10) {
    const alerts = await prisma.alert.findMany({
        where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
    });

    const techniqueCounts = new Map<string, number>();

    for (const alert of alerts) {
        if (alert.mitreTechniques) {
            const techniques = JSON.parse(alert.mitreTechniques);
            for (const tech of techniques) {
                techniqueCounts.set(tech, (techniqueCounts.get(tech) || 0) + 1);
            }
        }
    }

    return Array.from(techniqueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([technique, count]) => ({ technique, count }));
}

// Get all metrics
export async function getAllMetrics() {
    const [mttd, mttr, alertVolume, trends, topTechniques] = await Promise.all([
        calculateMTTD('daily'),
        calculateMTTR('daily'),
        prisma.alert.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
        getAlertTrends(7),
        getTopTechniques(10)
    ]);

    return {
        mttd,
        mttr,
        alertVolume24h: alertVolume,
        trends,
        topTechniques
    };
}
