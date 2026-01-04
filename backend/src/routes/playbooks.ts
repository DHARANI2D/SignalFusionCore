import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { evaluateTriggers, executePlaybook, simulatePlaybook, executeRetroactive } from '../services/playbookEngine';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const playbooks = await prisma.playbook.findMany({
      include: { actions: { orderBy: { order: 'asc' } } }
    });
    res.json({ count: playbooks.length, playbooks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { actions, ...playbookData } = req.body;

    const playbook = await prisma.playbook.create({
      data: {
        ...playbookData,
        trigger: typeof playbookData.trigger === 'string' ? playbookData.trigger : JSON.stringify(playbookData.trigger),
        actions: {
          create: (actions || []).map((action: any, index: number) => ({
            ...action,
            order: action.order ?? index,
            parameters: typeof action.parameters === 'string' ? action.parameters : JSON.stringify(action.parameters),
            condition: action.condition ? (typeof action.condition === 'string' ? action.condition : JSON.stringify(action.condition)) : null
          }))
        }
      },
      include: { actions: true }
    });

    res.json({ success: true, playbook });
  } catch (error: any) {
    console.error("Error creating playbook:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { alert } = req.body;

    const execution = await executePlaybook(id, alert, 'manual');
    res.json({ success: true, execution });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/simulate', async (req, res) => {
  try {
    const { playbook, alertId } = req.body;
    const result = await simulatePlaybook(playbook, alertId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/retroactive', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await executeRetroactive(id);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/executions', async (req, res) => {
  try {
    const executions = await prisma.playbookExecution.findMany({
      take: 50,
      orderBy: { startTime: 'desc' },
      include: { playbook: true }
    });
    res.json({ count: executions.length, executions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const playbooksRouter = router;
