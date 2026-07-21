const SEVERITY_POINTS = { CRITICAL: 10, HIGH: 7, MEDIUM: 4, LOW: 2 };
const ACTION_POINTS = {
  DELETE_USER: 5,
  FAILED_LOGIN: 3,
  GRANT_ADMIN: 5,
  EXPORT_DATA: 4,
  MODIFY_POLICY: 4,
  ACCESS_DENIED: 2,
  LOGIN: 1,
  LOGOUT: 0,
  VIEW_RESOURCE: 1,
  CREATE_USER: 2,
  UPDATE_USER: 2,
};
const ROLE_POINTS = { admin: 4, superadmin: 5, manager: 3, user: 1, guest: 0 };
const KNOWN_REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-southeast-1'];

export function calculateRiskScore(log) {
  let score = SEVERITY_POINTS[log.severity?.toUpperCase()] || 0;
  score += ACTION_POINTS[log.action?.toUpperCase()] || 1;
  score += ROLE_POINTS[log.role?.toLowerCase()] || 0;
  if (log.region && !KNOWN_REGIONS.includes(log.region.toLowerCase())) {
    score += 2;
  }
  if (log.status === 'Unresolved') score += 2;
  return Math.min(score, 100);
}

export function getRiskLevel(score) {
  if (score >= 20) return 'Critical';
  if (score >= 15) return 'High';
  if (score >= 10) return 'Medium';
  return 'Low';
}
