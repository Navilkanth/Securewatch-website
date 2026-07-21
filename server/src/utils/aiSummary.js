const ACTION_DESCRIPTIONS = {
  DELETE_USER: 'deleted a user account',
  FAILED_LOGIN: 'attempted a failed login',
  GRANT_ADMIN: 'granted admin privileges',
  EXPORT_DATA: 'exported sensitive data',
  MODIFY_POLICY: 'modified a security policy',
  ACCESS_DENIED: 'was denied access to a resource',
  LOGIN: 'logged into the system',
  LOGOUT: 'logged out of the system',
  VIEW_RESOURCE: 'viewed a resource',
  CREATE_USER: 'created a new user account',
  UPDATE_USER: 'updated a user account',
};

export function generateAISummary(log) {
  const action = ACTION_DESCRIPTIONS[log.action] || `performed action "${log.action}"`;
  const roleLabel = log.role ? `${log.role}` : 'unknown role';
  const severity = log.severity || 'UNKNOWN';
  const status = log.status || 'Unknown';
  const region = log.region || 'unknown region';
  const ip = log.ipAddress || 'unknown IP';

  const isInternal = ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');

  let summary = `${roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)} (${log.actor}) ${action} `;
  summary += `on resource "${log.resource}" from ${isInternal ? 'an internal' : 'an external'} IP address (${ip}) `;
  summary += `in region ${region}. `;
  summary += `The event is classified as ${severity} severity and remains ${status.toLowerCase()}. `;

  if (severity === 'CRITICAL' || severity === 'HIGH') {
    summary += 'Security engineers should immediately verify whether this activity was authorized and investigate related events.';
  } else if (status === 'Unresolved') {
    summary += 'Review this event during the next security audit cycle.';
  } else {
    summary += 'No immediate action required.';
  }

  return summary;
}
