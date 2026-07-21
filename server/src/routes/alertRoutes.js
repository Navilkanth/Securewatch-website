import express from 'express';
import * as logService from '../services/logService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await logService.getLogs({ ...req.query, alertsOnly: 'true' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/dismiss', async (req, res, next) => {
  try {
    const log = await logService.dismissAlert(req.params.id);
    if (!log) return res.status(404).json({ error: 'Alert not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

export default router;
