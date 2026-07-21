import { cn } from '../../utils/cn';

export function Input({ className, icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      )}
      <input
        className={cn(
          'w-full bg-navy-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all',
          'light:bg-white light:border-slate-300 light:text-slate-900',
          Icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'bg-navy-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50',
        'light:bg-white light:border-slate-300 light:text-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
