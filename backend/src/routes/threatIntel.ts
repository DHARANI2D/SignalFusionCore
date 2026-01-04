import { Router } from 'express';
import { lookupIOC, enrichEvent, enrichEvents, updateThreatFeeds, getThreatIntelStats } from '../services/threatIntel';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// IOC LOOKUP
// ============================================================================

router.get('/ioc/:value', async (req, res) => {
    try {
        const { value } = req.params;
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ error: 'IOC type is required (ip, domain, hash, url, email)' });
        }

        const result = await lookupIOC(value, type as string);

        if (!result) {
            return res.json({ found: false, iocValue: value, iocType: type });
        }

        res.json(result);
    } catch (error: any) {
        console.error('IOC lookup error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// ENRICH EVENTS
// ============================================================================

router.post('/enrich', async (req, res) => {
    try {
        const { eventIds } = req.body;

        if (!eventIds || !Array.isArray(eventIds)) {
            return res.status(400).json({ error: 'eventIds array is required' });
        }

        // Fetch events
        const events = await prisma.event.findMany({
            where: {
                id: { in: eventIds }
            }
        });

        // Enrich each event
        const results = await enrichEvents(events);

        res.json({
            enriched: results.length,
            results
        });
    } catch (error: any) {
        console.error('Enrichment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// GET IOC MATCHES
// ============================================================================

router.get('/matches', async (req, res) => {
    try {
        const { limit = 100, severity, eventId } = req.query;

        const where: any = {};
        if (severity) where.severity = severity;
        if (eventId) where.eventId = eventId;

        const matches = await prisma.iOCMatch.findMany({
            where,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            count: matches.length,
            matches
        });
    } catch (error: any) {
        console.error('Get matches error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// UPDATE THREAT FEEDS
// ============================================================================

router.post('/feeds/update', async (req, res) => {
    try {
        const result = await updateThreatFeeds();

        res.json({
            success: true,
            ...result,
            message: `Updated ${result.updated} IOCs, added ${result.added} new IOCs`
        });
    } catch (error: any) {
        console.error('Feed update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// GET STATISTICS
// ============================================================================

router.get('/stats', async (req, res) => {
    try {
        const stats = await getThreatIntelStats();
        res.json(stats);
    } catch (error: any) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================================
// MANAGE THREAT INTELLIGENCE
// ============================================================================

// Add new IOC
router.post('/ioc', async (req, res) => {
    try {
        const { iocType, iocValue, threatActor, malwareFamily, severity, confidence, source, tags, notes } = req.body;

        if (!iocType || !iocValue) {
            return res.status(400).json({ error: 'iocType and iocValue are required' });
        }

        const ioc = await prisma.threatIntelligence.create({
            data: {
                iocType,
                iocValue,
                threatActor,
                malwareFamily,
                severity: severity || 'medium',
                confidence: confidence || 'medium',
                source: source || 'manual',
                tags: tags ? JSON.stringify(tags) : null,
                notes,
                firstSeen: new Date(),
                lastSeen: new Date()
            }
        });

        res.json({ success: true, ioc });
    } catch (error: any) {
        console.error('Add IOC error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete IOC
router.delete('/ioc/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.threatIntelligence.delete({
            where: { id }
        });

        res.json({ success: true, message: 'IOC deleted' });
    } catch (error: any) {
        console.error('Delete IOC error:', error);
        res.status(500).json({ error: error.message });
    }
});

export const threatIntelRouter = router;
