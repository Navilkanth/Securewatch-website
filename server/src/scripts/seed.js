import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Log from '../models/Log.js';
import UploadHistory from '../models/UploadHistory.js';
import { calculateRiskScore } from '../utils/riskScore.js';
import { generateAISummary } from '../utils/aiSummary.js';

dotenv.config();

const ACTORS = [
  'priya.nair@company.com',
  'john.doe@company.com',
  'sarah.chen@company.com',
  'mike.wilson@company.com',
  'emma.davis@company.com',
  'alex.kumar@company.com',
  'lisa.park@company.com',
  'david.lee@company.com',
  'anna.smith@company.com',
  'raj.patel@company.com',
];

const ROLES = ['admin', 'superadmin', 'manager', 'user', 'guest'];
const ACTIONS = [
  'DELETE_USER', 'FAILED_LOGIN', 'GRANT_ADMIN', 'EXPORT_DATA',
  'MODIFY_POLICY', 'ACCESS_DENIED', 'LOGIN', 'LOGOUT',
  'VIEW_RESOURCE', 'CREATE_USER', 'UPDATE_USER',
];
const RESOURCE_TYPES = ['USER', 'POLICY', 'DATA', 'SYSTEM', 'API'];
const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-southeast-1', 'unknown-region'];
const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['Resolved', 'Unresolved', 'Investigating'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomIP() {
  if (Math.random() > 0.3) {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function generateRecord(index) {
  const actor = randomItem(ACTORS);
  const role = randomItem(ROLES);
  const action = randomItem(ACTIONS);
  const severity = randomItem(SEVERITIES);
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);
  timestamp.setHours(timestamp.getHours() - hoursAgo);

  const record = {
    actor,
    role,
    action,
    resource: `/api/${randomItem(['users', 'policies', 'data', 'system'])}/${Math.floor(Math.random() * 1000)}`,
    resourceType: randomItem(RESOURCE_TYPES),
    ipAddress: randomIP(),
    region: randomItem(REGIONS),
    severity,
    status: randomItem(STATUSES),
    timestamp,
    investigationNotes: '',
  };

  record.riskScore = calculateRiskScore(record);
  record.aiSummary = generateAISummary(record);
  return record;
}

export async function seedData(count = 1000) {
  console.log(`Generating ${count} sample logs...`);

  await Log.deleteMany({});
  await UploadHistory.deleteMany({});

  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < count; i += batchSize) {
    const batch = [];
    const end = Math.min(i + batchSize, count);
    for (let j = i; j < end; j++) {
      batch.push(generateRecord(j));
    }
    await Log.insertMany(batch);
    inserted += batch.length;
    console.log(`Inserted ${inserted}/${count} records`);
  }

  await UploadHistory.create({
    filename: 'seed-data.json',
    fileType: 'JSON',
    totalRecords: count,
    successCount: count,
    failureCount: 0,
    status: 'completed',
  });

  console.log(`Seed complete: ${count} logs created`);
}

async function runStandaloneSeed() {
  await connectDB();
  const count = parseInt(process.argv[2], 10) || 1000;
  await seedData(count);
  await mongoose.disconnect();
}

// Only run standalone if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runStandaloneSeed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
