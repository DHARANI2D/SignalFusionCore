import { Router } from 'express';
import { calculateMTTD, calculateMTTR, getAlertTrends, getAllMetrics } from '../services/analytics';

const router = Router();

router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getAllMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mttd', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const mttd = await calculateMTTD(period as any);
    res.json({ mttd, unit: 'seconds', period });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/mttr', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const mttr = await calculateMTTR(period as any);
    res.json({ mttr, unit: 'seconds', period });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/trends', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const trends = await getAlertTrends(Number(days));
    res.json({ trends });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const analyticsRouter = router;
