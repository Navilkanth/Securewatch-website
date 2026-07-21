import { motion } from 'framer-motion';
import {
  FileText, AlertTriangle, Shield, CheckCircle, XCircle, Calendar, Users, Globe, Activity, Upload, Heart,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { dashboardApi } from '../services/api';
import { Card, CardHeader } from '../components/ui/Card';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import {
  SeverityBarChart, RegionPieChart, ActionsBarChart, StatusDonutChart,
} from '../components/charts/Charts';

const KPI_CONFIG = [
  { key: 'totalLogs', label: 'Total Logs', icon: FileText, color: 'text-primary-400', trend: 5.2 },
  { key: 'criticalLogs', label: 'Critical', icon: AlertTriangle, color: 'text-red-400', trend: -12.5 },
  { key: 'highSeverity', label: 'High Severity', icon: Shield, color: 'text-orange-400', trend: 2.1 },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-400', trend: 8.4 },
  { key: 'unresolved', label: 'Unresolved', icon: XCircle, color: 'text-red-400', trend: -4.3 },
  { key: 'todayLogs', label: "Today's Logs", icon: Calendar, color: 'text-blue-400', trend: 15.2 },
  { key: 'uniqueUsers', label: 'Unique Users', icon: Users, color: 'text-purple-400', trend: 0 },
  { key: 'uniqueRegions', label: 'Unique Regions', icon: Globe, color: 'text-cyan-400', trend: 0 },
];

function TrendIndicator({ value }) {
  if (!value) return <span className="flex items-center gap-0.5 text-[10px] text-slate-500"><Minus className="w-3 h-3" /> 0%</span>;
  const isPositive = value > 0;
  const isBad = (isPositive); // Example simplistic logic
  
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  );
}

export default function Dashboard() {
  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 30000,
  });

  if (isLoading) return <DashboardSkeleton />;

  const { kpis, charts, recentAlerts, recentActivities, recentUploads, systemHealth } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 light:text-slate-900">Security Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time overview • Auto-refreshes every 30s • Last updated {format(dataUpdatedAt, 'HH:mm:ss')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-medium tracking-wide">SYSTEM LIVE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {KPI_CONFIG.map((kpi, i) => {
          const Icon = kpi.icon;
          // Reverse good/bad logic for unresolved/critical/high
          const isNegativeMetric = ['criticalLogs', 'highSeverity', 'unresolved'].includes(kpi.key);
          const trendColor = kpi.trend > 0 
            ? (isNegativeMetric ? 'text-red-400' : 'text-green-400')
            : (kpi.trend < 0 ? (isNegativeMetric ? 'text-green-400' : 'text-red-400') : 'text-slate-500');

          return (
            <motion.div
              key={kpi.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="!p-4 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                  </div>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <p className="text-2xl font-bold text-slate-100 light:text-slate-900 leading-none">
                    {(kpis?.[kpi.key] || 0).toLocaleString()}
                  </p>
                  {kpi.trend !== 0 && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trendColor}`}>
                      {kpi.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(kpi.trend)}%
                    </span>
                  )}
                  {kpi.trend === 0 && (
                     <span className="flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                     <Minus className="w-3 h-3" /> 0%
                   </span>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover>
          <CardHeader title="Severity Distribution" subtitle="Breakdown by severity level" />
          <SeverityBarChart data={charts?.severityDistribution} />
        </Card>
        <Card hover>
          <CardHeader title="Region Distribution" subtitle="Log activity by region" />
          <RegionPieChart data={charts?.regionDistribution} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover>
          <CardHeader title="Top Actions" subtitle="Most frequent audit actions" />
          <ActionsBarChart data={charts?.actionsDistribution} />
        </Card>
        <Card hover>
          <CardHeader title="Status Overview" subtitle="Resolution status breakdown" />
          <StatusDonutChart data={charts?.statusDistribution} />
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card hover>
          <CardHeader title="Recent Alerts" subtitle="Critical & high severity" />
          <div className="space-y-2">
            {recentAlerts?.length ? recentAlerts.map((alert) => (
              <div key={alert.id || alert._id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 text-sm hover:bg-slate-800/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-slate-300 font-medium truncate">{alert.action}</p>
                  <p className="text-xs text-slate-500 truncate">{alert.actor}</p>
                </div>
                <SeverityBadge severity={alert.severity} />
              </div>
            )) : <p className="text-sm text-slate-500 py-4 text-center">No recent alerts</p>}
          </div>
        </Card>

        <Card hover>
          <CardHeader title="Recent Activities" subtitle="Latest audit events" />
          <div className="space-y-2">
            {recentActivities?.length ? recentActivities.map((act) => (
              <div key={act.id || act._id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 text-sm hover:bg-slate-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                   <Activity className="w-4 h-4 text-primary-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-300 font-medium truncate">{act.action}</p>
                  <p className="text-xs text-slate-500">{format(new Date(act.timestamp), 'MMM dd, HH:mm')}</p>
                </div>
                <StatusBadge status={act.status} />
              </div>
            )) : <p className="text-sm text-slate-500 py-4 text-center">No recent activities</p>}
          </div>
        </Card>

        <Card hover>
          <CardHeader title="System Health" subtitle="Platform status" />
          <div className="space-y-3">
            <HealthItem label="API Status" value={systemHealth?.status || 'operational'} status="ok" />
            <HealthItem label="Database" value={systemHealth?.dbConnected ? 'Connected' : 'Disconnected'} status={systemHealth?.dbConnected ? 'ok' : 'error'} />
            <HealthItem label="Last Sync" value={systemHealth?.lastSync ? format(new Date(systemHealth.lastSync), 'HH:mm:ss') : '—'} />
            <HealthItem label="Server Uptime" value={`${Math.floor((systemHealth?.uptime || 0) / 60)}m`} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <CardHeader title="Recent Uploads" />
            {recentUploads?.length ? recentUploads.map((u) => (
              <div key={u._id} className="flex items-center gap-3 py-2 text-xs hover:bg-slate-800/30 rounded-lg px-2 -mx-2 transition-colors">
                <Upload className="w-3 h-3 text-slate-500" />
                <span className="text-slate-300 truncate flex-1 font-medium">{u.filename}</span>
                <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">+{u.successCount}</span>
              </div>
            )) : <p className="text-xs text-slate-500">No uploads yet</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function HealthItem({ label, value, status }) {
  return (
    <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-800/20 border border-slate-700/30">
      <span className="text-slate-400 flex items-center gap-2">
        {status === 'ok' && <Heart className="w-3.5 h-3.5 text-green-400" />}
        {status === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
        {!status && <Activity className="w-3.5 h-3.5 text-blue-400" />}
        {label}
      </span>
      <span className={`capitalize font-medium ${status === 'error' ? 'text-red-400' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  );
}
