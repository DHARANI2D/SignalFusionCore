import { Router } from 'express';
import { buildAttackGraph, detectAttackChains, exportGraph } from '../services/attackGraph';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const start = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    const end = new Date();
    
    const graph = await buildAttackGraph({ start, end });
    res.json(graph);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chains', async (req, res) => {
  try {
    const chains = await detectAttackChains();
    res.json({ count: chains.length, chains });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/export', async (req, res) => {
  try {
    const { format = 'cytoscape' } = req.query;
    const data = await exportGraph(format as any);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const attackGraphRouter = router;
