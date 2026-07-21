import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from '../server/src/config/db.js';
import logRoutes from '../server/src/routes/logRoutes.js';
import dashboardRoutes from '../server/src/routes/dashboardRoutes.js';
import analyticsRoutes from '../server/src/routes/analyticsRoutes.js';
import alertRoutes from '../server/src/routes/alertRoutes.js';
import Log from '../server/src/models/Log.js';
import { seedData } from '../server/src/scripts/seed.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));

let isConnected = false;
async function ensureDB() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    try {
      const count = await Log.countDocuments();
      if (count === 0) {
        await seedData(300);
      }
    } catch (err) {
      console.error('Auto-seed error:', err);
    }
  }
}

app.use(async (req, res, next) => {
  await ensureDB();
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/alerts', alertRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

export default app;
