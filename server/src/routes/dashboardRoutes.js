import express from 'express';
import * as logService from '../services/logService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const stats = await logService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
