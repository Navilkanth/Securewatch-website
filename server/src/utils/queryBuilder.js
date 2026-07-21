export function buildLogFilter(query) {
  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { actor: searchRegex },
      { action: searchRegex },
      { resource: searchRegex },
      { ipAddress: searchRegex },
      { region: searchRegex },
    ];
  }

  if (query.actor) filter.actor = new RegExp(query.actor, 'i');
  if (query.severity) {
    const severities = query.severity.split(',').map((s) => s.trim().toUpperCase());
    filter.severity = { $in: severities };
  }
  if (query.role) {
    const roles = query.role.split(',').map((r) => r.trim().toLowerCase());
    filter.role = { $in: roles };
  }
  if (query.status) {
    const statuses = query.status.split(',').map((s) => s.trim());
    filter.status = { $in: statuses };
  }
  if (query.region) {
    const regions = query.region.split(',').map((r) => r.trim());
    filter.region = { $in: regions };
  }
  if (query.action) {
    const actions = query.action.split(',').map((a) => a.trim());
    filter.action = { $in: actions };
  }
  if (query.resourceType) {
    filter.resourceType = query.resourceType;
  }

  if (query.dateFrom || query.dateTo) {
    filter.timestamp = {};
    if (query.dateFrom) filter.timestamp.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.timestamp.$lte = new Date(query.dateTo);
  }

  // Alerts page filters
  if (query.alertsOnly === 'true') {
    filter.severity = { $in: ['CRITICAL', 'HIGH'] };
    filter.status = { $in: ['Unresolved', 'Investigating'] };
  }

  return filter;
}

export function buildSort(query) {
  let sortField = 'timestamp';
  let sortOrder = -1;

  if (query.sort) {
    const [field, order] = query.sort.split(':');
    sortField = field || 'timestamp';
    sortOrder = order === 'asc' ? 1 : -1;
  } else if (query.sortBy) {
    sortField = query.sortBy;
    sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  }

  const allowedFields = ['timestamp', 'severity', 'actor', 'status', 'riskScore', 'action', 'region'];
  const field = allowedFields.includes(sortField) ? sortField : 'timestamp';

  if (field === 'severity') {
    return { severityOrder: sortOrder, timestamp: -1 };
  }

  return { [field]: sortOrder };
}

export function getPagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 25));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
