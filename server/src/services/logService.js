import Log from '../models/Log.js';
import UploadHistory from '../models/UploadHistory.js';
import { calculateRiskScore, getRiskLevel } from '../utils/riskScore.js';
import { generateAISummary } from '../utils/aiSummary.js';
import { buildLogFilter, buildSort, getPagination } from '../utils/queryBuilder.js';

const REQUIRED_FIELDS = ['actor', 'role', 'action', 'resource', 'resourceType', 'ipAddress', 'region', 'severity', 'timestamp'];

function validateLogRecord(record, index) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (!record[field]) {
      errors.push({ index, field, message: `Missing required field: ${field}` });
    }
  }
  if (record.severity && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(record.severity.toUpperCase())) {
    errors.push({ index, field: 'severity', message: 'Invalid severity value' });
  }
  return errors;
}

function normalizeLog(record) {
  const normalized = {
    actor: String(record.actor).trim(),
    role: String(record.role).trim().toLowerCase(),
    action: String(record.action).trim().toUpperCase(),
    resource: String(record.resource).trim(),
    resourceType: String(record.resourceType).trim().toUpperCase(),
    ipAddress: String(record.ipAddress).trim(),
    region: String(record.region).trim().toLowerCase(),
    severity: String(record.severity).trim().toUpperCase(),
    status: record.status ? String(record.status).trim() : 'Unresolved',
    timestamp: new Date(record.timestamp),
    investigationNotes: record.investigationNotes || '',
  };
  normalized.riskScore = calculateRiskScore(normalized);
  normalized.aiSummary = generateAISummary(normalized);
  return normalized;
}

export async function uploadLogs(records, filename = 'upload', fileType = 'JSON') {
  const errors = [];
  const validRecords = [];

  records.forEach((record, index) => {
    const validationErrors = validateLogRecord(record, index);
    if (validationErrors.length > 0) {
      errors.push(...validationErrors.map((e) => ({ record, message: e.message })));
    } else {
      try {
        validRecords.push(normalizeLog(record));
      } catch (err) {
        errors.push({ record, message: err.message });
      }
    }
  });

  let inserted = [];
  if (validRecords.length > 0) {
    inserted = await Log.insertMany(validRecords, { ordered: false });
  }

  const uploadRecord = await UploadHistory.create({
    filename,
    fileType,
    totalRecords: records.length,
    successCount: inserted.length,
    failureCount: errors.length,
    errors: errors.slice(0, 100),
    status: errors.length === 0 ? 'completed' : inserted.length > 0 ? 'partial' : 'failed',
  });

  return {
    uploadId: uploadRecord._id,
    totalRecords: records.length,
    successCount: inserted.length,
    failureCount: errors.length,
    errors: errors.slice(0, 50),
    failedRecords: errors.slice(0, 50).map((e) => e.record),
  };
}

