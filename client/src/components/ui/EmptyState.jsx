import { cn } from '../../utils/cn';
import { AlertCircle } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title = 'No data found',
  description = 'Nothing to display here.',
  actionLabel,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
        {Icon ? (
          <Icon className="w-8 h-8 text-slate-500" />
        ) : (
          <AlertCircle className="w-8 h-8 text-slate-500" />
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && action && (
        <button
          onClick={action}
          className="mt-4 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
