import express from 'express';
import * as logService from '../services/logService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const analytics = await logService.getAnalytics();
    res.json(analytics);
  } catch (err) {
    next(err);
  }
});

export default router;
