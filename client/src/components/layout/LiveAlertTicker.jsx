import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, ShieldAlert, Radio } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { SeverityBadge } from '../ui/Badge';
import { format } from 'date-fns';

const SEVERITY_ICON = {
  CRITICAL: { icon: ShieldAlert, color: 'text-red-400 light:text-red-600', dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]' },
  HIGH:     { icon: AlertTriangle, color: 'text-orange-400 light:text-orange-600', dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]' },
};

export function LiveAlertTicker() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,   // re-fetch every 30 s
    staleTime: 25000,
  });

  const alerts = data?.recentAlerts;
  if (!alerts?.length) return null;

  // Duplicate for seamless infinite loop
  const items = [...alerts, ...alerts, ...alerts];
  const duration = Math.max(25, alerts.length * 6);

  return (
    <div
      className="relative z-30 h-9 flex items-center overflow-hidden bg-[#080d1a] border-b border-slate-700/60 light:bg-white light:border-slate-200"
    >
      {/* ── "LIVE THREATS" label ── */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full bg-red-600/90 border-r border-red-500/40 light:bg-red-50 light:border-red-100 z-20">
        <Radio className="w-3.5 h-3.5 text-white light:text-red-600 animate-pulse" />
        <span className="text-[10px] font-black text-white light:text-red-700 uppercase tracking-widest whitespace-nowrap">
          Live Threats
        </span>
      </div>

      {/* ── Scrolling track ── */}
      <div className="flex-1 relative overflow-hidden h-full flex items-center z-10">
        {/* Left fade inside track */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#080d1a] light:from-white to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex items-center gap-10 w-max px-6"
          animate={{ x: ['0%', '-33.33%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration }}
        >
          {items.map((alert, i) => {
            const cfg = SEVERITY_ICON[alert.severity] || SEVERITY_ICON.HIGH;
            const Icon = cfg.icon;
            return (
              <div key={`${alert.id || alert._id}-${i}`} className="flex items-center gap-2 select-none">
                {/* Pulsing dot */}
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse ${cfg.dot}`} />
                {/* Severity icon */}
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
                {/* Action */}
                <span className="text-xs font-semibold text-slate-200 light:text-slate-800 whitespace-nowrap">
                  {alert.action}
                </span>
                <span className="text-[10px] text-slate-500 light:text-slate-400">by</span>
                {/* Actor */}
                <span className="text-[11px] font-mono text-slate-300 light:text-slate-700 whitespace-nowrap">
                  {alert.actor}
                </span>
                {/* Badge */}
                <SeverityBadge severity={alert.severity} />
                {/* Timestamp */}
                {alert.timestamp && (
                  <span className="text-[10px] text-slate-600 light:text-slate-500 whitespace-nowrap">
                    {format(new Date(alert.timestamp), 'HH:mm')}
                  </span>
                )}
                {/* Divider */}
                <span className="text-slate-700 light:text-slate-300 text-lg font-thin select-none">|</span>
              </div>
            );
          })}
        </motion.div>

        {/* Right fade inside track */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#080d1a] light:from-white to-transparent z-10 pointer-events-none" />
      </div>

      {/* ── Alert count pill ── */}
      <div className="flex-shrink-0 flex items-center gap-1 px-3 h-full border-l border-slate-700/60 light:border-slate-200 z-20">
        <Activity className="w-3.5 h-3.5 text-red-400 light:text-red-500 animate-pulse" />
        <span className="text-[10px] font-bold text-red-400 light:text-red-600 whitespace-nowrap">
          {alerts.length} active
        </span>
      </div>
    </div>
  );
}
