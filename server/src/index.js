import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import logRoutes from './routes/logRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import Log from './models/Log.js';
import { seedData } from './scripts/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));

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

async function start() {
  await connectDB();
  
  // Auto-seed if database is empty
  try {
    const count = await Log.countDocuments();
    if (count === 0) {
      console.log('Database is empty, automatically seeding sample data...');
      await seedData(500); // 500 records is plenty for the dashboard
    }
  } catch (err) {
    console.error('Error during auto-seeding:', err);
  }

  app.listen(PORT, () => {
    console.log(`SecureWatch API running on http://localhost:${PORT}`);
  });
}

start();
