import express from 'express';
import * as logService from '../services/logService.js';

const router = express.Router();

router.post('/upload', async (req, res, next) => {
  try {
    const { records, filename, fileType } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Records must be an array' });
    }
    if (records.length === 0) {
      return res.status(400).json({ error: 'No records provided' });
    }
    if (records.length > 15000) {
      return res.status(400).json({ error: 'Maximum 15,000 records per upload' });
    }
    const result = await logService.uploadLogs(records, filename, fileType);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await logService.getLogs(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/filters', async (req, res, next) => {
  try {
    const options = await logService.getFilterOptions();
    res.json(options);
  } catch (err) {
    next(err);
  }
});

router.get('/uploads/history', async (req, res, next) => {
  try {
    const history = await logService.getUploadHistory();
    res.json(history);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const log = await logService.getLogById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const log = await logService.updateLog(req.params.id, req.body);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

export default router;
