export const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export const STATUS_COLORS = {
  Resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  Unresolved: 'bg-red-500/20 text-red-400 border-red-500/30',
  Investigating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const RISK_COLORS = {
  Critical: 'bg-red-600 text-white',
  High: 'bg-orange-500 text-white',
  Medium: 'bg-yellow-500 text-black',
  Low: 'bg-green-500 text-white',
};

export const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
export const STATUSES = ['Resolved', 'Unresolved', 'Investigating'];
export const SORT_OPTIONS = [
  { value: 'timestamp:desc', label: 'Newest First' },
  { value: 'timestamp:asc', label: 'Oldest First' },
  { value: 'severity:desc', label: 'Severity (High to Low)' },
  { value: 'actor:asc', label: 'Actor (A-Z)' },
  { value: 'status:asc', label: 'Status' },
];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/audit-logs', label: 'Audit Logs', icon: 'FileText' },
  { path: '/investigation', label: 'Investigation', icon: 'Search' },
  { path: '/alerts', label: 'Alerts', icon: 'Bell' },
  { path: '/upload', label: 'Upload Logs', icon: 'Upload' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];
