import { cn } from '../../utils/cn';

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-slate-700/50 text-slate-300 border-slate-600/50 light:bg-slate-100 light:text-slate-700 light:border-slate-300',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30 light:bg-red-50 light:text-red-700 light:border-red-300',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30 light:bg-orange-50 light:text-orange-700 light:border-orange-300',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 light:bg-yellow-50 light:text-yellow-700 light:border-yellow-300',
    low: 'bg-green-500/20 text-green-400 border-green-500/30 light:bg-green-50 light:text-green-700 light:border-green-300',
    primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30 light:bg-blue-50 light:text-blue-700 light:border-blue-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const map = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
  };
  return <Badge variant={map[severity] || 'default'}>{severity}</Badge>;
}

export function StatusBadge({ status }) {
  const map = {
    Resolved: 'low',
    Unresolved: 'critical',
    Investigating: 'primary',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
}

export function RiskBadge({ score, level }) {
  const colors = {
    Critical: 'bg-red-600 text-white border-red-700',
    High: 'bg-orange-500 text-white border-orange-600',
    Medium: 'bg-yellow-500 text-black border-yellow-600',
    Low: 'bg-green-600 text-white border-green-700',
  };
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border',
      colors[level] || colors.Low
    )}>
      <span>{level}</span>
      <span className="opacity-75">({score})</span>
    </span>
  );
}
