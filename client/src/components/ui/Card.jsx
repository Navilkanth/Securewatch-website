import { cn } from '../../utils/cn';

export function Card({ children, className, hover }) {
  return (
    <div
      className={cn(
        'glass rounded-xl p-5',
        hover && 'card-hover cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 light:text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 light:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