export async function getLogs(query) {
  const filter = buildLogFilter(query);
  const sort = buildSort(query);
  const { page, limit, skip } = getPagination(query);

  let pipeline = [{ $match: filter }];

  if (sort.severityOrder !== undefined) {
    pipeline.push({
      $addFields: {
        severityOrder: {
          $switch: {
            branches: [
              { case: { $eq: ['$severity', 'CRITICAL'] }, then: 4 },
              { case: { $eq: ['$severity', 'HIGH'] }, then: 3 },
              { case: { $eq: ['$severity', 'MEDIUM'] }, then: 2 },
              { case: { $eq: ['$severity', 'LOW'] }, then: 1 },
            ],
            default: 0,
          },
        },
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const dataPipeline = [
    ...pipeline,
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    { $project: { severityOrder: 0 } },
  ];

  const [countResult, logs] = await Promise.all([
    Log.aggregate(countPipeline),
    Log.aggregate(dataPipeline),
  ]);

  const total = countResult[0]?.total || 0;

  return {
    logs: logs.map((log) => ({
      ...log,
      id: log._id,
      riskLevel: getRiskLevel(log.riskScore),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getLogById(id) {
  const log = await Log.findById(id).lean();
  if (!log) return null;

  const relatedActivities = await Log.find({
    actor: log.actor,
    _id: { $ne: log._id },
  })
    .sort({ timestamp: -1 })
    .limit(20)
    .lean();

  const timeline = await Log.find({ actor: log.actor })
    .sort({ timestamp: -1 })
    .limit(50)
    .select('action resource severity status timestamp riskScore')
    .lean();

  return {
    ...log,
    id: log._id,
    riskLevel: getRiskLevel(log.riskScore),
    aiSummary: log.aiSummary || generateAISummary(log),
    relatedActivities: relatedActivities.map((r) => ({ ...r, id: r._id })),
    timeline: timeline.map((t) => ({ ...t, id: t._id })),
  };
}

export async function updateLog(id, updates) {
  const allowed = ['status', 'investigationNotes', 'assignedTo', 'severity'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }

  const existing = await Log.findById(id);
  if (!existing) return null;

  Object.assign(existing, sanitized);
  existing.riskScore = calculateRiskScore(existing.toObject());
  existing.aiSummary = generateAISummary(existing.toObject());
  await existing.save();

  const result = existing.toObject();
  return { ...result, id: result._id, riskLevel: getRiskLevel(result.riskScore) };
}

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalLogs,
    criticalLogs,
    highSeverity,
    resolved,
    unresolved,
    todayLogs,
    uniqueUsers,
    uniqueRegions,
    severityDistribution,
    regionDistribution,
    actionsDistribution,
    statusDistribution,
    recentAlerts,
    recentActivities,
    recentUploads,
  ] = await Promise.all([
    Log.countDocuments(),
    Log.countDocuments({ severity: 'CRITICAL' }),
    Log.countDocuments({ severity: 'HIGH' }),
    Log.countDocuments({ status: 'Resolved' }),
    Log.countDocuments({ status: 'Unresolved' }),
    Log.countDocuments({ timestamp: { $gte: today } }),
    Log.distinct('actor').then((a) => a.length),
    Log.distinct('region').then((r) => r.length),
    Log.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Log.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Log.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Log.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Log.find({ severity: { $in: ['CRITICAL', 'HIGH'] }, status: 'Unresolved' })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean(),
    Log.find().sort({ timestamp: -1 }).limit(8).lean(),
    UploadHistory.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    kpis: {
      totalLogs,
      criticalLogs,
      highSeverity,
      resolved,
      unresolved,
      todayLogs,
      uniqueUsers,
      uniqueRegions,
    },
    charts: {
      severityDistribution: severityDistribution.map((s) => ({ name: s._id, value: s.count })),
      regionDistribution: regionDistribution.map((r) => ({ name: r._id, value: r.count })),
      actionsDistribution: actionsDistribution.map((a) => ({ name: a._id, value: a.count })),
      statusDistribution: statusDistribution.map((s) => ({ name: s._id, value: s.count })),
    },
    recentAlerts: recentAlerts.map((a) => ({ ...a, id: a._id })),
    recentActivities: recentActivities.map((a) => ({ ...a, id: a._id })),
    recentUploads,
    systemHealth: {
      status: 'operational',
      uptime: process.uptime(),
      dbConnected: true,
      lastSync: new Date().toISOString(),
    },
  };
}

export async function getAnalytics() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    logsPerHour,
    logsPerDay,
    actionsDistribution,
    severityTrends,
    regionHeatmap,
    mostActiveUsers,
    topIPs,
  ] = await Promise.all([
    Log.aggregate([
      { $match: { timestamp: { $gte: twentyFourHoursAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%H:00', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Log.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Log.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ]),
    Log.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, severity: '$severity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]),
    Log.aggregate([
      {
        $group: {
          _id: { region: '$region', severity: '$severity' },
          count: { $sum: 1 },
        },
      },
    ]),
    Log.aggregate([
      { $group: { _id: '$actor', count: { $sum: 1 }, lastSeen: { $max: '$timestamp' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Log.aggregate([
      { $group: { _id: '$ipAddress', count: { $sum: 1 }, regions: { $addToSet: '$region' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const severityTrendMap = {};
  severityTrends.forEach((item) => {
    const date = item._id.date;
    if (!severityTrendMap[date]) severityTrendMap[date] = { date };
    severityTrendMap[date][item._id.severity] = item.count;
  });

  return {
    logsPerHour: logsPerHour.map((h) => ({ hour: h._id, count: h.count })),
    logsPerDay: logsPerDay.map((d) => ({ date: d._id, count: d.count })),
    actionsDistribution: actionsDistribution.map((a) => ({ name: a._id, value: a.count })),
    severityTrends: Object.values(severityTrendMap),
    regionHeatmap: regionHeatmap.map((r) => ({
      region: r._id.region,
      severity: r._id.severity,
      count: r.count,
    })),
    mostActiveUsers: mostActiveUsers.map((u) => ({
      actor: u._id,
      count: u.count,
      lastSeen: u.lastSeen,
    })),
    topIPs: topIPs.map((ip) => ({
      ipAddress: ip._id,
      count: ip.count,
      regions: ip.regions,
    })),
  };
}

export async function getFilterOptions() {
  const [roles, regions, actions, resourceTypes] = await Promise.all([
    Log.distinct('role'),
    Log.distinct('region'),
    Log.distinct('action'),
    Log.distinct('resourceType'),
  ]);
  return { roles, regions, actions, resourceTypes };
}

export async function getUploadHistory() {
  return UploadHistory.find().sort({ createdAt: -1 }).limit(20).lean();
}

export async function dismissAlert(id) {
  return updateLog(id, { status: 'Resolved' });
}
